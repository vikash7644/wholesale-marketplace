-- Let sellers view their own inactive listings while public users only see approved active products.
drop policy if exists "Sellers can view their own products" on public.products;
create policy "Sellers can view their own products"
on public.products for select to authenticated
using (seller_user_id = (select auth.uid()));
