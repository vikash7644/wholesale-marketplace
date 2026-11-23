# VyaparSetu — Wholesale Marketplace

A mobile-first B2B wholesale and multi-vendor marketplace. The working name is provisional.

## Current implementation

- Responsive storefront with category discovery, search, sorting and cart preview.
- Supabase email/password signup, login and logout.
- Seller application submission for authenticated users; applications start as pending.
- Approved sellers can submit product details and JPG/PNG/WEBP photos (up to 5 MB).
- New seller listings are inactive until admin activation.
- Public catalogue reads active products from approved sellers; sample cards are preview-only fallbacks.
- Admin dashboard supports seller application review, product activation/deactivation, order status updates and supplier handoff records.
- Supabase Edge Function `marketplace-api` is active with JWT verification enabled. It provides authenticated order creation and buyer-scoped order history APIs.
- Project-scoped commission registry, rules, ledger and payout tables exist. Rules are inactive and default to 0 bps.

## Live deployment

- Production: https://wholesale-marketplace-five.vercel.app
- Vercel project: `wholesale-marketplace`
- The latest production deployment was confirmed `READY`.
- Deployment currently uses direct source deployment. GitHub commits do not automatically deploy until Vercel Git integration is configured or a new deployment is explicitly created.

## Backend and security

- Backend: Supabase PostgreSQL, Auth, Row Level Security, Storage and Edge Functions. There is no separate Node/Express server in this version.
- Supabase project: `wholesale-marketplace`, region `ap-south-1`.
- Core schema: profiles, seller applications, products, orders, order items, supplier fulfilments and commission records.
- Checkout uses a trusted database RPC for price, MOQ, stock and total validation.
- Direct buyer inserts into orders/order_items are restricted; the API requires a valid user JWT.
- Admin authorization uses trusted `app_metadata.role = admin`; user-editable metadata is not used.
- Admin RLS policies were inspected and verified on seller applications, products, orders, supplier fulfilments and commission management tables.
- Never expose a Supabase service-role/secret key in browser code.

## Seller uploads

- Storage bucket: `product-images`, public read, 5 MB limit, JPEG/PNG/WEBP allowlist.
- Authenticated uploads are restricted to a folder named for the seller's own user ID.
- Approved sellers can submit listings; sellers cannot activate their own listings.
- Migrations: `202611230006_product_image_storage.sql` and `202611230007_seller_product_dashboard_read_policy.sql`.

## Admin operations and owner setup

- The admin dashboard is shown only to a signed-in user whose trusted Supabase app metadata contains `role=admin`.
- It supports approve/reject seller applications, activate/deactivate products, update order status and save supplier contact/tracking details.
- No admin user has been provisioned through this repository. The first owner account must be granted the admin app-metadata claim through a trusted Supabase Auth administration process. Do not add a public admin signup or put privileged keys in the frontend.
- The admin interface and RLS policies have not yet been exercised end-to-end with a real admin account.

## Orders and supplier fulfilment

- The Edge Function exposes `POST /orders` and `GET /orders`; the frontend helper is `window.marketplaceApi`.
- The visible catalogue still contains sample placeholder IDs until real products exist. The checkout UI remains disabled; do not accept real orders yet.
- A delivery-address capture and full browser checkout test with real database product UUIDs are still required.
- Supplier handoff details are currently saved as internal records only. The app does not automatically send WhatsApp, SMS, email or purchase orders to suppliers.

## Commission management

- Project registry, configurable rules, commission ledger and payout records are installed.
- The marketplace is registered as a project. Commission rules remain inactive at 0 basis points; no live commission calculation, collection or payout is enabled.
- Rates and payout terms must be agreed before enabling commission.

## Verified environment snapshot

- Production Vercel deployment: `READY`.
- Supabase project: `ACTIVE_HEALTHY`.
- Edge Function `marketplace-api`: `ACTIVE`, JWT verification enabled.
- Database currently has 0 products, 0 seller applications, 0 orders and 0 commission rules. This is an empty launch database, not evidence of successful real-user checkout.
- RLS policy inspection confirms admin-only policies for the sensitive admin tables listed above.

## Remaining launch checklist

1. Provision the owner's trusted admin claim through Supabase Auth administration.
2. Sign in with a real test account and verify seller application, approval, product upload and product activation.
3. Add genuine supplier-approved catalogue entries, prices, MOQ, stock and product photos.
4. Add delivery address capture, then run a complete buyer checkout and order-history test.
5. Confirm supplier handoff workflow and decide whether to add a real email/WhatsApp integration.
6. Set commission rates and payout rules only after confirming the business terms.
7. Choose payment methods (for example UPI and COD) and integrate only after provider and settlement details are confirmed.
8. Publish verified business contact details, privacy policy, terms, refund and seller policies.

## Local preview

This is a static frontend. Open `index.html` in a browser or serve the directory with a static web server.

## Vercel deployment

Framework preset: **Other**. Build command: leave empty. Output directory: `.`.
