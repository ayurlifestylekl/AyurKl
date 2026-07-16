# Instant Booking and Dashboard Finish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the approved screenshot-based instant booking flow, remove obsolete approval and Cal.com-era dashboard behavior, and reach a verified no-known-defects release candidate.

**Architecture:** Keep the existing Next.js 14/Supabase booking seams, but centralize pure slot, payment-result, notification-copy, clinical-clearance, and operational-status rules so they are testable without network access. Database RPCs remain the authority for atomic slot claims and payment confirmation; server actions perform role and input validation before calling them. Public/customer, front-desk/admin, and doctor surfaces consume the same domain rules and terminology.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript 5, Supabase/PostgreSQL, Vitest 2, Billplz, Stripe, Resend/SMTP, Telegram.

## Global Constraints

- The customer-provided screenshot and `docs/superpowers/specs/2026-07-16-instant-booking-dashboard-finish-design.md` are the source of truth.
- Customers choose treatment and time only; front desk, admin, or doctor assigns the therapist after payment.
- Online treatments never enter staff approval; free consultations never enter payment.
- Preserve all pre-existing uncommitted work. Never reset, overwrite, or stage unrelated files.
- Use test-driven development: every behavior change starts with a failing regression test that is observed failing for the intended reason.
- Preserve historical appointment readability even when legacy write workflows are removed.
- Keep commerce/partner code but hide it when `NEXT_PUBLIC_COMMERCE_ENABLED` is not `true`.
- Do not deploy, apply production migrations, mutate production data, or use real money without explicit approval.
- Commit only files belonging to the completed task; use one focused commit per task.

---

## File and Responsibility Map

- `src/lib/booking/slots.ts`: canonical generated slot list and submitted-slot validation.
- `src/lib/booking/instant.ts`: online treatment/group/consultation orchestration.
- `src/lib/booking/payment.ts`: provider interaction and mapping of database payment-confirmation results.
- `supabase/migrations/20260717_atomic_payment_confirmation.sql`: idempotent atomic single/group payment confirmation.
- `src/lib/booking/confirmation-copy.ts`: pure treatment/consultation notification wording.
- `src/lib/booking/consultation-rules.ts`: pure clinical-clearance eligibility and linkage rules.
- `src/lib/booking/operations.ts`: pure assignment-required status-transition rule.
- `src/lib/staff/actions.ts`: role-gated assignment, check-in, lifecycle, and clinical actions.
- `src/components/booking/BookingRequestForm.tsx`: one-slot online form and direct-flow CTA.
- `src/app/(public)/book/request/[id]/page.tsx`: direct-flow status timeline and clearance link.
- `src/components/account/AppointmentListCard.tsx`, `src/components/account/NextAppointmentHero.tsx`: customer dashboard without Cal.com actions.
- `src/app/(staff)/console/**`, `src/components/staff/ConsoleShell.tsx`: front-desk confirmed/unassigned workflow.
- `src/app/(staff)/doctor/**`, `src/components/staff/DoctorShell.tsx`: doctor schedule, assignment, notes, and eligible clearance workflow.
- `src/app/admin/(portal)/appointments/**`, `src/app/admin/(portal)/dashboard/page.tsx`: real-data admin operations without approval/mock defaults.
- `src/lib/dashboard/admin-nav.ts`, `src/lib/admin/features.ts`: feature-aware admin navigation.
- `docs/dashboard-cleanup-inventory.md`: final keep/update/hide/remove/historical inventory.

---

### Task 1: Establish the cleanup inventory and baseline

**Files:**
- Create: `docs/dashboard-cleanup-inventory.md`
- Reference: `docs/superpowers/specs/2026-07-16-instant-booking-dashboard-finish-design.md`

**Interfaces:**
- Consumes: the approved design and current route/component tree.
- Produces: a checked inventory used by Tasks 7–9 and the final release gate.

- [ ] **Step 1: Record the untouched baseline**

Run:

```bash
git status --short --branch
npm test
npm exec -- tsc --noEmit
git diff --check
```

Expected: the known user-owned dirty files are listed; 88 existing tests pass before new tests are added; TypeScript and whitespace checks exit 0.

- [ ] **Step 2: Create the dashboard inventory**

Create `docs/dashboard-cleanup-inventory.md` with this table and expand it to every matching route/component discovered with `rg`:

```markdown
# Dashboard Cleanup Inventory

| Surface | Route/component | Disposition | Reason | Verification | Status |
|---|---|---|---|---|---|
| Public booking | `/book/treatment` | Update | Remove alternate/approval flow | Browser: direct checkout | Planned |
| Public consultation | `/book/consultation` | Update | Always free 30 min | Browser: direct confirmation | Planned |
| Customer | `AppointmentListCard` | Update | Remove Cal.com actions | Unit + browser | Planned |
| Front desk | `/console?tab=new` | Remove | Online approval obsolete | Nav/browser | Planned |
| Front desk | `/console?tab=needs-therapist` | Keep | Screenshot-required backstop | Browser | Planned |
| Doctor | `/doctor/requests` | Remove | Doctor no longer approves online bookings | Redirect/nav test | Planned |
| Doctor | `/doctor/consultations` | Update | Eligible attended consultations only | Unit + browser | Planned |
| Admin | `/admin/appointments` | Update | Real confirmed operations, no mocks | Unit + browser | Planned |
| Admin commerce | product/order/agent modules | Hide by feature | Future capability, disabled now | Nav test | Planned |
| Historical Cal.com rows | DB columns | Historical compatibility | Read-only legacy data | Query test | Planned |
```

- [ ] **Step 3: Verify the inventory has no unspecified disposition**

Run:

```bash
rg -n "\| (Keep|Update|Hide by feature|Remove|Historical compatibility) \|" docs/dashboard-cleanup-inventory.md
rg -n "TBD|TODO|unsure|Unknown" docs/dashboard-cleanup-inventory.md
```

Expected: every row has a valid disposition; the second command returns no matches.

- [ ] **Step 4: Commit the inventory**

