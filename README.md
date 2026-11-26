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

The browser uses the Supabase publishable key only to read public fields of active products: product name, description, category, price, unit, minimum quantity, public image URL and owner-listing flag. It does not initialize Supabase Auth or submit visitor information.

Hosting and network providers may still process ordinary technical request data such as IP address, device/browser headers and server logs. This frontend change does not erase previously stored database records, existing Auth users, uploaded files, provider logs, or backups. Those are separate data-retention tasks and should not be deleted without an explicit decision.

## Backend status

- Supabase remains connected for public catalogue reads.
- The `marketplace-api` Edge Function has been replaced with a `410 Gone` response, so its previous order creation and order-history API is disabled.
- Supabase Auth and historical seller-upload storage policies remain configured at the project level, but the public website no longer initializes Auth or exposes signup/login/upload controls. Disabling provider-level signup and revoking historical upload policies would require separate backend configuration changes.
- Historical account/order records and uploaded files are left untouched.

## Deployment

Vercel project: `wholesale-marketplace`. Framework preset: **Other**. Build command: empty. Output directory: `.`.
