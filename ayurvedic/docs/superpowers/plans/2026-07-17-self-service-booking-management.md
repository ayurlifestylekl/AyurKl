# Self-Service Booking Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let registered and guest customers securely reschedule or cancel eligible bookings without WhatsApp, automatically refund eligible payments, split group members safely, and remove obsolete customer booking behavior.

**Architecture:** Keep the existing signed booking URL compatible, add a dedicated management surface and Brevo-backed guest recovery, and place all eligibility decisions in a pure policy module enforced again by server actions. PostgreSQL functions perform atomic slot moves and state claims; provider adapters perform idempotent Stripe refunds or Billplz Payment Order disbursements; callbacks finalize refund state truthfully.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript 5, Supabase/PostgreSQL, Vitest 2, Brevo SMTP through Nodemailer, Stripe SDK, Billplz V5 Payment Order API.

## Global Constraints

- All policy comparisons use `Asia/Kuala_Lumpur` appointment time and trusted server time.
- Rescheduling is allowed through exactly 24 hours before the appointment; at less than 24 hours it is disabled.
- Automatic full refund eligibility is: cancellation within one hour of row creation, or at least 48 hours before the appointment.
- The one-hour mistake window takes precedence for near-term appointments that have not started.
- Between 24 and 48 hours, rescheduling is available but refundable cancellation is unavailable.
- The one-hour mistake window and unpaid-hold release are explicit cancellation exceptions to the normal 24-hour closure.
- Paid treatments remain paid/confirmed after rescheduling; their therapist assignment is cleared.
- Consultations remain free, confirmed, and exactly 30 minutes.
- Guests do not need Supabase Auth accounts; Brevo sends recovery OTPs.
- OTPs are hashed, expire after 10 minutes, and are rate-limited without revealing whether an email has bookings.
- Stripe refunds return to the original card. Billplz FPX refunds use V5 Payment Orders and collect bank code, account number, and account-holder name at cancellation.
- Never log or persist raw FPX bank account details; retain only bank code and masked last four digits.
- Group members may move/cancel individually without altering other guests; whole-group moves are all-or-nothing.
- Keep legacy approval, alternate-time, and `calcom_booking_uid` database fields for historical reads only.
- Do not apply migrations, use provider credentials, issue refunds, deploy, or touch production without explicit human approval.
- Preserve the existing dirty working tree. Never use `git reset --hard`, `git checkout -- <file>`, `git clean`, `git add .`, or `git add -A`.
- Before every commit run the task test, the complete `npm test` suite, `npm exec -- tsc --noEmit`, and `git diff --check`.
- Stage only the exact files listed by the current task.

---

### Task 1: Centralize management eligibility policy

**Files:**
- Create: `src/lib/booking/management-policy.ts`
- Create: `src/lib/booking/__tests__/management-policy.test.ts`
- Modify: `src/lib/booking/policy.ts`
- Modify: `src/lib/appointments/policy.ts`

**Interfaces:**
- Produces: `managementEligibility(input: ManagementPolicyInput): ManagementEligibility`
- Produces: `refundEligibility(input): 'not_paid' | 'mistake_window' | 'advance_window' | 'not_eligible'`
- Produces constants `RESCHEDULE_CUTOFF_MS`, `REFUND_ADVANCE_MS`, and `MISTAKE_WINDOW_MS`.

- [ ] **Step 1: Write the failing boundary tests**

```ts
import { describe, expect, it } from 'vitest'
import { managementEligibility } from '../management-policy'

const appointmentAt = '2026-07-20T09:30:00+08:00'
const createdAt = '2026-07-18T09:00:00+08:00'
const base = { appointmentAt, createdAt, status: 'confirmed', paymentStatus: 'paid' }

describe('managementEligibility', () => {
  it('allows rescheduling at exactly 24h and closes it one millisecond later', () => {
    expect(managementEligibility({ ...base, nowMs: new Date('2026-07-19T09:30:00+08:00').getTime() }).canReschedule).toBe(true)
    expect(managementEligibility({ ...base, nowMs: new Date('2026-07-19T09:30:00.001+08:00').getTime() }).canReschedule).toBe(false)
  })
  it('refunds a mistake within one hour even for a near-term appointment', () => {
    expect(managementEligibility({
      ...base,
      createdAt: '2026-07-20T07:45:00+08:00',
      nowMs: new Date('2026-07-20T08:30:00+08:00').getTime(),
    }).refundEligibility).toBe('mistake_window')
  })
  it('refunds at 48h but not inside 48h', () => {
    expect(managementEligibility({ ...base, nowMs: new Date('2026-07-18T09:30:00+08:00').getTime() }).refundEligibility).toBe('advance_window')
    expect(managementEligibility({ ...base, nowMs: new Date('2026-07-18T09:30:00.001+08:00').getTime() }).refundEligibility).toBe('not_eligible')
  })
  it('allows unpaid hold cancellation without a refund', () => {
    expect(managementEligibility({ ...base, status: 'awaiting_payment', paymentStatus: 'pending', nowMs: Date.parse(createdAt) + 10_000 })).toMatchObject({ canCancel: true, refundEligibility: 'not_paid' })
  })
})
```

- [ ] **Step 2: Run and observe RED**

Run: `npm test -- src/lib/booking/__tests__/management-policy.test.ts`

Expected: FAIL because `management-policy.ts` does not exist.

- [ ] **Step 3: Implement the pure policy**

