-- Separate marketplace-owner catalogue entries from third-party seller listings.
alter table public.products add column if not exists is_owner boolean not null default false;
drop policy if exists "Approved sellers can create their own products" on public.products;
create policy "Approved sellers can create their own products" on public.products for insert to authenticated
with check (seller_user_id = (select auth.uid()) and is_approved_seller((select auth.uid())) and is_active = false and is_owner = false);
drop policy if exists "Sellers can update their own products" on public.products;
create policy "Sellers can update their own products" on public.products for update to authenticated
using (seller_user_id = (select auth.uid()))
with check (seller_user_id = (select auth.uid()) and exists (select 1 from public.seller_applications sa where sa.user_id = (select auth.uid()) and sa.status = 'approved') and is_active = false and is_owner = false);
create index if not exists products_owner_created_idx on public.products(is_owner, created_at desc);
