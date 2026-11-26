# VyaparSetu — Public Wholesale Catalogue

VyaparSetu is currently a read-only public catalogue for discovering wholesale products.

## Current public website

- Public product browsing, category filters, search and price sorting.
- Active product listings are read from the public catalogue endpoint.
- Demo preview cards are shown if no active listings are available.
- No customer or seller login/signup interface.
- No customer account, checkout, cart, order form, seller application, seller dashboard, product upload, or project upload UI.
- The website does not request names, phone numbers, email addresses, delivery addresses, or other account details from visitors.

## Live deployment

- Production: https://wholesale-marketplace-five.vercel.app
- Vercel project: `wholesale-marketplace`

## Data handling scope

The browser uses the Supabase publishable key only to read the public fields of active products: product name, description, category, price, unit, minimum quantity, public image URL and owner-listing flag. It does not initialize Supabase Auth or submit visitor information.

Hosting and network providers may still process ordinary technical request data such as IP address, device/browser headers and server logs. This frontend change does not erase previously stored database records, existing Auth users, uploaded files, provider logs, or backups. Those are separate backend/account retention tasks and should not be deleted without an explicit data-retention decision.

## Backend status

Supabase remains connected for public catalogue reads. Existing authenticated database policies and the `marketplace-api` Edge Function are not called by this read-only frontend. Seller upload buckets and historical account/order tables are left untouched; the public website no longer exposes controls for them.

## Deployment

Vercel project: `wholesale-marketplace`. Framework preset: **Other**. Build command: empty. Output directory: `.`.