```ts
export const MISTAKE_WINDOW_MS = 60 * 60 * 1000
export const RESCHEDULE_CUTOFF_MS = 24 * 60 * 60 * 1000
export const REFUND_ADVANCE_MS = 48 * 60 * 60 * 1000

export type RefundEligibility = 'not_paid' | 'mistake_window' | 'advance_window' | 'not_eligible'
export interface ManagementPolicyInput {
  createdAt: string
  appointmentAt: string
  status: string
  paymentStatus: string
  nowMs: number
}
export interface ManagementEligibility {
  canReschedule: boolean
  canCancel: boolean
  refundEligibility: RefundEligibility
  changeDeadlineISO: string
  refundDeadlineISO: string
  reason: 'eligible' | 'status_closed' | 'appointment_started' | 'change_window_closed' | 'refund_window_closed'
}

export function managementEligibility(input: ManagementPolicyInput): ManagementEligibility {
  const created = Date.parse(input.createdAt)
  const appointment = Date.parse(input.appointmentAt)
  const active = ['pending', 'scheduled', 'awaiting_payment', 'confirmed'].includes(input.status)
  const started = input.nowMs >= appointment
  const changeMs = appointment - input.nowMs
  const canReschedule = active && !started && changeMs >= RESCHEDULE_CUTOFF_MS && input.status !== 'awaiting_payment'
  const unpaid = input.paymentStatus !== 'paid'
  const mistake = !unpaid && input.nowMs - created <= MISTAKE_WINDOW_MS && input.nowMs >= created
  const advance = !unpaid && changeMs >= REFUND_ADVANCE_MS
  const refundable = mistake || advance
  const canCancel = active && !started && (unpaid || refundable)
  return {
    canReschedule,
    canCancel,
    refundEligibility: unpaid ? 'not_paid' : mistake ? 'mistake_window' : advance ? 'advance_window' : 'not_eligible',
    changeDeadlineISO: new Date(appointment - RESCHEDULE_CUTOFF_MS).toISOString(),
    refundDeadlineISO: new Date(appointment - REFUND_ADVANCE_MS).toISOString(),
    reason: !active ? 'status_closed' : started ? 'appointment_started' : canReschedule || canCancel ? 'eligible' : changeMs < RESCHEDULE_CUTOFF_MS ? 'change_window_closed' : 'refund_window_closed',
  }
}
```

Delete the 12-hour cancellation helper and 48-hour account-only helper after replacing every import in later tasks; until then, make them delegate to the new constants and mark them deprecated so intermediate commits compile.

- [ ] **Step 4: Verify Task 1**

Run:

```bash
npm test -- src/lib/booking/__tests__/management-policy.test.ts
npm test
npm exec -- tsc --noEmit
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/lib/booking/management-policy.ts src/lib/booking/__tests__/management-policy.test.ts src/lib/booking/policy.ts src/lib/appointments/policy.ts
git commit -m "feat: define self-service booking policy"
```

---

### Task 2: Add management, OTP, audit, and refund schema

**Files:**
- Create: `supabase/migrations/20260718_self_service_booking_management.sql`
- Create: `src/lib/booking/__tests__/management-migration.test.ts`
- Modify: `src/lib/database.types.ts`
- Modify: `scripts/verify-booking-schema.mjs`

**Interfaces:**
- Produces tables: `booking_management_otps`, `booking_management_grants`, `booking_events`, `booking_refunds`.
- Produces appointment fields: `group_management_active`, `group_detached_at`, `management_reminder_sent_at`.

- [ ] **Step 1: Write the failing migration contract test**

```ts
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const sql = readFileSync(resolve(process.cwd(), 'supabase/migrations/20260718_self_service_booking_management.sql'), 'utf8')
describe('self-service booking management migration', () => {
  it('creates private recovery, grant, audit, and refund records', () => {
    for (const table of ['booking_management_otps', 'booking_management_grants', 'booking_events', 'booking_refunds']) {
      expect(sql).toContain(`create table if not exists public.${table}`)
    }
    expect(sql).toContain('revoke all on public.booking_management_otps from anon, authenticated')
    expect(sql).toContain('unique (idempotency_key)')
  })
  it('supports safe group detachment', () => {
    expect(sql).toContain('group_management_active boolean not null default true')
  })
})
```

- [ ] **Step 2: Run and observe RED**

Run: `npm test -- src/lib/booking/__tests__/management-migration.test.ts`

Expected: FAIL because the migration does not exist.

- [ ] **Step 3: Create the schema migration**

Use these exact table purposes and constraints:

```sql
create table if not exists public.booking_management_otps (
  id uuid primary key default gen_random_uuid(),
  email_hash text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0 check (attempts between 0 and 6),
  send_count integer not null default 1 check (send_count between 1 and 5),
  request_ip_hash text,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists booking_management_otps_lookup_idx
  on public.booking_management_otps(email_hash, created_at desc);

create table if not exists public.booking_management_grants (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  email_hash text not null,
  appointment_ids uuid[] not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.booking_events (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  event_type text not null check (event_type in ('rescheduled','cancelled','group_detached','refund_requested','refund_confirmed','refund_failed','management_link_recovered')),
  actor_type text not null check (actor_type in ('customer','guest','staff','system','provider')),
  old_data jsonb not null default '{}'::jsonb,
  new_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists booking_events_appointment_idx on public.booking_events(appointment_id, created_at desc);

create table if not exists public.booking_refunds (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete restrict,
  provider text not null check (provider in ('stripe','billplz','stub')),
  provider_refund_id text,
  amount_rm numeric(10,2) not null check (amount_rm > 0),
  status text not null check (status in ('claimed','pending','confirmed','failed','exception')),
  eligibility_reason text not null check (eligibility_reason in ('mistake_window','advance_window')),
  idempotency_key text not null,
  bank_code text,
  bank_account_last4 text,
  failure_reason text,
  requested_at timestamptz,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (idempotency_key)
);
alter table public.booking_refunds enable row level security;

alter table public.appointments
  add column if not exists group_management_active boolean not null default true,
  add column if not exists group_detached_at timestamptz,
  add column if not exists management_reminder_sent_at timestamptz;

revoke all on public.booking_management_otps from anon, authenticated;
revoke all on public.booking_management_grants from anon, authenticated;
revoke all on public.booking_events from anon, authenticated;
revoke all on public.booking_refunds from anon, authenticated;
```

- [ ] **Step 4: Regenerate or mechanically update database types and schema probe**

