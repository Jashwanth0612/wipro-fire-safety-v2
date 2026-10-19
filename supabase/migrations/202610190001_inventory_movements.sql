-- Apply to V2 after the existing schema. Does not invent or change current stock.
begin;
create table public.stock_movements (
 id uuid primary key default gen_random_uuid(),
 request_id uuid unique not null,
 product_id uuid not null references public.products(id),
 kind text not null check(kind in ('receipt','dispatch','count','opening')),
 quantity integer not null check(quantity between 0 and 1000000),
 previous_stock integer,
 balance integer not null check(balance between 0 and 1000000),
 reference text not null check(char_length(reference) between 1 and 120),
 note text not null default '' check(char_length(note)<=500),
 actor_id uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now()
);
create index stock_movements_product_date on public.stock_movements(product_id,created_at desc,id);
alter table public.stock_movements enable row level security;
revoke all on public.stock_movements from anon, authenticated;
grant select on public.stock_movements to authenticated;
grant all on public.stock_movements to service_role;
create policy staff_stock_history on public.stock_movements for select to authenticated using
 (exists(select 1 from public.staff_members where user_id=(select auth.uid())));
-- Existing staff can edit catalogue metadata, but stock must use the atomic function.
revoke update on public.products from authenticated;
grant update(title,description,category,image_url,slug,"minStock",unit,archived) on public.products to authenticated;

create function public.record_stock_movement(p_request_id uuid,p_product_id uuid,p_kind text,p_quantity integer,p_reference text,p_note text,p_expected_stock integer)
returns public.stock_movements language plpgsql security definer set search_path = '' as $$
declare item public.products; result public.stock_movements; next_stock integer;
begin
 if auth.uid() is null or not exists(select 1 from public.staff_members where user_id=auth.uid()) then
  raise sqlstate '42501' using message='Staff access required';
 end if;
 if p_request_id is null or p_product_id is null or p_kind is null or p_kind not in ('receipt','dispatch','count') or p_quantity is null or p_quantity<0 or p_quantity>1000000 or (p_kind<>'count' and p_quantity=0) or p_reference is null or char_length(trim(p_reference)) not between 1 and 120 or p_note is null or char_length(p_note)>500 then
  raise sqlstate 'PT422' using message='Invalid stock movement';
 end if;
 -- Serializes duplicate retries, including requests aimed at different products.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_request_id::text,0));
 select * into result from public.stock_movements where request_id=p_request_id;
 if found then
  if result.actor_id is distinct from auth.uid() or result.product_id<>p_product_id or result.kind<>p_kind or result.quantity<>p_quantity or result.reference<>trim(p_reference) or result.note<>p_note or (p_kind='count' and result.previous_stock is distinct from p_expected_stock) then
   raise sqlstate 'PT409' using message='Request reference already used';
  end if;
  return result;
 end if;
 select * into item from public.products where id=p_product_id and archived=false for update;
 if not found then raise sqlstate 'PT404' using message='Product not found'; end if;
 if p_kind='count' then
  if item.stock is distinct from p_expected_stock then raise sqlstate 'PT409' using message='Stock changed. Refresh before recording a count'; end if;
  next_stock:=p_quantity;
 else
  if item.stock is null then raise sqlstate 'PT409' using message='Record an opening physical count first'; end if;
  next_stock:=item.stock+case when p_kind='receipt' then p_quantity else -p_quantity end;
 end if;
 if next_stock<0 or next_stock>1000000 then raise sqlstate 'PT409' using message='Quantity would exceed available stock or the stock limit'; end if;
 update public.products set stock=next_stock where id=p_product_id;
 insert into public.stock_movements(request_id,product_id,kind,quantity,previous_stock,balance,reference,note,actor_id)
 values(p_request_id,p_product_id,p_kind,p_quantity,item.stock,next_stock,trim(p_reference),p_note,auth.uid()) returning * into result;
 return result;
end $$;
revoke all on function public.record_stock_movement(uuid,uuid,text,integer,text,text,integer) from public,anon,authenticated;
grant execute on function public.record_stock_movement(uuid,uuid,text,integer,text,text,integer) to authenticated;

-- Initial stock entered during product creation also gets a permanent history row.
create function public.log_product_opening_stock() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.stock is not null then
  insert into public.stock_movements(request_id,product_id,kind,quantity,previous_stock,balance,reference,actor_id)
  values(gen_random_uuid(),new.id,'opening',new.stock,null,new.stock,'Product opening balance',auth.uid());
 end if;
 return new;
end $$;
revoke all on function public.log_product_opening_stock() from public,anon,authenticated;
create trigger product_opening_stock after insert on public.products for each row execute function public.log_product_opening_stock();
-- Preserve any previously recorded balance as a labelled migration baseline.
insert into public.stock_movements(request_id,product_id,kind,quantity,previous_stock,balance,reference,note)
select gen_random_uuid(),id,'opening',stock,null,stock,'Migration baseline','Existing balance at activation; historical movements unavailable'
from public.products where stock is not null;
commit;
