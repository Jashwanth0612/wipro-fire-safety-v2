-- Read-only assertions after restrict_internal_rls_trigger_execution.
-- Raises on a permissions regression; does not change data or schema.
do $$
begin
  if has_function_privilege('anon', 'public.rls_auto_enable()', 'execute')
    or has_function_privilege('authenticated', 'public.rls_auto_enable()', 'execute') then
    raise exception 'Internal RLS trigger function remains executable by API roles';
  end if;
  if not has_function_privilege('postgres', 'public.rls_auto_enable()', 'execute') then
    raise exception 'Database owner must retain event trigger execution';
  end if;
  if not exists (select 1 from pg_event_trigger where evtname = 'ensure_rls'
    and evtenabled = 'O' and evtfoid = 'public.rls_auto_enable()'::regprocedure) then
    raise exception 'Automatic RLS trigger must remain enabled';
  end if;
  if not has_function_privilege('authenticated',
    'public.record_stock_movement(uuid,uuid,text,integer,text,text,integer)', 'execute') then
    raise exception 'Staff inventory RPC execution must remain available';
  end if;
end $$;