Add the four tables and three appointment fields to `Database`. Extend the verifier with read-only `.limit(1)` checks for all four tables and the three appointment columns.

- [ ] **Step 5: Verify Task 2**

Run:

```bash
npm test -- src/lib/booking/__tests__/management-migration.test.ts
npm test
npm exec -- tsc --noEmit
git diff --check
```

Expected: all local commands pass. Do not apply the migration.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20260718_self_service_booking_management.sql src/lib/booking/__tests__/management-migration.test.ts src/lib/database.types.ts scripts/verify-booking-schema.mjs
git commit -m "feat: add booking management schema"
```

---

### Task 3: Build Brevo guest recovery and scoped management grants

**Files:**
- Create: `src/lib/booking/guest-recovery.ts`
- Create: `src/lib/booking/__tests__/guest-recovery.test.ts`
- Create: `src/lib/booking/management-access.ts`
- Create: `src/lib/booking/management-actions.ts`
- Create: `src/app/(public)/book/manage/page.tsx`
- Create: `src/components/booking/GuestBookingRecovery.tsx`
- Modify: `src/lib/booking/access.ts`
- Modify: `src/lib/booking/notify.ts`

**Interfaces:**
- Produces: `normalizeBookingEmail`, `hashManagementValue`, `generateOtp`, `verifyOtpHash`.
- Produces actions: `requestGuestManagementOtp(email)` and `verifyGuestManagementOtp(email, code)`.
- Produces: `canManageBooking(id, customerId, token)` and `canManageBookingTarget(anchorId, targetId, token)` supporting ownership, legacy HMAC tokens, group anchoring, and persisted grant tokens.
- Produces common result: `type ManagementActionResult<T = undefined> = { ok: true; data: T } | { error: string; code: 'UNAUTHORIZED' | 'POLICY_CLOSED' | 'SLOT_FULL' | 'INVALID_INPUT' | 'PROVIDER_ERROR' }`.

- [ ] **Step 1: Write failing recovery tests**

```ts
import { describe, expect, it } from 'vitest'
import { generateOtp, hashManagementValue, normalizeBookingEmail, verifyOtpHash } from '../guest-recovery'

describe('guest recovery primitives', () => {
  it('normalizes email without exposing it in a lookup key', () => {
    expect(normalizeBookingEmail(' Guest@Example.COM ')).toBe('guest@example.com')
    expect(hashManagementValue('guest@example.com')).toMatch(/^[a-f0-9]{64}$/)
  })
  it('creates a six-digit code and verifies only its hash', () => {
    const code = generateOtp()
    expect(code).toMatch(/^\d{6}$/)
    expect(verifyOtpHash(code, hashManagementValue(code))).toBe(true)
    expect(verifyOtpHash('000000', hashManagementValue(code))).toBe(code === '000000')
  })
})
```

- [ ] **Step 2: Run and observe RED**

Run: `npm test -- src/lib/booking/__tests__/guest-recovery.test.ts`

Expected: FAIL because `guest-recovery.ts` is missing.

- [ ] **Step 3: Implement cryptographic primitives and neutral actions**

Use `randomInt(0, 1_000_000).toString().padStart(6, '0')`, HMAC-SHA256 with `BOOKING_LINK_SECRET`, and `timingSafeEqual`. `requestGuestManagementOtp` reads the source IP from trusted Next.js request headers, hashes it immediately, and always returns `{ ok: true, data: { message: 'If that email has eligible bookings, a code has been sent.' } }`, even when no matching booking exists.

Enforce before sending:

- maximum one send per normalized email per 60 seconds;
- maximum five sends per email per hour;
- maximum 20 sends per IP hash per hour; and
- only active guest bookings with `patient_email` matching case-insensitively are included.

Send the code through the existing Brevo-backed `sendEmail`/SMTP seam with a 10-minute expiry. Do not log the email, token, or code.

- [ ] **Step 4: Issue scoped opaque grants after verification**

On a valid, unconsumed OTP with fewer than six attempts:

```ts
const rawToken = randomBytes(32).toString('base64url')
const tokenHash = hashManagementValue(rawToken)
const appointmentIds = matchingActiveGuestRows.map((row) => row.id)
await sb.from('booking_management_grants').insert({
  token_hash: tokenHash,
  email_hash: hashManagementValue(normalizedEmail),
  appointment_ids: appointmentIds,
  expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
})
```

Revoke prior unexpired grants for the email hash, mark the OTP consumed, write a `management_link_recovered` event per appointment, and return `{ ok: true, data: { href: /book/manage?t=<rawToken> } }`. `canManageBooking` first accepts the existing `verifyBookingToken(id, token)`, then hashes the opaque token and checks an unexpired/unrevoked grant containing `id`, then falls back to signed-in ownership. `canManageBookingTarget` accepts an opaque grant containing the target; for a legacy group link it verifies the anchor HMAC and requires the target to share the anchor's non-null `group_id` (including a previously detached member's retained audit `group_id`).

- [ ] **Step 5: Add the recovery page and form**

The page has two explicit states: email entry and six-digit code entry. Use the neutral response, 60-second resend timer, accessible error messages, and no booking details until verification succeeds.

- [ ] **Step 6: Verify Task 3**

Run:

```bash
npm test -- src/lib/booking/__tests__/guest-recovery.test.ts
npm test
npm exec -- tsc --noEmit
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit**

```bash
git add src/lib/booking/guest-recovery.ts src/lib/booking/__tests__/guest-recovery.test.ts src/lib/booking/management-access.ts src/lib/booking/management-actions.ts src/app/'(public)'/book/manage/page.tsx src/components/booking/GuestBookingRecovery.tsx src/lib/booking/access.ts src/lib/booking/notify.ts
git commit -m "feat: add guest booking recovery"
```

---

### Task 4: Create the unified management read model and entry points

