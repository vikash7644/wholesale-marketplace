# Owner and seller launch setup

This guide provisions the first owner account without adding a public admin-signup route.

## 1. Create the owner account

1. Open the [live marketplace](https://wholesale-marketplace-five.vercel.app).
2. Use **Sign in / Join** to register with the owner's email and a strong, unique password.
3. Complete email confirmation if Supabase Auth requests it.
4. Sign in once so the account exists in Supabase Auth.

The database currently starts empty. Creating an account does not automatically make it an administrator.

## 2. Grant the first admin role securely

Admin access is read from the trusted Auth `app_metadata.role` claim. Never use `user_metadata`, a browser-side update, or a public signup field for this role.

A project owner should perform the following from a trusted server or secure admin workstation:

- Obtain the owner's Auth user UUID from **Supabase Dashboard → Authentication → Users**.
- Use the Supabase Auth Admin API `PUT /auth/v1/admin/users/{user_id}` with the project's service-role/secret key held only in a protected server-side secret store.
- Send this JSON body, preserving any existing app metadata that must remain:

```json
{
  "app_metadata": {
    "role": "admin"
  }
}
```

The request must include the project's `apikey` header and `Authorization: Bearer <service-role-or-secret-key>` header. Do not paste the secret into this repository, the browser console, a public issue, chat, or a frontend environment variable.

If using a secure script, read the key from a server-side environment variable and keep shell history/logging protected. After the role update, sign out and sign in again (or refresh the session) so the JWT contains the new app metadata.

## 3. Verify owner access

1. Sign in again on the marketplace.
2. Confirm the **Admin dashboard** navigation item appears.
3. Open it and verify the seller applications, product approvals, and orders panels load.
4. Do not treat the dashboard as production-tested until a real admin account completes these checks.

## 4. Seller onboarding

1. A shopkeeper registers/signs in and submits **Become a seller**.
2. The application appears in the admin dashboard as pending.
3. The owner reviews the business name, contact name, phone and category, then approves or rejects it.
4. An approved seller signs in again and submits product name, category, wholesale price, unit, minimum order quantity (MOQ), stock and product photo.
5. New listings are inactive by default. The owner reviews the listing and activates it.
6. Only active products from approved sellers appear in the public catalogue.

## 5. Add the first real catalogue

Do not publish invented/sample pricing as real inventory. For each launch product, confirm with the supplier:

- Product name and category
- Wholesale price in INR
- Unit (piece, box, kg, dozen, etc.)
- MOQ
- Available stock
- Product photo that the supplier permits the marketplace to use
- Supplier name and a reliable fulfilment contact kept in the admin workflow

The database has no live products at the time this guide was written. The public storefront may show preview/sample cards until genuine listings are approved.

## 6. Launch safety checklist

- Keep Supabase service-role/secret keys server-side only.
- Enable Supabase Auth leaked-password protection in the project's Authentication password/security settings.
- Test buyer signup, seller application, approval, photo upload, product activation, checkout and order history with separate test accounts.
- Confirm supplier delivery terms, cancellation/returns, privacy policy and seller terms before accepting real orders.
- Online payments are not enabled. Checkout currently creates an order request; it does not collect UPI/card/USDT payments.
