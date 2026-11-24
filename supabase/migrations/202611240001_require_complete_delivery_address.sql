-- Require complete Indian delivery details for every marketplace order.
alter table public.orders
  add constraint orders_delivery_address_valid
  check (
    jsonb_typeof(delivery_address) = 'object'
    and length(trim(coalesce(delivery_address->>'full_name', ''))) between 1 and 120
    and coalesce(delivery_address->>'phone', '') ~ '^[0-9]{10}$'
    and length(trim(coalesce(delivery_address->>'address_line', ''))) between 1 and 500
    and length(trim(coalesce(delivery_address->>'city', ''))) between 1 and 100
    and length(trim(coalesce(delivery_address->>'state', ''))) between 1 and 100
    and coalesce(delivery_address->>'pincode', '') ~ '^[0-9]{6}$'
  );