```bash
git add docs/dashboard-cleanup-inventory.md
git commit -m "docs: inventory booking dashboard cleanup"
```

---

### Task 2: Validate every submitted slot and force 30-minute consultations

**Files:**
- Modify: `src/lib/booking/slots.ts`
- Create: `src/lib/booking/__tests__/slots.test.ts`
- Modify: `src/lib/booking/instant.ts`
- Modify: `src/types/booking.ts`

**Interfaces:**
- Consumes: `slotsForDuration(durationMins)`, `slotIso(dateYMD, time)`, `mytDayKey(iso)`, treatment `booking_lead_time_hours`.
- Produces: `validateSubmittedSlot(input): { ok: true } | { error: string }` and canonical `CONSULTATION_MINS = 30`.

- [ ] **Step 1: Write failing slot-validation tests**

Create `src/lib/booking/__tests__/slots.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { slotIso, validateSubmittedSlot } from '../slots'

const now = new Date('2026-07-16T01:00:00.000Z').getTime() // 09:00 MYT

describe('validateSubmittedSlot', () => {
  it('accepts a generated future treatment slot', () => {
    expect(validateSubmittedSlot({
      iso: slotIso('2026-07-17', '09:30'), durationMins: 60,
      nowMs: now, leadTimeHours: 0, kind: 'treatment',
    })).toEqual({ ok: true })
  })

  it.each([
    ['invalid timestamp', 'not-a-date'],
    ['past slot', '2026-07-15T01:30:00.000Z'],
    ['misaligned slot', '2026-07-17T01:45:00.000Z'],
    ['outside opening hours', '2026-07-17T00:30:00.000Z'],
  ])('rejects %s', (_label, iso) => {
    expect(validateSubmittedSlot({ iso, durationMins: 60, nowMs: now, leadTimeHours: 0, kind: 'treatment' })).toHaveProperty('error')
  })

  it('rejects a slot inside the treatment lead time', () => {
    expect(validateSubmittedSlot({
      iso: '2026-07-16T02:30:00.000Z', durationMins: 60,
      nowMs: now, leadTimeHours: 24, kind: 'treatment',
    })).toHaveProperty('error')
  })

  it('allows only generated 30-minute consultation slots', () => {
    expect(validateSubmittedSlot({
      iso: slotIso('2026-07-17', '10:00'), durationMins: 30,
      nowMs: now, leadTimeHours: 0, kind: 'consultation',
    })).toEqual({ ok: true })
  })
})
```

- [ ] **Step 2: Run the new test and observe RED**

Run: `npm test -- src/lib/booking/__tests__/slots.test.ts`

Expected: FAIL because `validateSubmittedSlot` is not exported.

- [ ] **Step 3: Implement the canonical submitted-slot validator**

Add to `src/lib/booking/slots.ts`:

```ts
import { mytDayKey, mytTimeOfDay } from '@/lib/datetime'

export const CONSULTATION_MINS = 30

export function validateSubmittedSlot(input: {
  iso: string
  durationMins: number
  nowMs: number
  leadTimeHours: number
  kind: 'treatment' | 'consultation'
}): { ok: true } | { error: string } {
  const at = new Date(input.iso).getTime()
  if (!Number.isFinite(at)) return { error: 'Please choose a valid appointment time.' }
  if (at <= input.nowMs + input.leadTimeHours * 3_600_000) return { error: 'That time is too soon or has already passed.' }
  const hhmm = mytTimeOfDay(input.iso)
  const generated = input.kind === 'consultation'
    ? slotsForDuration(CONSULTATION_MINS).filter((t) => Number(t.slice(0, 2)) >= 10)
    : slotsForDuration(input.durationMins)
  if (!generated.includes(hhmm)) return { error: 'That time is outside the available booking schedule.' }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(mytDayKey(input.iso))) return { error: 'Please choose a valid appointment date.' }
  return { ok: true }
}
```

Keep the existing `slotsForDuration` source constants private so generation and validation cannot drift.

- [ ] **Step 4: Make instant actions use the validator**

In `src/lib/booking/instant.ts`:

- select `booking_lead_time_hours` with the treatment;
- call `validateSubmittedSlot` before capacity/block queries for single and each group member;
- use `CONSULTATION_MINS` unconditionally for consultations, even when `treatmentId` is present;
- stop accepting/storing `preferredAtAlt` for instant online actions; and
- retain atomic `claim_instant_slots` as the final race-safe capacity authority.

Use this treatment pattern:

```ts
const slotCheck = validateSubmittedSlot({
  iso: input.preferredAt,
  durationMins,
  nowMs: Date.now(),
  leadTimeHours: Number(t.booking_lead_time_hours ?? 0),
  kind: 'treatment',
})
if ('error' in slotCheck) return slotCheck
```

For consultations use `durationMins: CONSULTATION_MINS`, `leadTimeHours: 0`, `kind: 'consultation'`.

- [ ] **Step 5: Update the request type without breaking historical reads**

In `src/types/booking.ts`, add the signed linkage token and mark alternate time historical-only:

```ts
/** Historical staff-request field; instant online forms do not submit it. */
preferredAtAlt?: string | null
/** Signed access token for a cleared guest consultation. */
parentConsultationToken?: string | null
```

- [ ] **Step 6: Verify GREEN and the complete suite**

Run:

```bash
npm test -- src/lib/booking/__tests__/slots.test.ts
npm test
npm exec -- tsc --noEmit
```

Expected: all slot tests and the full suite pass; TypeScript exits 0.

- [ ] **Step 7: Commit**

```bash
git add src/lib/booking/slots.ts src/lib/booking/__tests__/slots.test.ts src/lib/booking/instant.ts src/types/booking.ts
git commit -m "fix: validate instant booking slots"
```

---

### Task 3: Confirm single and group payments atomically and idempotently

**Files:**
- Create: `supabase/migrations/20260717_atomic_payment_confirmation.sql`
- Create: `src/lib/booking/payment-result.ts`
- Create: `src/lib/booking/__tests__/payment-result.test.ts`
- Modify: `src/lib/booking/payment.ts`
- Modify: `src/app/api/payments/callback/route.ts`

