-- Wrap in BEGIN/ROLLBACK. Synthetic fixtures only; no real inventory changes.
savepoint web_security_test;
insert into auth.users(id) values('10000000-0000-4000-8000-000000000030');
insert into public.staff_members(user_id) values('10000000-0000-4000-8000-000000000030');
set local role anon;
do $$ begin
 perform id,title from public.products limit 1;
 begin perform stock from public.products; raise exception 'Public stock exposed'; exception when insufficient_privilege then null; end;
 begin perform * from app_security.web_sessions; raise exception 'Sessions exposed'; exception when insufficient_privilege then null; end;
 begin perform public.security_rate_limit(repeat('a',64),'contact',5,600); raise exception 'Public security RPC'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000031',true);
do $$ begin
 if exists(select 1 from public.products) then raise exception 'Nonstaff inventory exposed'; end if;
 begin perform public.security_session_active(repeat('a',64),'10000000-0000-4000-8000-000000000030'); raise exception 'Nonstaff security RPC'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role service_role;
do $$ declare allowed jsonb; begin
 for i in 1..5 loop
  allowed:=public.security_rate_limit(repeat('a',64),'contact',5,600);
  if not (allowed->>'allowed')::boolean then raise exception 'Premature rate rejection'; end if;
 end loop;
 allowed:=public.security_rate_limit(repeat('a',64),'contact',5,600);
 if (allowed->>'allowed')::boolean or (allowed->>'retry_after')::int<1 then raise exception 'Rate budget bypassed'; end if;
 allowed:=public.security_rate_limit(repeat('b',64),'contact',5,600);
 if not (allowed->>'allowed')::boolean then raise exception 'Different visitor blocked'; end if;
 perform public.security_session_create(repeat('c',64),'10000000-0000-4000-8000-000000000030',extract(epoch from now())::bigint+300);
 if not public.security_session_active(repeat('c',64),'10000000-0000-4000-8000-000000000030') then raise exception 'Session missing'; end if;
 if public.security_session_active(repeat('c',64),'10000000-0000-4000-8000-000000000031') then raise exception 'Wrong user session accepted'; end if;
 perform public.security_session_revoke(repeat('c',64));
 if public.security_session_active(repeat('c',64),'10000000-0000-4000-8000-000000000030') then raise exception 'Revoked session accepted'; end if;
end $$;
reset role;
rollback to web_security_test;