**Files:**
- Create: `src/lib/booking/management.ts`
- Create: `src/lib/booking/__tests__/management-model.test.ts`
- Create: `src/app/(public)/book/request/[id]/manage/page.tsx`
- Create: `src/components/booking/ManageBookingPanel.tsx`
- Modify: `src/app/(public)/book/request/[id]/page.tsx`
- Modify: `src/components/account/AppointmentListCard.tsx`
- Modify: `src/components/account/NextAppointmentHero.tsx`
- Modify: `src/components/account/UpcomingAppointmentsCard.tsx`
- Modify: `src/lib/dashboard/appointment-queries.ts`

**Interfaces:**
- Produces: `getBookingManagementModel(id, token): Promise<BookingManagementModel | null>`.
- Produces: `buildManagementModel(row, nowMs): BookingManagementModel` where the model contains `bookingKind`, `refundEligibility`, `canReschedule`, `canCancel`, deadlines, payment/refund display state, and group members.
- Consumes: `managementEligibility` and `canManageBooking`.

- [ ] **Step 1: Write failing model tests**

Test a confirmed paid treatment, a free consultation, a closed-window booking, and a historical `calcom_booking_uid` row. Assert the model's actions depend only on policy/status/access, never on Cal.com UID.

```ts
const row = {
  id: 'a', created_at: '2026-07-17T09:00:00Z', appointment_date_time: '2026-07-21T09:30:00+08:00',
  status: 'confirmed', payment_status: 'paid', booking_kind: 'treatment', calcom_booking_uid: null,
}
expect(buildManagementModel(row, Date.parse('2026-07-18T08:00:00+08:00'))).toMatchObject({ canReschedule: true, canCancel: true })
expect(buildManagementModel({ ...row, calcom_booking_uid: null }, Date.parse('2026-07-18T08:00:00+08:00')))
  .toEqual(buildManagementModel({ ...row, calcom_booking_uid: 'legacy' }, Date.parse('2026-07-18T08:00:00+08:00')))
expect(buildManagementModel({ ...row, booking_kind: 'consultation', payment_status: 'unpaid' }, Date.parse('2026-07-18T08:00:00+08:00')))
  .toMatchObject({ bookingKind: 'consultation', refundEligibility: 'not_paid' })
```

- [ ] **Step 2: Run and observe RED**

Run: `npm test -- src/lib/booking/__tests__/management-model.test.ts`

Expected: FAIL because the model builder does not exist.

- [ ] **Step 3: Implement the model and management page**

Return treatment/consultation identity, group members, selected time, payment/refund state, therapist display, deadlines, policy reason, and permitted actions. The dedicated page must call `canManageBooking`, render `notFound()` on unauthorized access, and link back to the status page.

- [ ] **Step 4: Replace customer actions with one entry point**

Every eligible upcoming account card and hero receives:

```tsx
<Link href={`/book/request/${appointment.id}/manage`}>
  Manage booking
</Link>
```

Guest status links preserve `?t=`. Remove UID-gated WhatsApp/Cal.com branching, `canCancelInApp`, 48-hour copy, internal `target="_blank"`, and separate account-level cancel/reschedule buttons. Awaiting-payment cards keep `Pay now` plus `Manage booking` for hold cancellation.

- [ ] **Step 5: Verify Task 4**

Run source scans as well as the normal gate:

```bash
npm test -- src/lib/booking/__tests__/management-model.test.ts
npm test
npm exec -- tsc --noEmit
rg -n "WhatsApp to change|Past cancel window|calcom_booking_uid|48 hours.*cancel" src/components/account src/app/'(public)'/book/request
git diff --check
```

Expected: tests/types pass and the scan has no active UI matches.

- [ ] **Step 6: Commit**

```bash
git add src/lib/booking/management.ts src/lib/booking/__tests__/management-model.test.ts src/app/'(public)'/book/request/'[id]'/manage/page.tsx src/components/booking/ManageBookingPanel.tsx src/app/'(public)'/book/request/'[id]'/page.tsx src/components/account/AppointmentListCard.tsx src/components/account/NextAppointmentHero.tsx src/components/account/UpcomingAppointmentsCard.tsx src/lib/dashboard/appointment-queries.ts
git commit -m "feat: add unified manage booking screen"
```

---

### Task 5: Move appointment capacity atomically during rescheduling

**Files:**
- Create: `supabase/migrations/20260718b_atomic_booking_reschedule.sql`
- Create: `src/lib/booking/reschedule.ts`
- Create: `src/lib/booking/__tests__/reschedule.test.ts`
- Create: `src/components/booking/RescheduleBookingForm.tsx`
- Modify: `src/components/booking/ManageBookingPanel.tsx`
- Modify: `src/lib/database.types.ts`
- Modify: `scripts/verify-booking-schema.mjs`

**Interfaces:**
- Produces RPC: `reschedule_bookings(p_changes jsonb, p_actor_type text, p_now timestamptz): jsonb`.
- Produces action: `rescheduleBooking(input: RescheduleBookingInput): Promise<ManagementActionResult>`.
- Produces `buildRescheduleClaim` and `prepareReschedule` pure validation seams used before the RPC.

```ts
export interface RescheduleBookingInput {
  anchorId: string
  appointmentIds: string[]
  token?: string | null
  selections: Record<string, string>
  wholeGroup: boolean
}
```

- [ ] **Step 1: Write failing reschedule tests**

Cover cutoff enforcement, treatment duration, consultation 30-minute duration, assignment clearing, original-slot preservation, and the atomic migration contract:

```ts
it('validates before clearing assignment and preserves confirmed/payment state', () => {
  const sql = readFileSync(resolve(process.cwd(), 'supabase/migrations/20260718b_atomic_booking_reschedule.sql'), 'utf8')
  expect(sql.indexOf("raise exception 'SLOT_FULL'")).toBeLessThan(sql.indexOf('assigned_therapist_code = null'))
  expect(sql).toContain("status = 'confirmed'")
  expect(sql).not.toMatch(/payment_status\s*=/)
  expect(sql).toContain('pg_advisory_xact_lock')
})
it('canonicalizes consultation moves to 30 minutes', () => {
  expect(buildRescheduleClaim({ bookingKind: 'consultation', requestedDurationMins: 90 })).toMatchObject({ durationMins: 30, resourceType: 'consultation' })
})
it('rejects a move inside the 24-hour cutoff before calling the RPC', async () => {
  const result = await prepareReschedule({ appointmentAt: '2026-07-20T09:30:00+08:00', newStart: '2026-07-21T09:30:00+08:00', nowMs: Date.parse('2026-07-19T10:00:00+08:00') })
  expect(result).toEqual({ error: 'The online rescheduling window has closed.' })
})
```

- [ ] **Step 2: Run and observe RED**

Run: `npm test -- src/lib/booking/__tests__/reschedule.test.ts`

Expected: FAIL because the action/RPC contract does not exist.

- [ ] **Step 3: Implement the atomic RPC**

`p_changes` is a non-empty JSON array containing:

```json
{
  "appointment_id": "uuid",
  "resource_type": "gender",
  "resource_key": "men_only",
  "capacity": 2,
  "old_start": "ISO",
  "new_start": "ISO",
  "duration_mins": 60,
  "detach_from_group": false
}
```

The SQL function must:

1. lock appointment rows in UUID order;
2. validate each old timestamp/status with database `p_now`;
3. reject when any current appointment has crossed its 24-hour change cutoff, or any new start is not in the future;
4. acquire advisory locks ordered by resource type/key/Malaysia day;
5. count overlaps using the existing duration plus 30-minute buffer while excluding all appointment IDs being moved;
6. raise `SLOT_FULL` before any update when capacity is insufficient;
7. update `requested_datetime`, `appointment_date_time`, `assigned_therapist_code = null`, and `doctor_name = 'To be assigned'` for treatments;
8. preserve `status = 'confirmed'` and all payment fields;
9. detach only requested group members by setting `group_management_active = false` and `group_detached_at = p_now`; and
10. insert `rescheduled` and optional `group_detached` audit events in the same transaction.

- [ ] **Step 4: Implement the server action and form**

The action authorizes first, re-evaluates `managementEligibility` with server time, calls `validateSubmittedSlot`, checks centre/Vaidya/therapist blocks, calculates capacity, then calls the RPC. The form reuses `SlotPicker` in management mode, shows old/new confirmation, and preserves the original UI on failure.

- [ ] **Step 5: Verify Task 5**

```bash
npm test -- src/lib/booking/__tests__/reschedule.test.ts
npm test
npm exec -- tsc --noEmit
git diff --check
```