**Interfaces:**
- Consumes: `confirm_appointment_payment(p_bill_id text)` RPC result.
- Produces: `PaymentConfirmationResult`, `parsePaymentConfirmation(data)`, and exactly-once notification input.

- [ ] **Step 1: Write failing payment-result tests**

Create `src/lib/booking/__tests__/payment-result.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { parsePaymentConfirmation } from '../payment-result'

describe('parsePaymentConfirmation', () => {
  it('maps one confirmed booking', () => {
    const r = parsePaymentConfirmation({ state: 'confirmed', lead_id: 'a', group_id: null, rows: [{ id: 'a' }] })
    expect(r).toMatchObject({ state: 'confirmed', leadId: 'a', groupId: null })
    expect(r.rows).toHaveLength(1)
  })

  it('maps every member of a shared-bill group', () => {
    const r = parsePaymentConfirmation({ state: 'confirmed', lead_id: 'a', group_id: 'g', rows: [{ id: 'a' }, { id: 'b' }] })
    expect(r.rows.map((x) => x.id)).toEqual(['a', 'b'])
  })

  it('preserves already-confirmed idempotent results', () => {
    expect(parsePaymentConfirmation({ state: 'already_confirmed', lead_id: 'a', group_id: null, rows: [] }).state).toBe('already_confirmed')
  })
})
```

- [ ] **Step 2: Run the test and observe RED**

Run: `npm test -- src/lib/booking/__tests__/payment-result.test.ts`

Expected: FAIL because `payment-result.ts` does not exist.

- [ ] **Step 3: Implement the pure RPC result parser**

Create `src/lib/booking/payment-result.ts` with explicit runtime validation:

```ts
export interface ConfirmedPaymentRow {
  id: string
  patient_name?: string | null
  guest_age?: number | null
  treatment_name?: string | null
  appointment_date_time?: string | null
  patient_email?: string | null
}

export interface PaymentConfirmationResult {
  state: 'confirmed' | 'already_confirmed' | 'not_payable' | 'not_found'
  leadId: string | null
  groupId: string | null
  rows: ConfirmedPaymentRow[]
}

export function parsePaymentConfirmation(data: unknown): PaymentConfirmationResult {
  const x = (data ?? {}) as Record<string, unknown>
  const state = String(x.state ?? 'not_found') as PaymentConfirmationResult['state']
  if (!['confirmed', 'already_confirmed', 'not_payable', 'not_found'].includes(state)) throw new Error('Invalid payment confirmation result.')
  return {
    state,
    leadId: typeof x.lead_id === 'string' ? x.lead_id : null,
    groupId: typeof x.group_id === 'string' ? x.group_id : null,
    rows: Array.isArray(x.rows) ? x.rows as ConfirmedPaymentRow[] : [],
  }
}
```

- [ ] **Step 4: Add the atomic SQL confirmation RPC**

Create `supabase/migrations/20260717_atomic_payment_confirmation.sql` implementing this transaction:

```sql
CREATE OR REPLACE FUNCTION public.confirm_appointment_payment(p_bill_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead public.appointments%ROWTYPE;
  v_rows jsonb := '[]'::jsonb;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended('appointment-payment|' || p_bill_id, 0));

  SELECT * INTO v_lead
  FROM public.appointments
  WHERE payment_bill_id = p_bill_id
  ORDER BY created_at ASC, id ASC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('state','not_found','lead_id',null,'group_id',null,'rows','[]'::jsonb);
  END IF;

  IF v_lead.status = 'confirmed' THEN
    RETURN jsonb_build_object('state','already_confirmed','lead_id',v_lead.id,'group_id',v_lead.group_id,'rows','[]'::jsonb);
  END IF;

  IF v_lead.status <> 'awaiting_payment' THEN
    RETURN jsonb_build_object('state','not_payable','lead_id',v_lead.id,'group_id',v_lead.group_id,'rows','[]'::jsonb);
  END IF;

  WITH changed AS (
    UPDATE public.appointments
    SET payment_status='paid', paid_at=now(), status='confirmed'
    WHERE (v_lead.group_id IS NOT NULL AND group_id=v_lead.group_id OR v_lead.group_id IS NULL AND id=v_lead.id)
      AND status='awaiting_payment'
    RETURNING id, patient_name, guest_age, treatment_name, appointment_date_time, patient_email
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(changed) ORDER BY id), '[]'::jsonb) INTO v_rows FROM changed;

  RETURN jsonb_build_object('state','confirmed','lead_id',v_lead.id,'group_id',v_lead.group_id,'rows',v_rows);
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_appointment_payment(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_appointment_payment(text) TO service_role;
```

Before finalizing the migration, verify the live schema's actual `created_at` column exists from `20260716b_appointments_created_at.sql`; preserve idempotency with `CREATE OR REPLACE`.

- [ ] **Step 5: Replace multi-row `maybeSingle()` confirmation**

In `markBillPaid` within `src/lib/booking/payment.ts`:

- call `sb.rpc('confirm_appointment_payment', { p_bill_id: billId })`;
- parse with `parsePaymentConfirmation`;
- send customer/staff notifications only for `state === 'confirmed'`;
- derive the lead from `rows.find(r => r.id === leadId) ?? rows[0]`;
- use all rows for group notification lines;
- return success without notification for `already_confirmed`; and
- call `notifyPaymentProblem` for `not_payable`.

Do not query `payment_bill_id` with `.maybeSingle()` after writing the bill ID onto every group member.

- [ ] **Step 6: Verify payment unit tests and callback compilation**

Run:

```bash
npm test -- src/lib/booking/__tests__/payment-result.test.ts
npm test
npm exec -- tsc --noEmit
```

