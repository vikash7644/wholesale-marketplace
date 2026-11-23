# VyaparSetu — Wholesale Marketplace

A mobile-first B2B wholesale and multi-vendor marketplace frontend.

## Current preview features
- Responsive landing page and category discovery
- Product catalogue with category filters, search and sorting
- Client-side cart and quantity controls
- Seller interest form UI
- No external payment or order submission is wired yet

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

## Important next steps before accepting real orders
1. Connect frontend authentication and database calls using the public publishable key only.
2. Test signup/login, seller application, catalogue visibility and checkout against real authenticated users.
3. Add admin review tools for seller approval and product activation.
4. Add supplier forwarding, tracking and commission calculations.
5. Configure verified business contact details and payment methods.
6. Add privacy policy, terms, refund and seller policies.

Product names and prices in this first UI are sample placeholders, not live supplier quotations.