Expected: all commands exit 0. Do not apply the migration.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20260718b_atomic_booking_reschedule.sql src/lib/booking/reschedule.ts src/lib/booking/__tests__/reschedule.test.ts src/components/booking/RescheduleBookingForm.tsx src/components/booking/ManageBookingPanel.tsx src/lib/database.types.ts scripts/verify-booking-schema.mjs
git commit -m "feat: reschedule bookings atomically"
```

---

### Task 6: Support whole-group and individual guest management

**Files:**
- Create: `src/lib/booking/group-management.ts`
- Create: `src/lib/booking/__tests__/group-management.test.ts`
- Create: `src/components/booking/GroupManagementPanel.tsx`
- Modify: `src/lib/booking/reschedule.ts`
- Modify: `src/components/booking/ManageBookingPanel.tsx`
- Modify: `src/lib/storefront/booking.ts`

**Interfaces:**
- Produces: `activeManagementMembers(rows)` and `buildGroupRescheduleChanges(rows, selections)`.
- Consumes: `reschedule_bookings` RPC and per-row management policy.

- [ ] **Step 1: Write failing group tests**

```ts
it('detaches one moved member without changing the others', () => {
  const changes = buildGroupRescheduleChanges(rows, { guestA: '2026-07-25T10:00:00+08:00' })
  expect(changes).toEqual([expect.objectContaining({ appointmentId: 'guestA', detachFromGroup: true })])
  expect(changes.some((x) => x.appointmentId === 'guestB')).toBe(false)
})
it('moves the entire active group atomically', () => {
  const changes = buildGroupRescheduleChanges(rows, { guestA: slotA, guestB: slotB }, { wholeGroup: true })
  expect(changes).toHaveLength(2)
  expect(changes.every((x) => x.detachFromGroup === false)).toBe(true)
})
it('excludes previously detached rows from whole-group operations', () => {
  expect(activeManagementMembers([{ id: 'a', group_management_active: false }, { id: 'b', group_management_active: true }]).map((x) => x.id)).toEqual(['b'])
})
```

- [ ] **Step 2: Run and observe RED**

Run: `npm test -- src/lib/booking/__tests__/group-management.test.ts`

Expected: FAIL because group helpers do not exist.

- [ ] **Step 3: Implement group orchestration and UI**

Show `Manage entire group` and one card per active guest. Whole-group rescheduling collects a new slot for every guest and submits one RPC call. Individual rescheduling submits one change with detachment. Preserve group organizer access to detached rows through the current token/grant appointment list.

- [ ] **Step 4: Verify Task 6**

```bash
npm test -- src/lib/booking/__tests__/group-management.test.ts
npm test
npm exec -- tsc --noEmit
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/lib/booking/group-management.ts src/lib/booking/__tests__/group-management.test.ts src/components/booking/GroupManagementPanel.tsx src/lib/booking/reschedule.ts src/components/booking/ManageBookingPanel.tsx src/lib/storefront/booking.ts
git commit -m "feat: manage group guests individually"
```

---

### Task 7: Add idempotent Stripe and Billplz refund providers

**Files:**
- Modify: `src/lib/payments/provider.ts`
- Modify: `src/lib/payments/stripe.ts`
- Modify: `src/lib/payments/billplz.ts`
- Modify: `src/lib/payments/stub.ts`
- Create: `src/lib/payments/refund.ts`
- Create: `src/lib/payments/__tests__/refund.test.ts`
- Create: `src/app/api/payments/billplz-refund-callback/route.ts`
- Modify: `src/app/api/payments/stripe-webhook/route.ts`
- Modify: `.env.example`

**Interfaces:**
- Extends `PaymentProvider` with `createRefund`, `fetchRefundStatus`, and optional `verifyRefundCallback`.
- Produces: `requestProviderRefund(args): Promise<ProviderRefundResult>` and `reconcileRefund(id)`.

- [ ] **Step 1: Write failing provider contract tests**

```ts
expect(stripeProvider.createRefund).toBeTypeOf('function')
expect(billplzProvider.createRefund).toBeTypeOf('function')
expect(buildBillplzChecksum(['collection','1234567890','2000','123'], secret)).toMatch(/^[a-f0-9]{128}$/)
expect(maskBankAccount('1234567890')).toBe('******7890')
```

Also test Stripe idempotency key forwarding, Billplz `reference_id` reuse, callback checksum verification, completed/pending/failed mappings, and absence of raw bank numbers from persisted result/error strings.

- [ ] **Step 2: Run and observe RED**

Run: `npm test -- src/lib/payments/__tests__/refund.test.ts`

Expected: FAIL because the refund interface does not exist.

- [ ] **Step 3: Implement the provider seam**

```ts
export interface RefundArgs {
  billId: string
  amountRm: number
  idempotencyKey: string
  customerEmail: string
  bank?: { bankCode: string; accountNumber: string; accountHolderName: string }
}
export interface ProviderRefundResult {
  providerRefundId: string
  status: 'pending' | 'confirmed'
  bankCode?: string
  bankAccountLast4?: string
}
```

Stripe retrieves the Checkout Session, resolves its `payment_intent`, and calls `stripe.refunds.create({ payment_intent, amount }, { idempotencyKey })`. Map succeeded to `confirmed`, pending to `pending`, and throw on failed/canceled.

Billplz requires `BILLPLZ_PAYMENT_ORDER_COLLECTION_ID` and bank details. POST `/api/v5/payment_orders` with `total` in sen, `reference_id = idempotencyKey`, `recipient_notification=true`, and HMAC-SHA512 checksum over `[collectionId, accountNumber, total, epoch]`. Persist only returned order ID, status, bank code, and last four digits. Verify callbacks with checksum values `[id, bank_account_number, status, total, reference_id, epoch]`, then discard the raw account number.

Add required `.env.example` entries `BILLPLZ_PAYMENT_ORDER_COLLECTION_ID` and `BILLPLZ_PAYMENT_ORDER_SIGNATURE_KEY`. Do not silently fall back to the collection bill webhook secret.

- [ ] **Step 4: Add provider callbacks and reconciliation**

Callbacks validate signatures before looking up `booking_refunds.provider_refund_id`, update only `pending` rows, and return 200 for duplicate terminal callbacks. Extend the existing Stripe webhook to handle `refund.updated`; do not create a second Stripe endpoint. Billplz accepts `completed` as confirmed and maps `refunded` or `cancelled` Payment Order states to exception because the outgoing disbursement did not remain completed.

- [ ] **Step 5: Verify Task 7**

```bash
npm test -- src/lib/payments/__tests__/refund.test.ts
npm test
npm exec -- tsc --noEmit
git diff --check
```

Expected: all commands exit 0 without external provider calls.

- [ ] **Step 6: Commit**

```bash
git add src/lib/payments/provider.ts src/lib/payments/stripe.ts src/lib/payments/billplz.ts src/lib/payments/stub.ts src/lib/payments/refund.ts src/lib/payments/__tests__/refund.test.ts src/app/api/payments/billplz-refund-callback/route.ts src/app/api/payments/stripe-webhook/route.ts .env.example
git commit -m "feat: add automatic booking refunds"
```

---

### Task 8: Make cancellation and refund claiming atomic

**Files:**
- Create: `supabase/migrations/20260718c_atomic_booking_cancellation.sql`
- Create: `src/lib/booking/cancellation.ts`
- Create: `src/lib/booking/__tests__/cancellation.test.ts`
- Create: `src/components/booking/CancelBookingDialog.tsx`
- Modify: `src/components/booking/ManageBookingPanel.tsx`
- Modify: `src/lib/booking/actions.ts`
- Modify: `src/lib/booking/notify.ts`
- Modify: `src/lib/database.types.ts`
- Modify: `scripts/verify-booking-schema.mjs`

**Interfaces:**
- Produces RPC: `claim_booking_cancellation(p_appointment_ids uuid[], p_now timestamptz, p_actor_type text): jsonb`.
- Produces action: `cancelManagedBooking(input: CancelManagedBookingInput): Promise<ManagementActionResult>`.
- Produces pure helpers `validateCancellationInput`, `refundIdempotencyKey`, `refundStateAfterProvider`, and `cancellationAppointmentIds`.

```ts
export interface CancelManagedBookingInput {
  anchorId: string
  appointmentIds: string[]
  token?: string | null
  wholeGroup: boolean
  bank?: { bankCode: string; accountNumber: string; accountHolderName: string }
}
```

- [ ] **Step 1: Write failing cancellation tests**

```ts
it('requires bank details only for eligible paid FPX cancellation', () => {
  expect(validateCancellationInput({ provider: 'billplz', paid: true, refundEligible: true, bank: undefined })).toEqual({ error: 'Bank details are required for an FPX refund.' })
  expect(validateCancellationInput({ provider: 'stripe', paid: true, refundEligible: true, bank: undefined })).toEqual({ ok: true })
})
it('uses one deterministic refund claim per appointment', () => {
  expect(refundIdempotencyKey('appointment-a')).toBe('booking-refund:appointment-a:full')
})
it('never treats a provider exception as refunded', () => {
  expect(refundStateAfterProvider({ status: 'exception' })).toEqual({ refundStatus: 'exception', paymentStatus: 'paid' })
})
it('cancels one active group member without selecting siblings', () => {
  expect(cancellationAppointmentIds(groupRows, { memberId: 'a' })).toEqual(['a'])
})
```

- [ ] **Step 2: Run and observe RED**

Run: `npm test -- src/lib/booking/__tests__/cancellation.test.ts`

Expected: FAIL because managed cancellation does not exist.

- [ ] **Step 3: Implement the cancellation claim RPC**

The RPC locks sorted rows, recalculates eligibility with database `created_at`, `appointment_date_time`, `payment_status`, and `p_now`, rejects ineligible rows, and:

- unpaid: sets `cancelled`, releases the hold, records audit, returns `refund_required=false`;
- paid: inserts one `booking_refunds(status='claimed')` per appointment with deterministic key `booking-refund:<appointmentId>:full`, sets appointment `cancelled` while leaving `payment_status='paid'`, records audit, and returns claimed refund rows;
- individual group: sets only that row `group_management_active=false` and records detachment;
- whole group: changes every active member or none.

Do not mark `payment_status='refunded'` inside this RPC.

- [ ] **Step 4: Implement orchestration and truthful UI**

The server action authorizes, calls the RPC, voids unpaid bills, and calls `requestProviderRefund` for claimed paid rows. Store `pending/confirmed/exception`; mark appointment payment `refunded` only after confirmed provider state. Billplz bank details exist only in the in-memory action/provider call and are never included in logging or database writes.

The dialog shows the policy reason, amount, and provider-specific fields. Disable the submit button after the first click. Render `Refund pending`, `Refunded`, or `Refund needs review` from persisted state.

- [ ] **Step 5: Replace the legacy cancellation action**

Keep `cancelBooking` only as a compatibility wrapper for unpaid historical links; paid customer cancellation must call `cancelManagedBooking`. Remove the 12-hour notification language and send policy-specific cancellation/refund messages.

- [ ] **Step 6: Verify Task 8**

```bash
npm test -- src/lib/booking/__tests__/cancellation.test.ts
npm test
npm exec -- tsc --noEmit
git diff --check
```

Expected: all commands exit 0. Do not apply the migration or call providers.

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations/20260718c_atomic_booking_cancellation.sql src/lib/booking/cancellation.ts src/lib/booking/__tests__/cancellation.test.ts src/components/booking/CancelBookingDialog.tsx src/components/booking/ManageBookingPanel.tsx src/lib/booking/actions.ts src/lib/booking/notify.ts src/lib/database.types.ts scripts/verify-booking-schema.mjs
git commit -m "feat: cancel bookings with automatic refunds"
```

