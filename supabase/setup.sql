-- ============================================================
-- Mouasmor Store — configuration Supabase
-- À coller dans Supabase > SQL Editor, puis cliquer sur Run.
-- ============================================================

create extension if not exists pgcrypto;

-- Catalogue
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  badge text,
  price numeric(12, 2),
  images text[] not null default '{}'::text[],
  description text not null default '',
  details text[] not null default '{}'::text[],
  old_price numeric(12, 2),
  note numeric(2, 1),
  created_at timestamptz not null default now(),
  constraint products_title_length check (char_length(btrim(title)) between 2 and 200),
  constraint products_category_check check (category in ('tissus', 'parfums', 'pommade', 'divers')),
  constraint products_badge_check check (
    badge is null
    or badge in ('Populaire', 'Nouveau', 'Cérémonie', 'Premium', 'Best-seller')
  ),
  constraint products_price_check check (price is null or price >= 0),
  constraint products_old_price_check check (old_price is null or old_price >= 0),
  constraint products_note_check check (note is null or (note >= 0 and note <= 5)),
  constraint products_images_check check (cardinality(images) >= 1)
);

-- Colonnes optionnelles ajoutées pour conserver les fiches produits existantes.
alter table public.products add column if not exists description text not null default '';
alter table public.products add column if not exists details text[] not null default '{}'::text[];
alter table public.products add column if not exists old_price numeric(12, 2);
alter table public.products add column if not exists note numeric(2, 1);

create index if not exists products_created_at_idx on public.products (created_at desc);
create index if not exists products_category_idx on public.products (category);

-- Seul l'administrateur défini ici peut écrire.
create or replace function public.est_admin_mouasmor()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = lower('mouhamadanthony2.1@gmail.com');
$$;

-- Droits de base (les policies RLS restent la vraie barrière).
grant usage on schema public to anon, authenticated;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

-- Row Level Security
alter table public.products enable row level security;

drop policy if exists "products_select_public" on public.products;
create policy "products_select_public"
  on public.products
  for select
  to anon, authenticated
  using (true);

drop policy if exists "products_insert_admin" on public.products;
create policy "products_insert_admin"
  on public.products
  for insert
  to authenticated
  with check (public.est_admin_mouasmor());

drop policy if exists "products_update_admin" on public.products;
create policy "products_update_admin"
  on public.products
  for update
  to authenticated
  using (public.est_admin_mouasmor())
  with check (public.est_admin_mouasmor());

drop policy if exists "products_delete_admin" on public.products;
create policy "products_delete_admin"
  on public.products
  for delete
  to authenticated
  using (public.est_admin_mouasmor());

-- Bucket public pour les images produits.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "product_images_select_public" on storage.objects;
create policy "product_images_select_public"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "product_images_insert_admin" on storage.objects;
create policy "product_images_insert_admin"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and public.est_admin_mouasmor()
  );

drop policy if exists "product_images_update_admin" on storage.objects;
create policy "product_images_update_admin"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and public.est_admin_mouasmor()
  )
  with check (
    bucket_id = 'product-images'
    and public.est_admin_mouasmor()
  );

drop policy if exists "product_images_delete_admin" on storage.objects;
create policy "product_images_delete_admin"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and public.est_admin_mouasmor()
  );