Expected: all tests pass and the callback route compiles against the new return shape.

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations/20260717_atomic_payment_confirmation.sql src/lib/booking/payment-result.ts src/lib/booking/__tests__/payment-result.test.ts src/lib/booking/payment.ts src/app/api/payments/callback/route.ts
git commit -m "fix: confirm booking payments atomically"
```

---

### Task 4: Separate paid-treatment and free-consultation notifications

**Files:**
- Create: `src/lib/booking/confirmation-copy.ts`
- Create: `src/lib/booking/__tests__/confirmation-copy.test.ts`
- Modify: `src/lib/booking/notify.ts`
- Modify: `src/lib/booking/instant.ts`
- Modify: `src/lib/booking/payment.ts`

**Interfaces:**
- Consumes: `bookingKind`, patient/treatment/date, optional group rows.
- Produces: `confirmationCopy(kind, needsAssignment)` with staff subject, Telegram heading, customer heading, and policy lines.

- [ ] **Step 1: Write failing copy tests**

```ts
import { describe, expect, it } from 'vitest'
import { confirmationCopy } from '../confirmation-copy'

describe('confirmationCopy', () => {
  it('uses payment and assignment wording for a treatment', () => {
    const c = confirmationCopy('treatment')
    expect(c.staffHeading).toContain('Payment received')
    expect(c.customerLines.join(' ')).toContain('same-gender therapist')
  })

  it('uses free Vaidya wording with no payment or therapist for a consultation', () => {
    const c = confirmationCopy('consultation')
    const all = JSON.stringify(c)
    expect(all).toContain('Free consultation confirmed')
    expect(all).not.toMatch(/Payment received|same-gender therapist|Assign a therapist/i)
  })
})
```

- [ ] **Step 2: Run and observe RED**

Run: `npm test -- src/lib/booking/__tests__/confirmation-copy.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the pure copy selector**

Create `confirmation-copy.ts`:

```ts
import type { BookingKind } from '@/types/booking'

export function confirmationCopy(kind: BookingKind) {
  if (kind === 'consultation') return {
    staffHeading: 'Free consultation confirmed',
    telegramHeading: '🩺 <b>Free consultation confirmed</b>',
    customerHeading: 'Your free consultation is confirmed',
    customerLines: ['Your appointment is with our Vaidya. Please arrive 10 minutes early.'],
    needsAssignment: false,
  }
  return {
    staffHeading: 'Payment received — booking confirmed',
    telegramHeading: '✅ <b>Payment received — confirmed</b>',
    customerHeading: 'Your appointment is confirmed',
    customerLines: ['A same-gender therapist will be assigned as requested. Please arrive 10 minutes early.'],
    needsAssignment: true,
  }
}
```

- [ ] **Step 4: Make notification callers pass `bookingKind` explicitly**

Update `notifyConfirmed` so `bookingKind` is required, not optional. Use `confirmationCopy()` for staff/customer wording. Pass `bookingKind: 'treatment'` from every payment confirmation call and `bookingKind: 'consultation'` from instant consultation creation.

Keep notification failures non-transactional and preserve the Telegram email-failure alert.

- [ ] **Step 5: Verify GREEN**

Run:

```bash
npm test -- src/lib/booking/__tests__/confirmation-copy.test.ts
npm test
npm exec -- tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/booking/confirmation-copy.ts src/lib/booking/__tests__/confirmation-copy.test.ts src/lib/booking/notify.ts src/lib/booking/instant.ts src/lib/booking/payment.ts
git commit -m "fix: separate consultation confirmation messages"
```

---

### Task 5: Secure consultation clearance and treatment linkage

**Files:**
- Create: `src/lib/booking/consultation-rules.ts`
- Create: `src/lib/booking/__tests__/consultation-rules.test.ts`
- Modify: `src/lib/staff/actions.ts`
- Modify: `src/lib/staff/appointments.ts`
- Modify: `src/components/staff/UnlockTreatment.tsx`
- Modify: `src/app/(public)/book/request/[id]/page.tsx`
- Modify: `src/components/booking/BookingTreatmentOrchestrator.tsx`
- Modify: `src/components/booking/BookingRequestForm.tsx`
- Modify: `src/lib/booking/instant.ts`

**Interfaces:**
- Produces: `canClearConsultation(input): boolean` and signed `parentConsultationToken` propagation.
- Consumes: `canAccessBooking(consultationId, customerId, token)` for customer/guest linkage.

- [ ] **Step 1: Write failing clinical-rule tests**

```ts
import { describe, expect, it } from 'vitest'
import { canClearConsultation } from '../consultation-rules'

const past = '2026-07-15T02:00:00.000Z'
const future = '2026-07-18T02:00:00.000Z'
const nowMs = new Date('2026-07-16T02:00:00.000Z').getTime()

describe('canClearConsultation', () => {
  it.each(['checked_in', 'in_progress', 'completed'] as const)('allows an attended past consultation in %s', (status) => {
    expect(canClearConsultation({ bookingKind: 'consultation', status, appointmentISO: past, nowMs })).toBe(true)
  })
  it('rejects future consultations', () => expect(canClearConsultation({ bookingKind: 'consultation', status: 'confirmed', appointmentISO: future, nowMs })).toBe(false))
  it('rejects treatments', () => expect(canClearConsultation({ bookingKind: 'treatment', status: 'completed', appointmentISO: past, nowMs })).toBe(false))
})
```

- [ ] **Step 2: Run and observe RED**

Run: `npm test -- src/lib/booking/__tests__/consultation-rules.test.ts`

Expected: FAIL because the rule module does not exist.

- [ ] **Step 3: Implement the pure clearance rule**

```ts
import type { BookingKind, BookingStatus } from '@/types/booking'

export function canClearConsultation(input: {
  bookingKind: BookingKind
  status: BookingStatus
  appointmentISO: string | null
  nowMs: number
}): boolean {
  if (input.bookingKind !== 'consultation' || !input.appointmentISO) return false
  if (!['checked_in', 'in_progress', 'completed'].includes(input.status)) return false
  const at = new Date(input.appointmentISO).getTime()
  return Number.isFinite(at) && at <= input.nowMs
}
```

