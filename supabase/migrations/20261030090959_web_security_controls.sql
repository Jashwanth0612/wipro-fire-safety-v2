-- No catalogue, stock or customer records are changed by this migration.
create schema if not exists app_security;
revoke all on schema app_security from public, anon, authenticated;
grant usage on schema app_security to service_role;

create table app_security.web_sessions (
 session_hash text primary key check(length(session_hash)=64),
 user_id uuid not null references auth.users(id) on delete cascade,
 expires_at timestamptz not null
);
create index web_sessions_expiry on app_security.web_sessions(expires_at);
create table app_security.rate_windows (
 scope text not null,
 client_hash text not null check(length(client_hash)=64),
 window_start bigint not null,
 hits integer not null,
 expires_at timestamptz not null,
 primary key(scope,client_hash,window_start)
);
create index rate_windows_expiry on app_security.rate_windows(expires_at);
alter table app_security.web_sessions enable row level security;
alter table app_security.rate_windows enable row level security;
revoke all on all tables in schema app_security from public, anon, authenticated;
grant all on all tables in schema app_security to service_role;

create function public.security_session_create(p_hash text,p_user_id uuid,p_expires bigint)
returns boolean language plpgsql security invoker set search_path='' as $$
begin
 if p_expires <= extract(epoch from now()) or p_expires > extract(epoch from now())+3610
    or not exists(select 1 from public.staff_members where user_id=p_user_id) then
  raise sqlstate '42501' using message='Staff session unavailable';
 end if;
 delete from app_security.web_sessions where expires_at<now();
 insert into app_security.web_sessions values(p_hash,p_user_id,to_timestamp(p_expires));
 return true;
end $$;
create function public.security_session_active(p_hash text,p_user_id uuid)
returns boolean language sql security invoker set search_path='' as $$
 select exists(select 1 from app_security.web_sessions s join public.staff_members m on m.user_id=s.user_id
 where s.session_hash=p_hash and s.user_id=p_user_id and s.expires_at>now());
$$;
create function public.security_session_revoke(p_hash text)
returns boolean language plpgsql security invoker set search_path='' as $$
begin
 delete from app_security.web_sessions where session_hash=p_hash;
 return true;
end $$;
create function public.security_rate_limit(p_key text,p_scope text,p_limit integer,p_seconds integer)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare stamp bigint:=floor(extract(epoch from clock_timestamp())); bucket bigint; count_hits integer;
begin
 -- Restrict callers to known budgets even if application parameters regress.
 if not ((p_scope='login' and p_limit=10 and p_seconds=600)
      or (p_scope='contact' and p_limit=5 and p_seconds=600)
      or (p_scope='chat' and p_limit=20 and p_seconds=60)) then
  raise sqlstate '22023' using message='Invalid rate budget';
 end if;
 bucket:=(stamp/p_seconds)*p_seconds;
 delete from app_security.rate_windows where expires_at<now();
 insert into app_security.rate_windows(scope,client_hash,window_start,hits,expires_at)
 values(p_scope,p_key,bucket,1,to_timestamp(bucket+p_seconds))
 on conflict(scope,client_hash,window_start) do update
 set hits=least(app_security.rate_windows.hits+1,p_limit+1)
 returning hits into count_hits;
 return jsonb_build_object('allowed',count_hits<=p_limit,'retry_after',bucket+p_seconds-stamp);
end $$;

revoke all on function public.security_session_create(text,uuid,bigint) from public,anon,authenticated;
revoke all on function public.security_session_active(text,uuid) from public,anon,authenticated;
revoke all on function public.security_session_revoke(text) from public,anon,authenticated;
revoke all on function public.security_rate_limit(text,text,integer,integer) from public,anon,authenticated;
grant execute on function public.security_session_create(text,uuid,bigint) to service_role;
grant execute on function public.security_session_active(text,uuid) to service_role;
grant execute on function public.security_session_revoke(text) to service_role;
grant execute on function public.security_rate_limit(text,text,integer,integer) to service_role;
