# Admin Bootstrap & Foundation Smoke Test

This doc covers everything needed to bring the Foundation sub-project online for the first time on a fresh Supabase project, plus the 8-step manual smoke test that proves it works end-to-end.

---

## 1. Apply the migrations (in order)

Open the Supabase SQL Editor and run, in order:

```
ayurvedic/supabase/migrations/20260512_foundation.sql      # foundation
ayurvedic/supabase/migrations/20260515_phone_auth.sql      # phone-OTP support
```

This adds:
- `commission_type_enum` (`affiliate` | `reseller`)
- `sales_agents.commission_type` column
- `agent_invites` table + RLS policies
- `claim_agent_invite(token, user_id)` RPC (SECURITY DEFINER, atomic invite consumption)
- Updates the `handle_new_user` trigger so customer signup carries `full_name` + `phone_number` from the signup metadata into `public.users`

The migration is idempotent — safe to re-run.

Verify:
```sql
SELECT * FROM public.agent_invites LIMIT 0;
SELECT typname FROM pg_type WHERE typname = 'commission_type_enum';
SELECT proname FROM pg_proc WHERE proname IN ('claim_agent_invite', 'handle_new_user');
```

---

## 2. Configure Google OAuth (one-time)

### Google Cloud Console
1. Visit https://console.cloud.google.com/apis/credentials
2. **Create credentials → OAuth 2.0 Client ID**
3. Application type: **Web application**
4. **Authorized redirect URIs** — add:
   ```
   https://<your-supabase-project>.supabase.co/auth/v1/callback
   ```
5. Save the **Client ID** and **Client Secret**.

### Supabase dashboard
1. Authentication → Providers → **Google** → enable
2. Paste the Client ID + Client Secret from the previous step
3. Authentication → URL Configuration:
   - **Site URL:** `https://keralaayurvedic.com` (or your domain)
   - **Redirect URLs:** add both
     - `http://localhost:3000/auth/callback`
     - `https://keralaayurvedic.com/auth/callback`

The app itself doesn't need any Google env vars — Supabase handles the OAuth handshake server-side.

---

## 2.2 Configure Email OTP — REQUIRED

Customer sign-in and sign-up both require a 6-digit code emailed to the customer. Two settings to configure in Supabase Dashboard:

### A. Set OTP expiry to 25 minutes

Supabase Dashboard → **Authentication → Providers → Email**:

- **OTP Expiration:** `1500` (seconds — equals 25 minutes)

### B. Switch email templates from links to codes

Supabase Dashboard → **Authentication → Email Templates**.

**"Confirm signup" template** — replace with:

```
Subject: Your Kerala Ayurvedic verification code

Welcome to Kerala Ayurvedic Lifestyle.

Your 6-digit verification code is:

{{ .Token }}

Enter this on the sign-up page to activate your account.
This code expires in 25 minutes.

— The Kerala Ayurvedic Team
Brickfields, Kuala Lumpur · Est. 2008
```

**"Magic Link" template** — replace with (this is the sign-in OTP):

```
Subject: Your Kerala Ayurvedic sign-in code

Your 6-digit sign-in code is:

{{ .Token }}

Enter this on the sign-in page to complete your sign-in.
This code expires in 25 minutes.

If this wasn't you, ignore this email — your account is safe.

— The Kerala Ayurvedic Team
```

**Critical:** the templates must use `{{ .Token }}` (the 6-digit code), NOT `{{ .ConfirmationURL }}` (a clickable link). Our UI expects customers to enter the code, not click a link.

### Why this matters

The customer login flow is:

1. Customer enters email/phone + password → server validates → server emails a 6-digit code
2. Customer enters the code on the same screen → signed in

If templates aren't configured with `{{ .Token }}`, customers won't get codes and the flow breaks. Set this up before the first real signup attempt.

---

## 2.3 Dev-mode OTP bypass — for local iteration only

Supabase's free tier rate-limits transactional emails to ~2 per hour per project. During heavy local testing (sign in / sign out repeatedly), you'll hit the limit fast. Two toggles disable OTP entirely so you can sign in instantly without sending emails.

### Toggle 1: `.env.local`
```
NEXT_PUBLIC_REQUIRE_OTP=false
```
Restart the dev server (`Ctrl+C` then `npm run dev`).

### Toggle 2: Supabase Dashboard
**Authentication → Providers → Email → Confirm email → OFF**

Both are required. The env var alone skips the sign-in OTP step in our code; the Supabase toggle stops the sign-up confirmation email from being sent at all.

### Safety guard built-in
`LoginForm.tsx` hard-codes `OTP_REQUIRED=true` when `NODE_ENV === 'production'`. Even if `NEXT_PUBLIC_REQUIRE_OTP=false` is accidentally set on Vercel, **production builds still require OTP**. The flag is dev-only by compile-time enforcement.

### Pre-deploy checklist — re-enabling OTP before going live