- [ ] **Step 4: Restrict and validate `unlockTreatment`**

Change `unlockTreatment` to `requireStaff(['admin', 'doctor'])`, select `booking_kind,status,appointment_date_time`, reject when `canClearConsultation` is false, require a non-empty outcome, and update only the selected consultation row.

Change `getConsultationsToClear` to return only rows satisfying the same database-level kind/status/time filters, with a final pure-rule filter as defense in depth.

- [ ] **Step 5: Carry a signed consultation token into treatment booking**

On the customer status page, build:

```tsx
href={`/book/treatment?from=${b.id}&ct=${token ?? ''}${b.treatmentId ? `&id=${b.treatmentId}` : ''}`}
```

Read `ct` in `BookingTreatmentOrchestrator`, pass it through `BookingRequestForm` as `parentConsultationToken`, and include it in `BookingRequestInput`.

In `createInstantTreatmentBooking`, select `customer_id,patient_email,booking_kind,treatment_unlocked` from the parent consultation and require:

```ts
await canAccessBooking(consult.id, consult.customer_id, input.parentConsultationToken)
```

Also require the authenticated owner or signed guest link before accepting a consultation-required treatment. Reject a mismatched/uncleared consultation without creating a hold.

- [ ] **Step 6: Hide clearance controls from front desk and ineligible consultations**

Remove `UnlockTreatment` from the front-desk console detail. In the doctor detail, render it only when the consultation is eligible or already unlocked; otherwise show the scheduled state without a clinical action.

- [ ] **Step 7: Verify GREEN**

Run:

```bash
npm test -- src/lib/booking/__tests__/consultation-rules.test.ts
npm test
npm exec -- tsc --noEmit
```

- [ ] **Step 8: Commit**

```bash
git add src/lib/booking/consultation-rules.ts src/lib/booking/__tests__/consultation-rules.test.ts src/lib/staff/actions.ts src/lib/staff/appointments.ts src/components/staff/UnlockTreatment.tsx src/app/'(public)'/book/request/'[id]'/page.tsx src/components/booking/BookingTreatmentOrchestrator.tsx src/components/booking/BookingRequestForm.tsx src/lib/booking/instant.ts
git commit -m "fix: secure consultation treatment clearance"
```

---

### Task 6: Require therapist assignment before treatment check-in or start

**Files:**
- Create: `src/lib/booking/operations.ts`
- Create: `src/lib/booking/__tests__/operations.test.ts`
- Modify: `src/lib/staff/actions.ts`
- Modify: `src/lib/admin/appointments/actions.ts`
- Modify: `src/components/staff/AppointmentActions.tsx`
- Modify: `src/components/staff/CheckInButtons.tsx`

**Interfaces:**
- Produces: `validateOperationalTransition(input): { ok: true } | { error: string }`.
- Consumes: booking kind, assigned therapist code, destination status.

- [ ] **Step 1: Write failing operational tests**

```ts
import { describe, expect, it } from 'vitest'
import { validateOperationalTransition } from '../operations'

describe('validateOperationalTransition', () => {
  it.each(['checked_in', 'in_progress'] as const)('blocks unassigned treatments moving to %s', (to) => {
    expect(validateOperationalTransition({ bookingKind: 'treatment', assignedTherapistCode: null, to })).toHaveProperty('error')
  })
  it('allows an assigned treatment to check in', () => {
    expect(validateOperationalTransition({ bookingKind: 'treatment', assignedTherapistCode: 'NT02', to: 'checked_in' })).toEqual({ ok: true })
  })
  it('allows a consultation to check in without a therapist', () => {
    expect(validateOperationalTransition({ bookingKind: 'consultation', assignedTherapistCode: null, to: 'checked_in' })).toEqual({ ok: true })
  })
})
```

- [ ] **Step 2: Run and observe RED**

Run: `npm test -- src/lib/booking/__tests__/operations.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement and apply the central transition guard**

```ts
import type { BookingKind, BookingStatus } from '@/types/booking'

export function validateOperationalTransition(input: {
  bookingKind: BookingKind
  assignedTherapistCode: string | null
  to: BookingStatus
}): { ok: true } | { error: string } {
  if (input.bookingKind === 'treatment' && ['checked_in', 'in_progress'].includes(input.to) && !input.assignedTherapistCode) {
    return { error: 'Assign a therapist before checking in or starting this treatment.' }
  }
  return { ok: true }
}
```

Select `booking_kind,assigned_therapist_code` in both staff and admin status actions, call the guard before updating, and return its error unchanged.

- [ ] **Step 4: Align the UI with the server rule**

Disable or hide `Check in` and `Start treatment` buttons for an unassigned treatment and display `Assign a therapist first`. Keep consultation check-in available without therapist assignment.

- [ ] **Step 5: Verify GREEN**

Run:

```bash
npm test -- src/lib/booking/__tests__/operations.test.ts
npm test
npm exec -- tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/booking/operations.ts src/lib/booking/__tests__/operations.test.ts src/lib/staff/actions.ts src/lib/admin/appointments/actions.ts src/components/staff/AppointmentActions.tsx src/components/staff/CheckInButtons.tsx
git commit -m "fix: require therapist before treatment check-in"
```

---

### Task 7: Remove online approval and alternate-slot UX

**Files:**
- Create: `src/lib/booking/flow-copy.ts`
- Create: `src/lib/booking/__tests__/flow-copy.test.ts`
- Modify: `src/components/booking/BookingRequestForm.tsx`
- Modify: `src/app/(public)/book/request/[id]/page.tsx`
- Modify: `src/app/(public)/book/request/[id]/checkout/page.tsx`
- Modify: `src/components/account/AppointmentListCard.tsx`
- Modify: `src/components/account/NextAppointmentHero.tsx`
- Modify: `src/types/booking.ts`

**Interfaces:**
- Produces: `flowLabels(kind,status,legacyApprovedAt)` for direct-flow wording while preserving historical display compatibility.

- [ ] **Step 1: Write failing flow-copy tests**

```ts
import { describe, expect, it } from 'vitest'
import { flowLabels } from '../flow-copy'

