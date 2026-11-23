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
- Row Level Security is enabled on every marketplace table; public catalogue access is limited to active products from approved sellers.
- Admin permissions rely on trusted Supabase `app_metadata.role = admin`, never user-editable metadata.
- The migration is committed but has **not** been applied: no Supabase project is connected yet.

## Important next steps before accepting real orders
1. Select the Supabase organization and create/connect a project.
2. Apply and test the migration, including RLS and admin approval paths.
3. Connect frontend authentication and database calls.
4. Add supplier forwarding, tracking and commission calculations.
5. Configure verified business contact details and payment methods.
6. Add privacy policy, terms, refund and seller policies.

Product names and prices in this first UI are sample placeholders, not live supplier quotations.