When you're done with dev and want production-grade auth back:

1. **`.env.local`** → set `NEXT_PUBLIC_REQUIRE_OTP=true` (or remove the line)
2. **Supabase Dashboard** → Authentication → Providers → Email → toggle Confirm email **ON**
3. **Clean up unconfirmed test accounts** — accounts created during dev mode have `email_confirmed_at = NULL` and will be rejected by Supabase once Confirm email is back on. Two options in **SQL Editor**:
   - Delete them: `DELETE FROM auth.users WHERE email LIKE '%@test.com' OR email = 'your-dev-email@gmail.com';`
   - Or batch-confirm them: `UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;`
4. **Verify the OTP flow still works** — sign up + sign in once each with a fresh email to confirm both 2FA paths still fire.
5. **Vercel env vars** → confirm `NEXT_PUBLIC_REQUIRE_OTP` is NOT set, or set to `true`. (The NODE_ENV guard makes this redundant, but belt-and-suspenders.)

---

## 2.5 Configure Twilio for Phone (SMS) OTP — OPTIONAL

**Skip this section by default.** Phone OTP is feature-flagged off via
`NEXT_PUBLIC_PHONE_AUTH_ENABLED=false`. The login page hides the
"Phone (SMS)" toggle and customers sign in with email/password or Google.
Phone number is still collected at sign-up as a contact field.

If the client later decides they want phone OTP, set
`NEXT_PUBLIC_PHONE_AUTH_ENABLED=true` AND complete this section.
Expect ~RM 25/month in SMS costs at ~100 signups/month.

### Twilio
1. Create a Twilio account at https://www.twilio.com (free trial covers initial testing)
2. Buy or use the trial phone number from the Twilio console
3. From the Twilio console dashboard, copy: **Account SID**, **Auth Token**, **From phone number**

### Supabase dashboard
1. Authentication → Providers → **Phone** → enable
2. Select **Twilio** as the provider
3. Paste the Account SID + Auth Token + Twilio phone number
4. (Optional) Customize the SMS template: keep it short — `Kerala Ayurvedic: your code is {{.Code}}` works well

### Cost & abuse guard rails
- Each SMS to a Malaysian number costs ~RM 0.15–0.25 (USD ~0.05)
- Supabase rate-limits OTP requests per phone per hour by default
- **Set a daily spend cap in Twilio console** (Console → Account → Billing → Usage triggers → e.g. $5/day)
- Test with your own phone first before opening sign-ups