describe('flowLabels', () => {
  it('describes an instant treatment without approval', () => {
    expect(flowLabels('treatment', 'awaiting_payment', null)).toEqual(['Slot selected', 'Payment', 'Confirmation'])
  })
  it('describes a free consultation without payment', () => {
    expect(flowLabels('consultation', 'confirmed', null)).toEqual(['Slot selected', 'Confirmed'])
  })
  it('keeps legacy approval visible only for historical approved rows', () => {
    expect(flowLabels('treatment', 'confirmed', '2026-01-01T00:00:00Z')).toContain('Clinic approval')
  })
})
```

- [ ] **Step 2: Run and observe RED**

Run: `npm test -- src/lib/booking/__tests__/flow-copy.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the direct-flow labels**

Implement `flowLabels` with the three cases above. It must never return `Request received`, `Preferred`, or `Awaiting approval` for new instant rows.

- [ ] **Step 4: Simplify the online form to one slot**

Remove `preferredAtAlt` state, the alternate `SlotPicker`, alternate payload mapping, and all `request/review/approval` copy from `BookingRequestForm`. Keep:

- treatment CTA: `Continue to payment`;
- consultation CTA: `Confirm free consultation`; and
- treatment success route: checkout; consultation success route: confirmed status page.

Do not remove historical database/type fields needed to render old records.

- [ ] **Step 5: Align status and customer dashboard copy**

Use `flowLabels` on the public status page. Change customer appointment actions from `Track request` to `View booking`; keep `Pay now` only for `awaiting_payment`. For an unassigned confirmed treatment show `Confirmed — the clinic will assign your same-gender therapist.`

Remove Cal.com cancel/reschedule URL imports and actions from `AppointmentListCard` and `NextAppointmentHero`; use the existing in-app cancel/status page and WhatsApp rescheduling policy instead.

- [ ] **Step 6: Verify GREEN and scan for forbidden online copy**

Run:

```bash
npm test -- src/lib/booking/__tests__/flow-copy.test.ts
npm test
npm exec -- tsc --noEmit
rg -n "Alternate date|review your request|Request this appointment|pay only after|Track request" src/components/booking src/app/'(public)'/book src/components/account
```

Expected: tests and types pass; the final `rg` returns no active online copy matches.

- [ ] **Step 7: Commit**

```bash
git add src/lib/booking/flow-copy.ts src/lib/booking/__tests__/flow-copy.test.ts src/components/booking/BookingRequestForm.tsx src/app/'(public)'/book/request/'[id]'/page.tsx src/app/'(public)'/book/request/'[id]'/checkout/page.tsx src/components/account/AppointmentListCard.tsx src/components/account/NextAppointmentHero.tsx src/types/booking.ts
git commit -m "fix: align customer booking with instant flow"
```

---

### Task 8: Clean front-desk and doctor dashboards

**Files:**
- Create: `src/lib/booking/dashboard-nav.ts`
- Create: `src/lib/booking/__tests__/dashboard-nav.test.ts`
- Modify: `src/components/staff/ConsoleShell.tsx`
- Modify: `src/app/(staff)/console/layout.tsx`
- Modify: `src/app/(staff)/console/page.tsx`
- Modify: `src/components/staff/AppointmentActions.tsx`
- Modify: `src/components/staff/GroupApprovalActions.tsx`
- Modify: `src/components/staff/DoctorShell.tsx`
- Modify: `src/app/(staff)/doctor/layout.tsx`
- Modify: `src/app/(staff)/doctor/page.tsx`
- Modify: `src/app/(staff)/doctor/requests/page.tsx`

**Interfaces:**
- Produces: pure `consoleNav` and `doctorNav` arrays with no approval route.
- Consumes: `needs therapist`, confirmed, today, therapist schedule, consultation-clearance counts.

- [ ] **Step 1: Write failing navigation tests**

```ts
import { describe, expect, it } from 'vitest'
import { consoleNav, doctorNav } from '../dashboard-nav'

describe('operational dashboard navigation', () => {
  it('has no online request approval destination', () => {
    expect([...consoleNav, ...doctorNav].some((x) => /request|approval/i.test(`${x.label} ${x.href}`))).toBe(false)
  })
  it('keeps required operational destinations', () => {
    expect(consoleNav.map((x) => x.label)).toEqual(expect.arrayContaining(['Needs therapist', 'Today', 'Confirmed', 'Schedule']))
    expect(doctorNav.map((x) => x.label)).toEqual(expect.arrayContaining(['Overview', 'Schedule', 'Calendar', 'Patients', 'Consultations']))
  })
})
```

- [ ] **Step 2: Run and observe RED**

Run: `npm test -- src/lib/booking/__tests__/dashboard-nav.test.ts`

Expected: FAIL because the shared navigation module does not exist.

- [ ] **Step 3: Implement role navigation and remove approval counters**

Create plain-data navigation arrays in `dashboard-nav.ts`. Make `ConsoleShell` and `DoctorShell` attach their Lucide icon components locally by href/label so the pure arrays remain testable in Node.

Remove pending-request queries and props from both layouts. Remove `New requests` from console tabs and `Requests` from doctor navigation/overview.

Change `/doctor/requests` to `redirect('/doctor')` for bookmarked URLs instead of deleting the route abruptly.

- [ ] **Step 4: Make confirmed/unassigned the front-desk primary workflow**

Order console overview cards and attention rows as:

1. Needs therapist;
2. Today;
3. Confirmed;
4. Awaiting payment holds;
5. Therapist availability.

Retain `Awaiting payment` as a read-only operational view of customers mid-checkout. Do not expose approve/reject actions for instant rows. Historical `pending` rows remain discoverable through `All` and can be cancelled/migrated, but are not a primary workflow.

Rename group post-payment UI from approval language to `Assign therapists`; keep assignment one guest at a time without status changes.

- [ ] **Step 5: Make doctor clearance and assignment the only booking actions**

