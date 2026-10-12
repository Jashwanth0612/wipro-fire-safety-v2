-- Run with psql -v ON_ERROR_STOP=1 against a TEST Supabase project after migration.
-- All fixtures roll back. Failure aborts the transaction. No pgTAP extension needed.
begin;
insert into auth.users(id) values ('10000000-0000-4000-8000-000000000001'), ('10000000-0000-4000-8000-000000000002');
insert into public.staff_members(user_id) values ('10000000-0000-4000-8000-000000000001');
insert into public.contact_inquiries(id,name,email,phone,message) values
 ('20000000-0000-4000-8000-000000000001','RLS test','test@example.invalid','9999999999','Rollback-only fixture');
insert into public.products(id,title,description,category,archived) values
 ('30000000-0000-4000-8000-000000000001','Visible fixture','Test','Test',false),
 ('30000000-0000-4000-8000-000000000002','Archived fixture','Test','Test',true);
set local role anon;
do $$ begin
  if (select count(*) from public.products where id::text like '30000000-%') <> 1 then raise exception 'Anonymous catalogue filtering failed'; end if;
  begin perform * from public.contact_inquiries; raise exception 'Anonymous enquiries leaked'; exception when insufficient_privilege then null; end;
  begin insert into public.contact_inquiries(name,email,phone,message) values ('Attack','a@b.c','9999999999','Direct'); raise exception 'Anonymous direct insert allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
do $$ begin
  if exists(select 1 from public.contact_inquiries) then raise exception 'Nonstaff enquiries leaked'; end if;
  if exists(select 1 from public.staff_members) then raise exception 'Staff membership leaked'; end if;
  begin insert into public.staff_members(user_id) values ('10000000-0000-4000-8000-000000000002'); raise exception 'Self promotion allowed'; exception when insufficient_privilege then null; end;
  begin insert into public.products(title,description,category) values ('Attack','Attack','Attack'); raise exception 'Nonstaff product insert allowed'; exception when insufficient_privilege then null; end;
  update public.products set stock=999 where id='30000000-0000-4000-8000-000000000001';
  if found then raise exception 'Nonstaff product edit allowed'; end if;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
do $$ begin
  if not exists(select 1 from public.contact_inquiries where id='20000000-0000-4000-8000-000000000001') then raise exception 'Staff cannot read enquiries'; end if;
  update public.contact_inquiries set status='contacted' where id='20000000-0000-4000-8000-000000000001';
  if not found then raise exception 'Staff status edit denied'; end if;
  begin update public.contact_inquiries set message='Tampered'; raise exception 'Staff can overwrite enquiry'; exception when insufficient_privilege then null; end;
  update public.products set stock=0 where id='30000000-0000-4000-8000-000000000001';
  if not found then raise exception 'Staff inventory edit denied'; end if;
  begin delete from public.products; raise exception 'Permanent delete allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
