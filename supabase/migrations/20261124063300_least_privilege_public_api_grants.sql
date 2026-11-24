-- Least-privilege grants for the public API roles.
-- RLS remains the row-level authorization layer; table-level privileges
-- such as TRUNCATE, TRIGGER and REFERENCES are not protected by RLS.

revoke all privileges on all tables in schema public from anon, authenticated;

-- Anonymous visitors may only read public catalogue and approved project metadata.
grant select on public.products to anon;
grant select on public.seller_projects to anon;

-- Authenticated users may read only rows allowed by the existing RLS policies.
grant select on all tables in schema public to authenticated;

-- Profiles: own profile creation and editing; no direct deletion.
grant insert, update on public.profiles to authenticated;

-- Sellers submit/read their own applications; admins review through RLS.
grant insert, update, delete on public.seller_applications to authenticated;

-- Seller/admin product operations are still row- and column-constrained by RLS.
grant insert, update, delete on public.products to authenticated;

-- Buyers read their own orders; admins update order statuses through RLS.
grant update on public.orders to authenticated;

-- Checkout RPC writes order_items under its SECURITY DEFINER owner.
-- Other admin-only operations are gated by the existing RLS policies.
grant insert, update, delete on public.supplier_fulfilments to authenticated;
grant insert, update, delete on public.commissions to authenticated;
grant insert, update, delete on public.business_projects to authenticated;
grant insert, update, delete on public.project_commission_rules to authenticated;
grant insert, update, delete on public.project_commission_ledger to authenticated;
grant insert, update, delete on public.project_commission_payouts to authenticated;
grant insert, update, delete on public.seller_projects to authenticated;