---

### Task 9: Complete notifications, staff visibility, and old-flow cleanup

**Files:**
- Create: `src/lib/booking/__tests__/management-copy.test.ts`
- Modify: `src/lib/booking/notify.ts`
- Modify: `src/lib/email/templates/appointmentConfirmation.ts`
- Create: `src/app/api/cron/appointment-reminders/route.ts`
- Modify: `src/components/booking/PolicyDisclaimers.tsx`
- Modify: `src/app/(public)/book/request/[id]/page.tsx`
- Modify: `src/app/(public)/book/request/[id]/checkout/page.tsx`
- Modify: `src/components/staff/ConsoleShell.tsx`
- Modify: `src/app/(staff)/console/page.tsx`
- Modify: `src/app/(staff)/console/[id]/page.tsx`
- Modify: `src/app/admin/(portal)/appointments/[id]/page.tsx`
- Modify: `src/lib/staff/appointments.ts`
- Modify: `package.json`
- Modify mechanically: `package-lock.json`
- Modify: `docs/BOOKING_SYSTEM.md`
- Modify: `docs/BOOKING_GUIDE_FOR_CLINIC.md`

**Interfaces:**
- Consumes all management actions, events, and refund states.
- Produces consistent customer/staff copy and a refund-exception operational view.

- [ ] **Step 1: Write failing source/copy contracts**

Assert confirmation/reminder email templates contain `Manage booking`, policy text uses 1h/24h/48h consistently, the reminder cron selects the 72-to-73-hour window and claims `management_reminder_sent_at`, staff queries expose pending/exception refunds, and active customer files contain none of the forbidden phrases:

```ts
const active = paths.map(source).join('\n')
expect(active).toContain('Manage booking')
expect(active).not.toMatch(/WhatsApp.*reschedul|Cal\.com|Once approved|Some guests are still being approved|Cancellations within 12 hours|48 hours' notice required to cancel/i)
const staffQuery = source('src/lib/staff/appointments.ts')
expect(staffQuery).toContain(".in('status', ['pending', 'exception'])")
const reminders = source('src/app/api/cron/appointment-reminders/route.ts')
expect(reminders).toContain('management_reminder_sent_at')
expect(reminders).toContain('72 * 60 * 60 * 1000')
expect(reminders).toContain('73 * 60 * 60 * 1000')
```

- [ ] **Step 2: Run and observe RED**

Run: `npm test -- src/lib/booking/__tests__/management-copy.test.ts`

Expected: FAIL on current notification/status/account copy.

- [ ] **Step 3: Update customer and staff notifications**

Send Brevo emails for OTP, rescheduled, cancelled, refund pending, refund confirmed, and refund exception. Every customer notification includes the secure `Manage booking` link. Create an appointment reminder route that rejects requests unless `Authorization: Bearer ${CRON_SECRET}` matches, selects confirmed appointments 72-to-73 hours away, and claims each row with `update({ management_reminder_sent_at: nowISO }).eq('id', id).is('management_reminder_sent_at', null)` before sending. It sends one reminder, respects member reminder opt-out, and always sends operational guest reminders. Staff messages include old/new time, assignment-cleared state, group member, refund amount/provider/state, and appointment link, but never bank account or OTP data.

- [ ] **Step 4: Add operational visibility**

Add a `Refund exceptions` count/view to the front-desk overview and appointment detail. Show booking event history on front-desk/admin details. Rescheduled paid treatments must appear in `Needs therapist` through the existing `assigned_therapist_code IS NULL` query.

