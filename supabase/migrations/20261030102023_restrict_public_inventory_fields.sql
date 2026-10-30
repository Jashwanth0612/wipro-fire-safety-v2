-- Apply AFTER the matching API deployment; old APIs select inventory columns.
-- Public catalogue fields remain readable; inventory balances and thresholds do not.
revoke select on public.products from anon;
grant select(id,title,description,category,image_url,slug,unit,created_at) on public.products to anon;
alter policy public_catalogue on public.products to anon;