Doctor overview cards become `Today's patients`, `Needs therapist`, `To clear`, and `Total patients`. Remove `New requests` and approval messaging. Continue redacting contact fields for doctor-only roles.

- [ ] **Step 6: Verify GREEN and scan active dashboards**

Run:

```bash
npm test -- src/lib/booking/__tests__/dashboard-nav.test.ts
npm test
npm exec -- tsc --noEmit
rg -n "Awaiting approval|Approve &|Reject request|New requests|Contacted via WhatsApp" src/app/'(staff)' src/components/staff
```

Expected: tests/types pass; remaining matches are historical compatibility code only and each is recorded as such in `docs/dashboard-cleanup-inventory.md`.

- [ ] **Step 7: Commit**

```bash
git add src/lib/booking/dashboard-nav.ts src/lib/booking/__tests__/dashboard-nav.test.ts src/components/staff/ConsoleShell.tsx src/app/'(staff)'/console/layout.tsx src/app/'(staff)'/console/page.tsx src/components/staff/AppointmentActions.tsx src/components/staff/GroupApprovalActions.tsx src/components/staff/DoctorShell.tsx src/app/'(staff)'/doctor/layout.tsx src/app/'(staff)'/doctor/page.tsx src/app/'(staff)'/doctor/requests/page.tsx docs/dashboard-cleanup-inventory.md
git commit -m "fix: focus staff dashboards on confirmed bookings"
```

---

### Task 9: Clean admin appointments, feature visibility, mocks, and Cal.com remnants

**Files:**
- Create: `src/lib/admin/__tests__/features.test.ts`
- Modify: `src/lib/admin/features.ts`
- Modify: `src/lib/dashboard/admin-nav.ts`
- Modify: `src/app/admin/(portal)/dashboard/page.tsx`
- Modify: `src/app/admin/(portal)/appointments/page.tsx`
- Modify: `src/app/admin/(portal)/appointments/AppointmentsFilters.tsx`
- Modify: `src/app/admin/(portal)/appointments/[id]/page.tsx`
- Modify: `src/app/admin/(portal)/appointments/[id]/StatusDialog.tsx`
- Modify: `src/lib/admin/appointments/queries.ts`
- Modify: `src/lib/admin/activity.ts`
- Delete: `src/app/api/webhooks/calcom/route.ts`
- Delete: `src/lib/calcom/webhook.ts`
- Delete: `src/lib/calcom/links.ts`
- Delete: `src/lib/cal.ts`
- Delete: `src/lib/calcom/__tests__/webhook.test.ts`
- Modify: `src/components/contact/Directory.tsx`
- Modify: `package.json`
- Modify mechanically: `package-lock.json`
- Modify: `docs/dashboard-cleanup-inventory.md`

**Interfaces:**
- Produces: `getAdminNav(commerceEnabled: boolean): NavItem[]` and real-data admin appointment segments.
- Preserves: legacy `calcom_booking_uid` database column as historical read compatibility only.

- [ ] **Step 1: Write failing feature-navigation tests**

Create `src/lib/admin/__tests__/features.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { getAdminNav } from '@/lib/dashboard/admin-nav'

describe('getAdminNav', () => {
  it('hides commerce and partner modules when commerce is disabled', () => {
    const labels = getAdminNav(false).map((x) => x.label)
    expect(labels).not.toEqual(expect.arrayContaining(['Products', 'Inventory', 'Orders', 'Marketplace', 'Wholesale Orders', 'Finance']))
  })
  it('keeps clinic modules', () => {
    expect(getAdminNav(false).map((x) => x.label)).toEqual(expect.arrayContaining(['Overview', 'Appointments', 'Customers', 'Settings']))
  })
})
```

- [ ] **Step 2: Run and observe RED**

Run: `npm test -- src/lib/admin/__tests__/features.test.ts`

Expected: FAIL because `getAdminNav` does not exist and the current label is `Consultations`.

- [ ] **Step 3: Implement feature-aware admin navigation**

Export `clinicAdminNav`, `commerceAdminNav`, and:

```ts
export function getAdminNav(commerceEnabled: boolean): NavItem[] {
  return commerceEnabled ? [...clinicAdminNav, ...commerceAdminNav] : clinicAdminNav
}
export const adminNav = getAdminNav(COMMERCE_ENABLED)
```

Rename the active appointment destination `Appointments`. Keep commerce routes implemented but hidden when disabled.

- [ ] **Step 4: Remove admin mock fallbacks and approval defaults**

In admin appointments:

- remove `DEMO_ADMIN_EMAIL`, `MOCK_APPOINTMENTS`, and `filterMocks` usage;
- default to `today` instead of `requests`;
- replace the `Requests` segment with `Needs therapist` using `confirmed/checked_in/in_progress` plus `assigned_therapist_code IS NULL`;
- keep `Awaiting payment` as an explicit hold segment;
- display only real query results and truthful empty states; and
- link assignment-heavy operations to the shared booking console/detail rather than duplicating incompatible admin approval logic.

Add the assignment columns to the admin query result instead of inferring them from Cal.com fields.

- [ ] **Step 5: Remove active Cal.com behavior while preserving historical data**

Remove:

- the webhook route and webhook tests;
- Cal.com link/config modules;
- account Cal.com reschedule/cancel buttons already replaced in Task 7;
- admin detail `Cal.com sync` controls and manual-update warnings;
- contact copy stating `Cal.com booking`; and
- `@calcom/embed-react` from dependencies using `npm uninstall @calcom/embed-react`.

Keep `calcom_booking_uid` in existing schema/types and historical reads until a separately approved data migration retires it. Change activity copy to neutral `Appointment booked` regardless of the historical UID.

- [ ] **Step 6: Focus the admin overview on booking operations**

When commerce is disabled, the overview must show real counts for today's confirmed appointments, paid unassigned treatments, consultations to clear, unread messages, and customers. Remove unused commerce queries from the disabled branch rather than fetching them and hiding only the rendered cards.

- [ ] **Step 7: Verify GREEN and dependency cleanup**