- [ ] **Step 5: Remove remaining old-flow behavior and unused Resend package**

Remove active approval/group-approval copy from new instant rows while retaining explicitly labelled historical rendering. Replace request-page metadata with `Manage your booking`. Run `npm uninstall resend`; verify no active import existed. Keep Brevo/Nodemailer.

- [ ] **Step 6: Verify Task 9**

```bash
npm test -- src/lib/booking/__tests__/management-copy.test.ts
npm test
npm exec -- tsc --noEmit
rg -n "WhatsApp.*reschedul|Cal\.com|Once approved|Some guests are still being approved|Cancellations within 12 hours|48 hours' notice required to cancel|from ['\"]resend['\"]" src package.json
git diff --check
npm run build
```

Expected: tests/types/build pass; the scan returns no active matches.

- [ ] **Step 7: Commit**

```bash
git add src/lib/booking/__tests__/management-copy.test.ts src/lib/booking/notify.ts src/lib/email/templates/appointmentConfirmation.ts src/app/api/cron/appointment-reminders/route.ts src/components/booking/PolicyDisclaimers.tsx src/app/'(public)'/book/request/'[id]'/page.tsx src/app/'(public)'/book/request/'[id]'/checkout/page.tsx src/components/staff/ConsoleShell.tsx src/app/'(staff)'/console/page.tsx src/app/'(staff)'/console/'[id]'/page.tsx src/app/admin/'(portal)'/appointments/'[id]'/page.tsx src/lib/staff/appointments.ts package.json package-lock.json docs/BOOKING_SYSTEM.md docs/BOOKING_GUIDE_FOR_CLINIC.md
git commit -m "fix: align booking management across dashboards"
```

---

### Task 10: Verify staging migrations, email, refunds, races, and role journeys

**Files:**
- Create: `docs/self-service-booking-verification.md`
- Modify: `scripts/verify-booking-schema.mjs`
- Modify: `docs/booking-release-verification.md`

**Interfaces:**
- Produces the release evidence and final pass/fail gate.

- [ ] **Step 1: Run the complete local gate**

```bash
npm test
npm exec -- tsc --noEmit
git diff --check
npm run build
node --env-file=.env.local scripts/verify-booking-schema.mjs
```

Expected: tests/types/build pass. The schema verifier may fail only because unapplied staging migrations are missing; record the exact check names without printing credentials.

- [ ] **Step 2: Apply migrations to staging/test only after explicit approval**

Apply in order:

```text
20260718_self_service_booking_management.sql
20260718b_atomic_booking_reschedule.sql
20260718c_atomic_booking_cancellation.sql
```

Re-run the schema verifier. Do not apply to production.

- [ ] **Step 3: Verify Brevo recovery and notifications**

With dedicated test bookings, record evidence for valid OTP, wrong/expired/reused OTP, resend throttling, neutral unknown-email response, recovered grant access, confirmation/reminder management links, reschedule email, and each refund state email.

- [ ] **Step 4: Verify provider refunds in sandboxes/test mode**

Record:

- Stripe full refund returns to the original test card exactly once;
- Stripe duplicate submit/callback produces no second refund;
- Billplz sandbox Payment Order uses `DUMMYBANKVERIFIED`, confirms by signed callback, and stores only masked details;
- Billplz insufficient Payment Order Limit becomes a staff exception;
- individual group refund uses the exact guest amount; and
- whole-group refund equals the original shared charge.

- [ ] **Step 5: Verify concurrency and group invariants**

Run two simultaneous claims for one last slot and record one success/one `SLOT_FULL`. Force a failed whole-group move and verify every original slot remains. Reschedule one paid guest and verify other guests, shared payment audit, and organizer access remain intact.

- [ ] **Step 6: Run browser smoke tests at 390px and 1440px**

Verify member dashboard, guest email link, guest OTP recovery, treatment and consultation reschedule, refundable/non-refundable boundary displays, Stripe/FPX cancellation forms, individual/whole-group management, red unassigned queue, refund exceptions, historical rows, and absence of WhatsApp/Cal.com/approval-era customer behavior. Link screenshot paths in `docs/self-service-booking-verification.md`.

- [ ] **Step 7: Commit verification artifacts**

Run the complete local gate again, then:

```bash
git add docs/self-service-booking-verification.md scripts/verify-booking-schema.mjs docs/booking-release-verification.md
git commit -m "test: verify self-service booking management"
```

---

## Completion Criteria

- Registered and guest customers manage bookings without WhatsApp or account creation.
- Brevo OTP recovery is enumeration-resistant, rate-limited, and scoped.
- The 1-hour, 24-hour, and 48-hour rules pass exact-boundary tests and use server time.
- Atomic rescheduling preserves the original booking on every failure and clears treatment assignment only after success.
- Individual and whole-group operations preserve unrelated guests and payment audit history.
- Stripe and Billplz automatic refunds are idempotent and truthfully represented.
- Raw FPX bank details are neither logged nor persisted.
- Refund failures are visible to staff and never reported as successful.
- Customer dashboards, status pages, emails, and reminders use one `Manage booking` experience.
- Active WhatsApp rescheduling, Cal.com behavior, approval-era copy, contradictory policy code, and the unused Resend package are gone.
- Full automated tests, TypeScript, production build, schema probes, staging provider tests, concurrency tests, and mobile/desktop role smoke tests pass before production approval.

## Provider References

- Billplz V5 Payment Order required fields, checksum ordering, statuses, callback verification, and sandbox bank code: `https://support.billplz.com/api`
- Billplz refund behavior and requirement to disburse FPX refunds through Payment Orders: `https://support.billplz.com/guide/issue-a-refund`
- Billplz Payment Order pre-funded limit and operational model: `https://support.billplz.com/guide/payment-order-overview`
- Stripe Refund API and `refund.updated` webhook behavior: use the installed Stripe SDK types and Stripe's official API reference during implementation.
