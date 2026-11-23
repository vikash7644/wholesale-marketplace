# VyaparSetu — Wholesale Marketplace

A mobile-first B2B wholesale and multi-vendor marketplace frontend.

## Current preview features
- Responsive landing page and category discovery
- Product catalogue with category filters, search and sorting
- Client-side cart and quantity controls
- Supabase email/password signup and login
- Seller application submission for authenticated users
- Seller applications remain pending admin review
- Approved sellers can upload JPG/PNG/WEBP product photos (up to 5 MB) and submit product name, description, category, wholesale price, unit, MOQ and stock
- Seller product listings remain inactive until admin activation
- Supabase Storage bucket `product-images` stores public catalogue images; authenticated uploads are restricted to each seller's own folder
- Supabase Edge Function `marketplace-api` is deployed with JWT verification enabled
- Authenticated API routes: `POST /orders` (trusted database checkout RPC) and `GET /orders` (buyer-scoped order history)
- Frontend API client is exposed as `window.marketplaceApi.placeOrder(...)` and `window.marketplaceApi.getMyOrders()`
- Checkout UI is present but intentionally disabled until real catalogue products and delivery details are connected

## Run locally
This is a static site. Open `index.html` in a browser, or serve the folder with any static web server.

## Deploy on Vercel
Import this GitHub repository into Vercel. Framework preset: **Other**. Build command: leave empty. Output directory: `.`.

## Backend foundation
- `supabase/migrations/202611230001_marketplace_core.sql` defines profiles, seller applications, products, orders, order items, supplier fulfilments and commission records.
- `202611230002_secure_checkout.sql` hardens RLS and adds a trusted checkout RPC that calculates prices, MOQ, stock and totals on the database side.
- `202611230003_checkout_null_guard.sql` rejects malformed/null checkout payloads.
- All marketplace tables have Row Level Security enabled. Public catalogue access is limited to active products from approved sellers.
- Admin permissions rely on trusted Supabase `app_metadata.role = admin`, never user-editable metadata.
- These migrations are applied to the Supabase project `wholesale-marketplace` in `ap-south-1`. Project status was verified as `ACTIVE_HEALTHY`.

## Admin dashboard

- The admin dashboard is visible only when the signed-in user's trusted Supabase `app_metadata.role` is `admin`.
- It lists seller applications and product submissions, with approve/reject and activate/deactivate actions. Database RLS remains the authorization boundary.
- No public role-escalation or client-side admin assignment is provided. The first owner/admin must be granted the `role=admin` app_metadata claim through a trusted Supabase Auth administration process; never put a service-role key in browser code.
- Admin actions have not yet been exercised with a real admin account.

## Seller product uploads

- Storage bucket `product-images` is configured with a 5 MB limit and JPEG/PNG/WEBP allowlist.
- Storage RLS restricts uploads to a folder named for the authenticated user ID; sellers can manage only their own uploaded images.
- Product insert policy requires an approved seller and stores new listings as inactive for admin review.
- Migration `202611230006_product_image_storage.sql` creates the bucket and policies; migration `202611230007_seller_product_dashboard_read_policy.sql` allows sellers to view their own pending listings.
- The seller modal includes the upload form and seller's product list. The form is hidden until seller approval.

## Application API backend

- Deployed function: `marketplace-api` (active; JWT verification enabled).
- The function validates the signed-in user, validates cart payloads, delegates price/MOQ/stock checks to the database checkout RPC, and returns an order ID.
- Order history is filtered by the authenticated buyer ID. No service-role key is exposed to the browser.
- Frontend helper is available in `app.js` as `window.marketplaceApi`.
- The current visible catalogue is still sample/demo data with numeric placeholder IDs. Do not submit real orders until it is replaced with database-backed UUID product records and a delivery-address form. API deployment is confirmed; end-to-end browser checkout has not yet been tested.

## Commission management

- Project-scoped commission management is installed: independent project registry, configurable commission rules (project/category/seller scope), immutable-style commission ledger entries, and payout records.
- The Wholesale Marketplace is registered as the first project in this commission system. Other businesses/projects must be onboarded explicitly; this does not automatically connect or mix their revenue.
- Commission rules default to inactive and 0 basis points until an owner configures and approves actual rates. Ledger/payout rows are admin-only; no live commission collection or payouts are enabled yet.

## Important next steps before accepting real orders
1. End-to-end test signup/login and seller application with a real test account.
2. Build an authenticated admin review interface and a safe way to assign the first admin role.
3. Replace sample products with supplier-approved product records and images.
4. Enable checkout only after adding delivery address capture and validating the trusted order RPC.
5. Define the marketplace commission rate, then implement commission ledger entries and supplier forwarding/tracking.
6. Configure verified business contact details, payment methods, privacy policy, terms, refund and seller policies.

Product names and prices in this first UI are sample placeholders, not live supplier quotations.
