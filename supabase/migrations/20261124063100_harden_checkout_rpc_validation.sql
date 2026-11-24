-- Keep database checkout validation authoritative even when the RPC is called directly.
-- Also use an empty search_path in this SECURITY DEFINER function.

create or replace function public.create_marketplace_order(
  p_items jsonb,
  p_delivery_address jsonb,
  p_buyer_note text default ''
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_buyer uuid := auth.uid();
  v_item jsonb;
  v_product public.products%rowtype;
  v_product_id uuid;
  v_quantity integer;
  v_subtotal bigint := 0;
  v_line_total bigint;
  v_lines jsonb := '[]'::jsonb;
  v_order_id uuid;
begin
  if v_buyer is null then
    raise exception 'Authentication required';
  end if;
  if p_items is null or jsonb_typeof(p_items) is distinct from 'array' then
    raise exception 'Cart must be a JSON array';
  end if;
  if jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 100 then
    raise exception 'Cart must contain 1 to 100 items';
  end if;
  if p_delivery_address is null or jsonb_typeof(p_delivery_address) is distinct from 'object' then
    raise exception 'Delivery address is required';
  end if;
  if jsonb_typeof(p_delivery_address->'full_name') is distinct from 'string'
     or length(btrim(p_delivery_address->>'full_name')) not between 1 and 120 then
    raise exception 'Enter a valid recipient name';
  end if;
  if jsonb_typeof(p_delivery_address->'phone') is distinct from 'string'
     or (p_delivery_address->>'phone') !~ '^[0-9]{10}$' then
    raise exception 'Enter a valid 10-digit mobile number';
  end if;
  if jsonb_typeof(p_delivery_address->'address_line') is distinct from 'string'
     or length(btrim(p_delivery_address->>'address_line')) not between 1 and 500 then
    raise exception 'Enter a valid delivery address';
  end if;
  if jsonb_typeof(p_delivery_address->'city') is distinct from 'string'
     or length(btrim(p_delivery_address->>'city')) not between 1 and 100 then
    raise exception 'Enter a valid city';
  end if;
  if jsonb_typeof(p_delivery_address->'state') is distinct from 'string'
     or length(btrim(p_delivery_address->>'state')) not between 1 and 100 then
    raise exception 'Enter a valid state';
  end if;
  if jsonb_typeof(p_delivery_address->'pincode') is distinct from 'string'
     or (p_delivery_address->>'pincode') !~ '^[0-9]{6}$' then
    raise exception 'Enter a valid 6-digit PIN code';
  end if;
  if length(coalesce(p_buyer_note, '')) > 1000 then
    raise exception 'Buyer note is too long';
  end if;

  for v_item in select value from pg_catalog.jsonb_array_elements(p_items) loop
    begin
      v_product_id := (v_item->>'product_id')::uuid;
      v_quantity := (v_item->>'quantity')::integer;
    exception when others then
      raise exception 'Each item needs product_id and quantity';
    end;
    if v_quantity < 1 then raise exception 'Quantity must be positive'; end if;

    select * into v_product
    from public.products p
    where p.id = v_product_id
      and p.is_active
      and public.is_approved_seller(p.seller_user_id)
    for update;

    if not found then raise exception 'A cart product is unavailable'; end if;
    if v_quantity < v_product.minimum_quantity then
      raise exception 'Quantity is below minimum for %', v_product.name;
    end if;
    if v_quantity > v_product.stock_quantity then
      raise exception 'Insufficient stock for %', v_product.name;
    end if;

    v_line_total := v_product.price_paise::bigint * v_quantity::bigint;
    v_subtotal := v_subtotal + v_line_total;
    if v_subtotal > 9000000000000000 then
      raise exception 'Order total exceeds supported limit';
    end if;

    update public.products
    set stock_quantity = stock_quantity - v_quantity, updated_at = now()
    where id = v_product.id;

    v_lines := v_lines || pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'product_id', v_product.id,
        'seller_user_id', v_product.seller_user_id,
        'product_name', v_product.name,
        'unit_price_paise', v_product.price_paise,
        'quantity', v_quantity,
        'line_total_paise', v_line_total
      )
    );
  end loop;

  insert into public.orders(
    buyer_user_id, status, subtotal_paise, delivery_address, buyer_note
  )
  values(v_buyer, 'placed', v_subtotal, p_delivery_address, coalesce(p_buyer_note, ''))
  returning id into v_order_id;

  insert into public.order_items(
    order_id, product_id, seller_user_id, product_name,
    unit_price_paise, quantity, line_total_paise
  )
  select v_order_id, x.product_id, x.seller_user_id, x.product_name,
         x.unit_price_paise, x.quantity, x.line_total_paise
  from pg_catalog.jsonb_to_recordset(v_lines) as x(
    product_id uuid, seller_user_id uuid, product_name text,
    unit_price_paise integer, quantity integer, line_total_paise bigint
  );

  return v_order_id;
end;
$function$;

revoke all on function public.create_marketplace_order(jsonb, jsonb, text) from public;
grant execute on function public.create_marketplace_order(jsonb, jsonb, text) to authenticated;
