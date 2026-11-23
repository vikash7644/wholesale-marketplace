-- Restrict the seller approval SECURITY DEFINER helper from anonymous RPC calls.
-- Authenticated execution remains required by the existing product RLS policies.
REVOKE EXECUTE ON FUNCTION public.is_approved_seller(uuid) FROM PUBLIC, anon;
