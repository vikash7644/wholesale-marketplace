create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create or replace function private.is_approved_seller(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.seller_applications sa
    where sa.user_id = p_user_id
      and sa.status = 'approved'
  );
$$;
revoke all on function private.is_approved_seller(uuid) from public;
grant execute on function private.is_approved_seller(uuid) to anon, authenticated;

drop policy if exists "Public can view active products from approved sellers" on public.products;
create policy "Public can view active products from approved sellers"
on public.products for select
to anon, authenticated
using (is_active = true and private.is_approved_seller(seller_user_id));

drop policy if exists "Approved sellers can create their own products" on public.products;
create policy "Approved sellers can create their own products"
on public.products for insert
to authenticated
with check (
  seller_user_id = (select auth.uid())
  and private.is_approved_seller((select auth.uid()))
  and is_active = true
  and is_owner = false
);

revoke execute on function public.is_approved_seller(uuid) from public, anon, authenticated;
drop view if exists public.public_catalogue;
