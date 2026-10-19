-- Applied through Supabase MCP; filename matches the recorded remote migration version.
-- Internal event trigger; browser/API roles do not need direct execution.
-- The existing ensure_rls event trigger and function body remain unchanged.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