### Apply the migration
Apply `ayurvedic/supabase/migrations/20260515_phone_auth.sql` in Supabase SQL Editor. It makes `public.users.email` nullable (phone-only signups don't have an email yet), adds partial unique indexes on email + phone_number, and extends the `handle_new_user` trigger to copy phone numbers from auth metadata.

---

## 2.6 Configure Apple Sign-In (optional — skip if no Apple Developer account)

If you don't have an Apple Developer Program subscription ($99/yr), leave `NEXT_PUBLIC_APPLE_AUTH_ENABLED=false` in `.env.local` and the button won't render — the page still ships cleanly with Google + Phone + email/password.

### Apple Developer Portal
1. Enroll in the Apple Developer Program at https://developer.apple.com
2. Identifiers → **App ID** → create one (e.g. `com.keralaayurvedic.web`)
3. Identifiers → **Service ID** → create one (this is what Supabase uses) — enable "Sign In with Apple", add return URLs:
   ```
   https://<your-supabase-project>.supabase.co/auth/v1/callback
   ```
4. Keys → create a **Sign In with Apple key** → download the `.p8` file (you can only download once)
5. Note down: Service ID, Team ID (top-right), Key ID

### Supabase dashboard
1. Authentication → Providers → **Apple** → enable
2. Paste: Service ID, Team ID, Key ID, and the contents of the `.p8` file
3. The redirect URL must already match what you set in Apple Service ID

### Enable the button in the app
In `.env.local` (production: in Vercel project settings):
```
NEXT_PUBLIC_APPLE_AUTH_ENABLED=true
```

---

## 3. Promote the first admin

After someone signs up via `/auth/register` (as a regular customer first), promote them in the Supabase SQL Editor:

```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'admin@keralaayurvedic.com';
```

The user must **sign out and sign back in** for the middleware to pick up the new role.

---

## 4. Issue a Brand Partner invite

Until the Admin Command Center sub-project ships the invite UI, create invite rows manually in SQL:

```sql
INSERT INTO public.agent_invites (
  token, email, full_name, referral_code, commission_rate, commission_type
) VALUES (
  'priya-2026',                  -- short, URL-safe token (you choose)
  'priya@example.com',           -- partner's email (locks the signup)
  'Priya Nair',                  -- partner's full name (prefills form)
  'PRIYA01',                     -- referral code (must be unique)
  15.00,                         -- commission rate %
  'affiliate'                    -- 'affiliate' or 'reseller'
);
```

Then send the partner:

```
https://keralaayurvedic.com/auth/register?invite=priya-2026
```

The link is good for 14 days. Single-use — once the partner signs up, the token is consumed.

To list outstanding invites:
```sql
SELECT token, email, full_name, referral_code, commission_rate, commission_type, expires_at
FROM public.agent_invites
WHERE used_at IS NULL AND expires_at > now();
```

---

## 5. Smoke test checklist

Walk through every step. Each should pass without console errors.

1. **Customer signup (password)** — visit `/auth/register` → fill out the form → submit → land on `/account/dashboard` with the Member Portal shell.
2. **Customer signup (Google)** — sign out → `/auth/register` → click "Sign up with Google" → consent → land on `/account/dashboard`.
3. **Role gate** — try `/admin/dashboard` as a customer → bounced back to `/account/dashboard` (middleware redirect).
4. **Promote to admin** — run the SQL from §3 → sign out → sign in → land on `/admin/dashboard` with the Command Center shell.
5. **Admin tries customer route** — visit `/account/dashboard` while signed in as admin → bounced to `/admin/dashboard`.
6. **Password reset** — `/auth/forgot-password` → enter your email → check inbox → click the link → land on `/auth/reset-password` → set a new password → land on `/auth/login?reset=success` → sign in with the new password.
7. **Brand Partner invite flow** — issue an invite via SQL (§4) → visit `/auth/register?invite=<TOKEN>` → see the prefilled email + name + "Brand Partner Invite" eyebrow → set a password → submit → land on `/agent/dashboard` with the Partner Hub shell.
8. **Sign out everywhere** — click the user menu in the topbar of any portal → "Sign out" → bounced to `/`. Try `/account/dashboard` while signed out → redirected to `/auth/login?next=/account/dashboard`.
9. **Tabbed combined login** — visit `/auth/login` → see Sign In tab active. Click "Create Account" tab → URL becomes `?tab=signup`, welcome ribbon appears. Toggle between Email/Phone methods within each tab.
10. **Phone OTP sign-up** — `/auth/login?tab=signup` → Phone method → enter your name + your real Malaysian number → tap "Send code" → receive SMS → enter 6-digit code → auto-verify → land on `/account/dashboard`. Verify `public.users.full_name` and `phone_number` are populated.
11. **Phone OTP sign-in** — sign out → `/auth/login` → Phone method → same number → receive new SMS → enter code → land on `/account/dashboard`.
12. **`/auth/register` redirect** — visit `/auth/register` (no `?invite=`) → redirected to `/auth/login?tab=signup`. Brand Partner invites `/auth/register?invite=TOKEN` still work unchanged.

If any step fails, see the corresponding section above + check the Next.js dev server logs.

---

## 6. What's intentionally NOT in foundation

- Real dashboard content (orders list, products grid, commission cards) — those ship in Sub-projects 1, 2, 3.
- Admin UI for issuing invites — issue them via SQL until Sub-project 2.
- Branded Supabase email templates (reset, confirm) — defaults work; customize in Supabase dashboard later.
- Resend transactional emails (order confirmation, etc.) — later phase.
- Cal.com / Billplz webhook handling — later phase.

---

## 7. Quick reference

| Route | Who can reach it |
|---|---|
| `/`, `/about`, `/products`, `/blog`, `/contact`, `/partners`, etc. | Anyone (public) |
| `/auth/login`, `/auth/register`, `/auth/forgot-password` | Not signed in (signed-in users are redirected to their portal home) |
| `/auth/callback`, `/auth/reset-password` | Anyone (mid-flow) |
| `/account/*` | `role='customer'` only |
| `/admin/*` | `role='admin'` only |
| `/agent/*` | `role='sales_agent'` only |

| Migration / RPC | Purpose |
|---|---|
| `agent_invites` | Holds pending Brand Partner invites |
| `claim_agent_invite(token, user_id)` | Atomic: role promotion + sales_agents insert + invite consumption |
| `handle_new_user` (updated) | Auto-inserts public.users on signup, pulling full_name + phone from metadata |
| `is_admin()` (unchanged) | Used by RLS policies across the schema |

---

## Hard delete of soft-deleted accounts

When a customer triggers self-service deletion, the action anonymizes their `public.users` row
(`full_name='Deleted user'`, email/phone/medical fields nulled) and stamps `deleted_at`.

The corresponding `auth.users` row is **not** removed automatically — we keep a 30-day cooling-off
period so an accidental deletion can be reversed by support. Schedule this monthly in the Supabase
SQL Editor (or via `pg_cron` once set up):

```sql
DELETE FROM auth.users
WHERE id IN (
  SELECT id FROM public.users
  WHERE deleted_at IS NOT NULL
    AND deleted_at < NOW() - INTERVAL '30 days'
);
```

This cascades to `public.users` via the FK. Orders, appointments, and tickets remain (anonymized via
the empty `full_name`) for accounting and clinical-record retention.
