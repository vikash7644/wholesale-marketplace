# VyaparSetu — Wholesale Marketplace

A mobile-first B2B wholesale and multi-vendor marketplace frontend.

## Current preview features
- Responsive landing page and category discovery
- Product catalogue with category filters, search and sorting
- Client-side cart and quantity controls
- Supabase email/password signup and login
- Seller application submission for authenticated users
- Seller applications remain pending admin review
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
