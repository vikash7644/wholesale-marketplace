-- VyaparSetu marketplace foundation
-- Apply only after a Supabase project has been selected and reviewed.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.seller_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_name text not null,
  contact_name text not null,
  phone text not null,
  category text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_user_id uuid not null references auth.users(id),
  name text not null,
  description text not null default '',
  category text not null,
  price_paise integer not null check (price_paise >= 0),
  unit text not null default 'piece',
  minimum_quantity integer not null default 1 check (minimum_quantity > 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  image_url text,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_user_id uuid not null references auth.users(id),
  status text not null default 'placed' check (status in ('placed','confirmed','forwarded','dispatched','delivered','cancelled')),
  subtotal_paise bigint not null check (subtotal_paise >= 0),
  delivery_address jsonb not null,
  buyer_note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  seller_user_id uuid not null references auth.users(id),
  product_name text not null,
  unit_price_paise integer not null check (unit_price_paise >= 0),
  quantity integer not null check (quantity > 0),
  line_total_paise bigint not null check (line_total_paise >= 0)
);

create table if not exists public.supplier_fulfilments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  supplier_name text not null,
  supplier_contact text,
  status text not null default 'not_forwarded' check (status in ('not_forwarded','forwarded','accepted','dispatched','delivered')),
  tracking_reference text,
  internal_note text not null default '',
  updated_at timestamptz not null default now(),
  unique(order_id)
);

create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  seller_user_id uuid not null references auth.users(id),
  gross_amount_paise bigint not null check (gross_amount_paise >= 0),
  commission_paise bigint not null check (commission_paise >= 0),
  created_at timestamptz not null default now()
);

create index if not exists products_category_active_idx on public.products(category, is_active);
create index if not exists products_seller_idx on public.products(seller_user_id);
create index if not exists orders_buyer_created_idx on public.orders(buyer_user_id, created_at desc);
create index if not exists order_items_order_idx on public.order_items(order_id);

alter table public.profiles enable row level security;
alter table public.seller_applications enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.supplier_fulfilments enable row level security;
alter table public.commissions enable row level security;

-- Public catalogue: only active products from approved sellers.
create policy "Public can view active products from approved sellers"
on public.products for select to anon, authenticated
using (
  is_active = true and exists (
    select 1 from public.seller_applications sa
    where sa.user_id = seller_user_id and sa.status = 'approved'
  )
);

create policy "Approved sellers can create their own products"
on public.products for insert to authenticated
with check (
  seller_user_id = (select auth.uid())
  and exists (
    select 1 from public.seller_applications sa
    where sa.user_id = (select auth.uid()) and sa.status = 'approved'
  )
  and is_active = false
);

create policy "Sellers can update their own products"
on public.products for update to authenticated
using (seller_user_id = (select auth.uid()))
with check (
  seller_user_id = (select auth.uid())
  and exists (
    select 1 from public.seller_applications sa
    where sa.user_id = (select auth.uid()) and sa.status = 'approved'
  )
);

create policy "Users can submit seller applications"
on public.seller_applications for insert to authenticated
with check (user_id = (select auth.uid()) and status = 'pending');

create policy "Users can view their own seller applications"
on public.seller_applications for select to authenticated
using (user_id = (select auth.uid()));

create policy "Users can read their own profile"
on public.profiles for select to authenticated
using (id = (select auth.uid()));

create policy "Users can create their own profile"
on public.profiles for insert to authenticated
with check (id = (select auth.uid()));

create policy "Users can update their own profile"
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "Buyers can create their own orders"
on public.orders for insert to authenticated
with check (buyer_user_id = (select auth.uid()) and status = 'placed');

create policy "Buyers can view their own orders"
on public.orders for select to authenticated
using (buyer_user_id = (select auth.uid()));

create policy "Buyers can add items to their own orders"
on public.order_items for insert to authenticated
with check (
  exists (
    select 1 from public.orders o
    where o.id = order_id and o.buyer_user_id = (select auth.uid())
  )
);

create policy "Buyers and sellers can view relevant order items"
on public.order_items for select to authenticated
using (
  exists (select 1 from public.orders o where o.id = order_id and o.buyer_user_id = (select auth.uid()))
  or seller_user_id = (select auth.uid())
);

-- Admin access must be assigned through trusted app_metadata by a project owner,
-- never through user-editable user_metadata.
create policy "Admins manage seller applications"
on public.seller_applications for all to authenticated
using ((select auth.jwt()->'app_metadata'->>'role') = 'admin')
with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "Admins manage all products"
on public.products for all to authenticated
using ((select auth.jwt()->'app_metadata'->>'role') = 'admin')
with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "Admins manage all orders"
on public.orders for all to authenticated
using ((select auth.jwt()->'app_metadata'->>'role') = 'admin')
with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "Admins manage all order items"
on public.order_items for all to authenticated
using ((select auth.jwt()->'app_metadata'->>'role') = 'admin')
with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "Admins manage supplier fulfilments"
on public.supplier_fulfilments for all to authenticated
using ((select auth.jwt()->'app_metadata'->>'role') = 'admin')
with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "Admins manage commissions"
on public.commissions for all to authenticated
using ((select auth.jwt()->'app_metadata'->>'role') = 'admin')
with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

grant select on public.products to anon, authenticated;
grant insert, update on public.products to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert on public.seller_applications to authenticated;
grant select, insert on public.orders to authenticated;
grant select, insert on public.order_items to authenticated;
grant select, insert, update, delete on public.supplier_fulfilments to authenticated;
grant select, insert, update, delete on public.commissions to authenticated;

-- Admin policies still apply to authenticated access; RLS remains the row-level gate.