Run:

```bash
npm test -- src/lib/admin/__tests__/features.test.ts
npm test
npm exec -- tsc --noEmit
rg -n "@calcom|Cal\.com|cal\.com|api/webhooks/calcom" src package.json
npm run build
```

Expected: tests/types/build pass; the Cal.com scan has no active source or dependency matches except explicitly documented historical DB-field comments if retained.

- [ ] **Step 8: Commit**

```bash
git add src/lib/admin/features.ts src/lib/dashboard/admin-nav.ts src/lib/admin/__tests__/features.test.ts src/app/admin/'(portal)'/dashboard/page.tsx src/app/admin/'(portal)'/appointments src/lib/admin/appointments/queries.ts src/lib/admin/activity.ts src/components/contact/Directory.tsx package.json package-lock.json docs/dashboard-cleanup-inventory.md
git add -u src/app/api/webhooks/calcom src/lib/calcom src/lib/cal.ts
git commit -m "fix: clean admin booking dashboard"
```

---

### Task 10: Verify migrations, payments, concurrency, dashboards, and release readiness

**Files:**
- Create: `scripts/verify-booking-schema.mjs`
- Create: `docs/booking-release-verification.md`
- Modify: `docs/dashboard-cleanup-inventory.md`

**Interfaces:**
- Consumes: staging/test Supabase credentials, Billplz sandbox, Stripe test mode, role accounts.
- Produces: machine-readable schema probe exit status and a completed release evidence document.

- [ ] **Step 1: Create a read-only schema verifier**

Create `scripts/verify-booking-schema.mjs` that loads `.env.local`, creates a service-role Supabase client, and verifies without inserting customer data:

```js
const checks = [
  ['instant claim RPC', () => sb.rpc('claim_instant_slots', { p_claims: [] })],
  ['payment confirm RPC', () => sb.rpc('confirm_appointment_payment', { p_bill_id: '__schema_probe__' })],
  ['appointment columns', () => sb.from('appointments').select('id,created_at,payment_expires_at,group_id,assigned_therapist_code,treatment_unlocked').limit(1)],
  ['schedule blocks', () => sb.from('schedule_blocks').select('id').limit(1)],
]
```

Treat the expected `claim_instant_slots requires a non-empty JSON array` response as proof that the RPC exists; treat missing function/table/column errors as failure. Print only check names and pass/fail—never URLs or keys.

- [ ] **Step 2: Run the complete local verification gate**

Run:

```bash
npm test
npm exec -- tsc --noEmit
git diff --check
npm run build
node --env-file=.env.local scripts/verify-booking-schema.mjs
```

Expected: all tests pass with the new total, TypeScript/whitespace/build exit 0, and every schema probe prints PASS.

- [ ] **Step 3: Apply migrations in staging/test only with approval**

Apply in order:

```text
20260701_therapist_no_double_booking.sql
20260716_instant_booking_claim.sql
20260716b_appointments_created_at.sql
20260717_atomic_payment_confirmation.sql
```

Re-run the schema verifier. Do not apply production migrations in this task without explicit approval.

- [ ] **Step 4: Execute payment and concurrency scenarios**

Record evidence in `docs/booking-release-verification.md` for:

1. single FPX sandbox payment confirms exactly once;
2. single Stripe test-card payment confirms exactly once;
3. group payment confirms every guest and sends one group notification;
4. return-page reconciliation confirms a paid bill with webhook delivery disabled;
5. unpaid hold expires after 20 minutes and the slot reappears;
6. late payment against cancelled/expired booking produces staff alert, not false customer confirmation; and
7. two concurrent last-slot claims produce one success and one `SLOT_FULL` error.

Use only dedicated test bookings and delete/label them according to the existing cleanup script after evidence is captured.

- [ ] **Step 5: Execute role-based browser smoke tests**

At 390px mobile and 1440px desktop widths, verify and record:

- public treatment: one slot -> checkout -> confirmation;
- public consultation: 30-minute slot -> immediate confirmation, no payment wording;
- customer account: correct direct-flow status and no Cal.com/customer therapist selection;
- front desk: red unassigned queue -> assign -> therapist calendar -> check in;
- admin: real data, no mocks/approval default, feature-disabled navigation hidden;
- doctor: no Requests nav, contact redaction, assignment, notes, eligible clearance; and
- cleared guest consultation: signed link -> treatment checkout.

Capture screenshots for each surface and link their paths in `docs/booking-release-verification.md`.

- [ ] **Step 6: Close the inventory and run final verification**

Update the verification cell of every row in `docs/dashboard-cleanup-inventory.md` with its commit and evidence, and change its status to `Verified`. Run:

```bash
rg -n "\| (Planned|Pending|Blocked) \|" docs/dashboard-cleanup-inventory.md
npm test
npm exec -- tsc --noEmit
git diff --check
npm run build
git status --short --branch
```

Expected: the inventory command returns no matches; all automated checks exit 0; status lists only known user-owned unrelated changes.

- [ ] **Step 7: Commit verification artifacts**

```bash
git add scripts/verify-booking-schema.mjs docs/booking-release-verification.md docs/dashboard-cleanup-inventory.md
git commit -m "test: document booking release verification"
```

---

## Completion Criteria

- Every task's RED test was observed failing for the intended missing behavior before production code changed.
- The complete Vitest suite, TypeScript validation, `git diff --check`, and network-enabled production build pass.
- Required database functions, columns, constraints, and policies are present in the target staging environment.
- Single FPX, single card, group payment, expiry, late payment, and last-slot concurrency scenarios pass.
- Public/customer, front-desk, admin, and doctor browser smoke tests pass at mobile and desktop sizes.
- No online approval/alternate-slot flow, customer therapist picker, doctor request-approval screen, mock admin appointment data, or active Cal.com behavior remains.
- The red unassigned backstop, post-payment internal therapist assignment, assignment-aware check-in, and doctor-only clinical clearance work exactly as shown in the approved screenshot.
- No production deployment or data mutation occurs without a separate explicit approval.
