-- Run inside a transaction after the inventory migration. All fixtures are rolled back.
savepoint inventory_test;
insert into auth.users(id) values('10000000-0000-4000-8000-000000000019');
insert into public.staff_members(user_id) values('10000000-0000-4000-8000-000000000019');
insert into public.products(id,title,description,category) values('30000000-0000-4000-8000-000000000019','Inventory verification fixture','Temporary test, rolled back','Test');
set local role anon;
do $$ begin
 begin perform * from public.stock_movements; raise exception 'Anonymous history exposed'; exception when insufficient_privilege then null; end;
 begin perform public.record_stock_movement(gen_random_uuid(),'30000000-0000-4000-8000-000000000019','count',10,'TEST','',null); raise exception 'Anonymous stock write'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000018',true);
do $$ begin
 if exists(select 1 from public.stock_movements) then raise exception 'Nonstaff history exposed'; end if;
 begin perform public.record_stock_movement(gen_random_uuid(),'30000000-0000-4000-8000-000000000019','count',10,'TEST','',null); raise exception 'Nonstaff stock write'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000019',true);
do $$ declare movement public.stock_movements; replay public.stock_movements; rid uuid:=gen_random_uuid(); begin
 begin perform public.record_stock_movement(gen_random_uuid(),'30000000-0000-4000-8000-000000000019','receipt',10,'TEST','',null); raise exception 'Unknown treated as zero'; exception when sqlstate 'PT409' then null; end;
 movement:=public.record_stock_movement(gen_random_uuid(),'30000000-0000-4000-8000-000000000019','count',10,'OPENING','',null);
 if movement.balance<>10 or movement.previous_stock is not null then raise exception 'Opening count wrong'; end if;
 movement:=public.record_stock_movement(rid,'30000000-0000-4000-8000-000000000019','receipt',5,'DELIVERY','',10);
 replay:=public.record_stock_movement(rid,'30000000-0000-4000-8000-000000000019','receipt',5,'DELIVERY','',10);
 if movement.balance<>15 or replay.id<>movement.id then raise exception 'Duplicate receipt counted twice'; end if;
 begin perform public.record_stock_movement(rid,'30000000-0000-4000-8000-000000000019','receipt',6,'DELIVERY','',10); raise exception 'Duplicate key changed payload'; exception when sqlstate 'PT409' then null; end;
 begin perform public.record_stock_movement(gen_random_uuid(),'30000000-0000-4000-8000-000000000019','dispatch',16,'DISPATCH','',15); raise exception 'Oversold'; exception when sqlstate 'PT409' then null; end;
 begin perform public.record_stock_movement(gen_random_uuid(),'30000000-0000-4000-8000-000000000019','count',7,'COUNT','',10); raise exception 'Stale count overwrote newer stock'; exception when sqlstate 'PT409' then null; end;
 movement:=public.record_stock_movement(gen_random_uuid(),'30000000-0000-4000-8000-000000000019','dispatch',3,'DISPATCH','',15);
 if movement.balance<>12 then raise exception 'Dispatch balance wrong'; end if;
 movement:=public.record_stock_movement(gen_random_uuid(),'30000000-0000-4000-8000-000000000019','count',0,'COUNT','Damaged stock reconciliation',12);
 if movement.balance<>0 or movement.previous_stock<>12 then raise exception 'Zero count wrong'; end if;
 begin update public.products set stock=99 where id='30000000-0000-4000-8000-000000000019'; raise exception 'Direct stock overwrite allowed'; exception when insufficient_privilege then null; end;
 begin update public.stock_movements set balance=99; raise exception 'History mutable'; exception when insufficient_privilege then null; end;
 begin delete from public.stock_movements; raise exception 'History deletable'; exception when insufficient_privilege then null; end;
 if (select count(*) from public.stock_movements where product_id='30000000-0000-4000-8000-000000000019')<>4 then raise exception 'Unexpected movement count'; end if;
end $$;
reset role;
rollback to inventory_test;
