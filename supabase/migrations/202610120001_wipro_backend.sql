-- Additive V2 schema. Apply only to the separate Wipro Fire & Safety V2 project.
begin;
create table public.staff_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  phone text not null check (char_length(phone) between 10 and 22),
  message text not null check (char_length(message) between 1 and 12000),
  service text not null default '' check (service in ('','installation','amc','audit','refilling','training','other')),
  products jsonb not null default '[]' check (jsonb_typeof(products) = 'array' and jsonb_array_length(products) <= 100),
  status text not null default 'pending' check (status in ('pending','contacted')),
  created_at timestamptz not null default now()
);
create index contact_inquiries_created_at_idx on public.contact_inquiries(created_at desc);
create table public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  description text not null check (char_length(description) between 1 and 5000),
  category text not null check (char_length(category) between 1 and 120),
  image_url text not null default '' check (image_url = '' or image_url like 'https://%' or (image_url like '/%' and image_url not like '//%')),
  slug text unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  stock integer check (stock between 0 and 1000000),
  "minStock" integer not null default 5 check ("minStock" between 0 and 1000000),
  unit text not null default 'pcs' check (char_length(unit) between 1 and 20),
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
-- Public catalogue intentionally exposes product availability, as the existing API does.
-- Customer data is never exposed to anonymous users or ordinary signed-in accounts.
alter table public.staff_members enable row level security;
alter table public.contact_inquiries enable row level security;
alter table public.products enable row level security;
revoke all on public.staff_members, public.contact_inquiries, public.products from anon, authenticated;
grant select on public.staff_members to authenticated;
grant select on public.products to anon, authenticated;
grant select on public.contact_inquiries to authenticated;
grant update(status) on public.contact_inquiries to authenticated;
grant insert, update on public.products to authenticated;
grant all on public.staff_members, public.contact_inquiries, public.products to service_role;
create policy staff_read_self on public.staff_members for select to authenticated
  using (user_id = (select auth.uid()));
create policy public_catalogue on public.products for select to anon, authenticated using (archived = false);
create policy staff_catalogue_read on public.products for select to authenticated using
  (exists (select 1 from public.staff_members where user_id = (select auth.uid())));
create policy staff_catalogue_insert on public.products for insert to authenticated with check
  (exists (select 1 from public.staff_members where user_id = (select auth.uid())));
create policy staff_catalogue_update on public.products for update to authenticated using
  (exists (select 1 from public.staff_members where user_id = (select auth.uid()))) with check
  (exists (select 1 from public.staff_members where user_id = (select auth.uid())));
create policy staff_inquiries_read on public.contact_inquiries for select to authenticated using
  (exists (select 1 from public.staff_members where user_id = (select auth.uid())));
create policy staff_inquiries_update on public.contact_inquiries for update to authenticated using
  (exists (select 1 from public.staff_members where user_id = (select auth.uid()))) with check
  (exists (select 1 from public.staff_members where user_id = (select auth.uid())));
-- No client may add staff, insert customer records directly, or permanently delete rows.
commit;
