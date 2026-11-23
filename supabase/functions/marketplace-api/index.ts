import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const route = new URL(req.url).pathname.replace(/\/$/, "").split("/").pop();
  if (req.method !== "GET" && req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return json({ error: "Sign in required" }, 401);

  const projectUrl = Deno.env.get("SUPABASE_URL");
  const keysRaw = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  const publishableKey = keysRaw ? (JSON.parse(keysRaw) as Record<string, string>)["default"] : Deno.env.get("SUPABASE_ANON_KEY");
  if (!projectUrl || !publishableKey) return json({ error: "Backend configuration error" }, 500);

  const supabase = createClient(projectUrl, publishableKey, {
    global: { headers: { Authorization: authorization } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const token = authorization.slice(7);
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user) return json({ error: "Invalid or expired session" }, 401);

  if (route === "orders" && req.method === "POST") {
    let payload: Record<string, unknown>;
    try { payload = await req.json(); } catch { return json({ error: "Request body must be valid JSON" }, 400); }
    const items = payload.items;
    const address = payload.delivery_address;
    const note = payload.buyer_note ?? "";
    if (!Array.isArray(items) || items.length < 1 || items.length > 100) return json({ error: "Cart must contain 1 to 100 items" }, 400);
    if (!address || typeof address !== "object" || Array.isArray(address)) return json({ error: "Delivery address is required" }, 400);
    if (typeof note !== "string" || note.length > 1000) return json({ error: "Buyer note must be 1000 characters or fewer" }, 400);

    const cleanItems = [];
    for (const item of items) {
      if (!item || typeof item !== "object" || Array.isArray(item)) return json({ error: "Each cart item must be an object" }, 400);
      const row = item as Record<string, unknown>;
      if (typeof row.product_id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(row.product_id)) return json({ error: "Each item needs a valid product_id" }, 400);
      if (!Number.isSafeInteger(row.quantity) || (row.quantity as number) < 1) return json({ error: "Each item needs a positive whole-number quantity" }, 400);
      cleanItems.push({ product_id: row.product_id, quantity: row.quantity });
    }

    const { data: orderId, error } = await supabase.rpc("create_marketplace_order", {
      p_items: cleanItems, p_delivery_address: address, p_buyer_note: note,
    });
    if (error) {
      console.error("Order RPC failed", { code: error.code, message: error.message });
      const clientError = /unavailable|minimum|stock|quantity|cart|address|authentication|required|too long/i.test(error.message);
      return json({ error: clientError ? error.message : "Unable to place order right now" }, clientError ? 400 : 500);
    }
    return json({ success: true, order_id: orderId, status: "placed" }, 201);
  }

  if (route === "orders" && req.method === "GET") {
    const { data, error } = await supabase.from("orders")
      .select("id,status,subtotal_paise,created_at,order_items(id,product_name,quantity,unit_price_paise,line_total_paise)")
      .eq("buyer_user_id", authData.user.id).order("created_at", { ascending: false }).limit(50);
    if (error) {
      console.error("Order history query failed", { code: error.code, message: error.message });
      return json({ error: "Unable to load orders right now" }, 500);
    }
    return json({ orders: data ?? [] });
  }
  return json({ error: "Route not found" }, 404);
});
