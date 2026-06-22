# Booking & Consultation System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let customers (guest or signed-in) request a treatment or consultation on our own site; staff (doctor / admin / front desk) approve & assign a therapist; the customer then pays the full price (Billplz, stubbed day 1) and the appointment is confirmed — replacing Cal.com entirely.

**Architecture:** Everything lives in the existing Supabase `appointments` table (extended), driven by an approval-gated status machine. Customer-facing writes go through server actions; guest bookings and all staff reads/writes use the **service-role client** (which bypasses RLS) behind a server-side role guard — matching the existing admin pattern. Scheduling is **request-and-confirm** (customer proposes a time, staff confirm the real slot), so no availability engine is needed. Payment is isolated behind a single `PaymentProvider` seam so the real Billplz wiring drops in on day 2 without touching the flow.

**Tech Stack:** Next.js 14 (App Router, server components + server actions), Supabase (Postgres + RLS), TypeScript, Tailwind, Resend (email), Vitest (unit tests for pure logic). Billplz/FPX for payment (day 2).

## Global Constraints

- Currency is **Malaysian Ringgit (RM)**; money columns are `DECIMAL(10,2)`.
- `users.role` is a **TEXT CHECK constraint** (`'admin','customer','sales_agent'`) — extend by dropping & recreating the constraint.
- `appointments.status` is a **Postgres enum** `public.appointment_status_enum` — extend with `ALTER TYPE ... ADD VALUE IF NOT EXISTS`.
- Staff data access uses `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS) **only after** a server-side role check; never expose the service key to the client.
- Same-gender therapist policy is **mandatory**: a male patient is only ever assigned a male therapist, female↔female. Surface as a disclaimer AND enforce at assignment.
- Cancellation cutoff: **12 hours** before `appointment_date_time`; later cancellations are non-refundable.
- Rescheduling is **not self-serve** — route to WhatsApp (`601165043436`) with a 12–24h notice message.
- Migrations must be **idempotent** (safe to re-run) and applied via the Supabase SQL Editor, matching existing migration style.
- Follow existing code patterns: server Supabase client `@/lib/supabase/server`, storefront reads in `src/lib/storefront/*`, admin queries in `src/lib/admin/*`, role gating in `src/middleware.ts`.

---

## File Structure

**Database**
- `supabase/migrations/20260623_booking_system.sql` — roles, status values, appointment columns, helper fns, RLS, indexes (Task 1).

**Domain types & pure logic**
- `src/types/booking.ts` — `BookingStatus`, `BookingKind`, `Gender`, `AppointmentRow`, `BookingRequestInput`, `StaffAppointment`, `DoctorPatientView` (Task 2).
- `src/lib/booking/status.ts` — status machine: allowed transitions, label/colour helpers (Task 4).
- `src/lib/booking/policy.ts` — `canCancel`, `cancellationDeadline`, `payableAmount`, `requiredTherapistGender`, WhatsApp reschedule link (Task 4).
- `src/lib/booking/__tests__/status.test.ts`, `src/lib/booking/__tests__/policy.test.ts` (Task 4).

**Payment seam**
- `src/lib/payments/provider.ts` — `PaymentProvider` interface + `createBill`/`verifyCallback` types (Task 13).
- `src/lib/payments/stub.ts` — stub provider used day 1 (Task 13).
- `src/lib/payments/billplz.ts` — real provider, day 2 (interface-only stub created day 1).
- `src/lib/payments/index.ts` — selects provider from env (Task 13).

**Customer flow**
- `src/lib/booking/actions.ts` — server actions: `createBookingRequest`, `cancelBooking`, `startPayment` (Tasks 5, 13, 15).
- `src/lib/storefront/booking.ts` — customer read: `getMyBookings`, `getBookingForPayment` (Tasks 5, 7).
- `src/components/booking/BookingRequestForm.tsx` — the native request form (Task 6).
- `src/components/booking/PolicyDisclaimers.tsx` — gender / cancellation / reschedule notices (Task 6).
- `src/components/booking/HealthIntakeFields.tsx` — health questions for guests/first-timers (Task 6).
- `src/app/(public)/book/treatment/page.tsx` — replace Cal.com orchestrator with the form (Task 6).
- `src/app/(public)/book/consultation/page.tsx` — replace Cal.com with the form in consultation mode (Task 6).
- `src/app/(public)/book/request/[id]/page.tsx` — request status + pay button (Task 7).
- `src/app/(public)/book/request/[id]/pay/route.ts` — kicks off payment, redirects to provider (Task 14).
- `src/app/api/payments/callback/route.ts` — provider webhook/return handler (Task 14).

**Staff (shared console + doctor)**
- `src/lib/staff/guard.ts` — `requireStaff(role?)` server guard returning a service-role client + session user (Task 8).
- `src/lib/staff/appointments.ts` — `listAppointments(filters)`, `getAppointment(id)`, `getDoctorPatients()`, `getDoctorPatient(id)` (Tasks 8, 11).
- `src/lib/staff/actions.ts` — `approveAndAssign`, `setStatus`, `unlockTreatment`, `saveClinicalNotes` (Tasks 10, 11, 16).
- `src/app/(staff)/layout.tsx` — staff shell + nav (Task 9).
- `src/app/(staff)/console/page.tsx` — shared bookings queue (admin + front_desk) (Task 9).
- `src/app/(staff)/console/[id]/page.tsx` — appointment detail + approve/assign (Tasks 9, 10).
- `src/app/(staff)/doctor/page.tsx` — doctor dashboard (booked patients only) (Task 11).
- `src/app/(staff)/doctor/[id]/page.tsx` — patient/appointment clinical view (Task 11).
- `src/components/staff/BookingQueue.tsx`, `AssignDrawer.tsx`, `StatusBadge.tsx`, `AutoRefresh.tsx` (Tasks 9, 10, 12).

**Auth / routing**
- `src/middleware.ts` — gate `/doctor`, `/console`; extend `homeForRole` (Task 3).
- `src/app/doctor/login`, `src/app/staff/login` — reuse existing login component (Task 3).

**Notifications (fast-follow)**
- `src/lib/booking/notify.ts` — Resend emails on key transitions (Task 17).

---

## PHASE 0 — Foundation

### Task 1: Database migration (roles, statuses, appointment fields, RLS)

**Files:**
- Create: `supabase/migrations/20260623_booking_system.sql`

**Interfaces:**
- Produces (DB): `users.role` accepts `'doctor'`,`'front_desk'`; `appointment_status_enum` gains `'awaiting_payment'`; `appointments` gains the columns listed below; SQL fns `public.is_doctor()`, `public.is_front_desk()`, `public.is_staff()`.

- [ ] **Step 1: Write the migration SQL**

```sql
-- ============================================================================
-- Booking & Consultation System — DB delta (2026-06-23). Idempotent.
-- Apply via Supabase SQL Editor.
-- ============================================================================

-- 1. Extend user roles -------------------------------------------------------
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin','customer','sales_agent','doctor','front_desk'));

-- 2. Extend appointment status enum -----------------------------------------
ALTER TYPE public.appointment_status_enum ADD VALUE IF NOT EXISTS 'awaiting_payment';

-- 3. New appointment columns -------------------------------------------------
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS treatment_id          UUID REFERENCES public.treatments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS treatment_category_id TEXT REFERENCES public.treatment_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS booking_kind          TEXT NOT NULL DEFAULT 'treatment'
                              CHECK (booking_kind IN ('treatment','consultation')),
  ADD COLUMN IF NOT EXISTS requested_datetime    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS requested_datetime_alt TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_guest              BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS patient_name          TEXT,
  ADD COLUMN IF NOT EXISTS patient_phone         TEXT,
  ADD COLUMN IF NOT EXISTS patient_email         TEXT,
  ADD COLUMN IF NOT EXISTS patient_gender        TEXT CHECK (patient_gender IN ('male','female')),
  ADD COLUMN IF NOT EXISTS assigned_therapist_name   TEXT,
  ADD COLUMN IF NOT EXISTS assigned_therapist_gender TEXT CHECK (assigned_therapist_gender IN ('male','female')),
  ADD COLUMN IF NOT EXISTS parent_consultation_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS treatment_unlocked    BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS consultation_outcome  TEXT,
  ADD COLUMN IF NOT EXISTS payable_amount_rm     DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS payment_status        TEXT NOT NULL DEFAULT 'unpaid'
                              CHECK (payment_status IN ('unpaid','pending','paid','failed','refunded')),
  ADD COLUMN IF NOT EXISTS payment_provider      TEXT,
  ADD COLUMN IF NOT EXISTS payment_bill_id       TEXT,
  ADD COLUMN IF NOT EXISTS payment_url           TEXT,
  ADD COLUMN IF NOT EXISTS paid_at               TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_by           UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at           TIMESTAMPTZ;
-- NOTE: health intake reuses the existing `pre_visit_form JSONB` column.
-- gender_requirement (existing) = required therapist gender = patient_gender by policy.

CREATE INDEX IF NOT EXISTS appointments_payment_status_idx ON public.appointments(payment_status);
CREATE INDEX IF NOT EXISTS appointments_kind_idx ON public.appointments(booking_kind);
CREATE INDEX IF NOT EXISTS appointments_treatment_idx ON public.appointments(treatment_id);

-- 4. Role helper functions ---------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_doctor() RETURNS BOOLEAN
  LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN RETURN EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'doctor'); END; $$;

CREATE OR REPLACE FUNCTION public.is_front_desk() RETURNS BOOLEAN
  LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN RETURN EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'front_desk'); END; $$;

CREATE OR REPLACE FUNCTION public.is_staff() RETURNS BOOLEAN
  LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN RETURN EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()
                     AND role IN ('admin','doctor','front_desk')); END; $$;

-- 5. RLS — staff may read appointments (writes go via service role) ----------
DROP POLICY IF EXISTS "appointments: staff read" ON public.appointments;
CREATE POLICY "appointments: staff read"
  ON public.appointments FOR SELECT
  USING (public.is_staff());
-- existing customer + admin policies remain.
```

- [ ] **Step 2: Apply it**

Apply the file in the Supabase SQL Editor (run with sandbox disabled if using CLI). Expected: "Success. No rows returned."

- [ ] **Step 3: Verify**

Run in SQL Editor:
```sql
select unnest(enum_range(NULL::public.appointment_status_enum));            -- includes awaiting_payment
select conname from pg_constraint where conname = 'users_role_check';        -- exists
select column_name from information_schema.columns
  where table_name='appointments' and column_name in ('booking_kind','payment_status','treatment_id'); -- 3 rows
```

- [ ] **Step 4: Commit**

```bash
git add "supabase/migrations/20260623_booking_system.sql"
git commit -m "feat(db): booking system — roles, statuses, appointment fields, RLS"
```

---

### Task 2: Domain types

**Files:**
- Create: `src/types/booking.ts`

**Interfaces:**
- Produces: `BookingStatus`, `BookingKind`, `Gender`, `PaymentStatus`, `BookingRequestInput`, `StaffAppointment`, `DoctorPatientView`.

- [ ] **Step 1: Write the types**

```ts
export type Gender = 'male' | 'female'
export type BookingKind = 'treatment' | 'consultation'
export type BookingStatus =
  | 'pending' | 'scheduled' | 'awaiting_payment' | 'confirmed'
  | 'checked_in' | 'in_progress' | 'completed'
  | 'cancelled' | 'no_show' | 'rescheduled'
export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded'

export interface BookingRequestInput {
  treatmentId: string
  bookingKind: BookingKind
  preferredAt: string          // ISO datetime
  preferredAtAlt?: string | null
  patientName: string
  patientPhone: string
  patientEmail: string
  patientGender: Gender
  isGuest: boolean
  healthIntake: {
    conditions?: string
    allergies?: string
    medications?: string
    pregnant?: boolean
    notes?: string
  }
  acceptedPolicies: boolean    // gender + cancellation + reschedule acknowledged
  parentConsultationId?: string | null
}

export interface StaffAppointment {
  id: string
  bookingKind: BookingKind
  status: BookingStatus
  paymentStatus: PaymentStatus
  treatmentName: string | null
  treatmentId: string | null
  patientName: string | null
  patientPhone: string | null
  patientGender: Gender | null
  requestedDatetime: string | null
  appointmentDatetime: string | null
  assignedTherapistName: string | null
  assignedTherapistGender: Gender | null
  payableAmountRm: number | null
  room: string | null
  isGuest: boolean
  createdAt: string | null
}

export interface DoctorPatientView extends StaffAppointment {
  patientEmail: string | null
  healthIntake: Record<string, unknown> | null   // from pre_visit_form
  accountHealth: {                                // from users table (signed-in only)
    allergies: string | null
    medications: string | null
    conditions: string | null
    heightCm: number | null
    weightKg: number | null
  } | null
  clinicalNotes: string | null
}
```

- [ ] **Step 2: Typecheck & commit**

```bash
npx tsc --noEmit
git add src/types/booking.ts && git commit -m "feat(types): booking domain types"
```

---

### Task 3: Role gating & staff/doctor login

**Files:**
- Modify: `src/middleware.ts` (read first; add `/console` and `/doctor` protection + extend `homeForRole`)
- Create: `src/app/doctor/login/page.tsx`, `src/app/staff/login/page.tsx` (reuse existing admin login component/pattern — read `src/app/admin/login/page.tsx` and copy its structure, changing the post-login redirect target)

**Interfaces:**
- Consumes: existing `homeForRole(role)` and the auth-check helper in `middleware.ts`.
- Produces: authenticated `doctor` → `/doctor`; `front_desk`/`admin` → `/console`.

- [ ] **Step 1: Read `src/middleware.ts`** to learn the existing gate + `homeForRole` shape.

- [ ] **Step 2: Extend `homeForRole`** so `doctor → '/doctor'`, `front_desk → '/console'`, `admin → '/console'` (admin keeps `/admin` access too). Add `/console` and `/doctor` to the protected-prefix logic, redirecting unauthenticated users to `/staff/login` (or `/doctor/login` for `/doctor`).

- [ ] **Step 3: Create the two login pages** mirroring `src/app/admin/login/page.tsx` exactly, only changing copy and the success redirect.

- [ ] **Step 4: Manually verify** by setting a test user's role: in SQL Editor `update public.users set role='doctor' where email='...';` then logging in → lands on `/doctor`.

- [ ] **Step 5: Commit**

```bash
git add src/middleware.ts src/app/doctor src/app/staff
git commit -m "feat(auth): doctor + front_desk roles and login routing"
```

---

## PHASE 1 — Customer booking & consultation flow

### Task 4: Booking pure logic (status machine + policy) — TDD

**Files:**
- Create: `src/lib/booking/status.ts`, `src/lib/booking/policy.ts`
- Test: `src/lib/booking/__tests__/status.test.ts`, `src/lib/booking/__tests__/policy.test.ts`

**Interfaces:**
- Produces:
  - `canTransition(from: BookingStatus, to: BookingStatus): boolean`
  - `STATUS_LABEL: Record<BookingStatus,string>`
  - `requiredTherapistGender(patientGender: Gender): Gender` (identity — same-gender policy)
  - `payableAmount(priceRm: number | null): number` (full price; 0/throw if null)
  - `cancellationDeadline(apptISO: string): Date` (apptTime − 12h)
  - `canCancel(apptISO: string, now: Date): boolean`
  - `whatsappRescheduleLink(name: string, apptISO: string): string`

- [ ] **Step 1: Write failing tests** (`policy.test.ts`)

```ts
import { describe, it, expect } from 'vitest'
import { canCancel, cancellationDeadline, requiredTherapistGender, payableAmount, whatsappRescheduleLink } from '../policy'

describe('policy', () => {
  const appt = '2026-06-25T10:00:00+08:00'
  it('same-gender therapist policy', () => {
    expect(requiredTherapistGender('male')).toBe('male')
    expect(requiredTherapistGender('female')).toBe('female')
  })
  it('cancellation deadline is 12h before', () => {
    expect(cancellationDeadline(appt).toISOString()).toBe(new Date('2026-06-24T22:00:00+08:00').toISOString())
  })
  it('canCancel true >12h before, false within 12h', () => {
    expect(canCancel(appt, new Date('2026-06-24T21:00:00+08:00'))).toBe(true)
    expect(canCancel(appt, new Date('2026-06-24T23:00:00+08:00'))).toBe(false)
  })
  it('payable is full price', () => {
    expect(payableAmount(155)).toBe(155)
  })
  it('whatsapp link includes number + name', () => {
    expect(whatsappRescheduleLink('Asha', appt)).toContain('601165043436')
    expect(decodeURIComponent(whatsappRescheduleLink('Asha', appt))).toContain('Asha')
  })
})
```

- [ ] **Step 2: Run — expect FAIL** `npx vitest run src/lib/booking/__tests__/policy.test.ts`

- [ ] **Step 3: Implement `policy.ts`**

```ts
import type { BookingStatus, Gender } from '@/types/booking'

const CANCEL_WINDOW_MS = 12 * 60 * 60 * 1000
const WHATSAPP = '601165043436'

export function requiredTherapistGender(patientGender: Gender): Gender {
  return patientGender // same-gender policy
}
export function payableAmount(priceRm: number | null): number {
  if (priceRm == null) throw new Error('No fixed price; not directly payable')
  return priceRm
}
export function cancellationDeadline(apptISO: string): Date {
  return new Date(new Date(apptISO).getTime() - CANCEL_WINDOW_MS)
}
export function canCancel(apptISO: string, now: Date): boolean {
  return now.getTime() <= cancellationDeadline(apptISO).getTime()
}
export function whatsappRescheduleLink(name: string, apptISO: string): string {
  const msg = `Hi, this is ${name}. I'd like to reschedule my appointment on ${new Date(apptISO).toLocaleString('en-MY')}. (At least 12–24h notice.)`
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`
}
```

- [ ] **Step 4: Write failing tests** (`status.test.ts`)

```ts
import { describe, it, expect } from 'vitest'
import { canTransition } from '../status'
describe('status machine', () => {
  it('approve → awaiting_payment', () => { expect(canTransition('pending','awaiting_payment')).toBe(true) })
  it('pay → confirmed', () => { expect(canTransition('awaiting_payment','confirmed')).toBe(true) })
  it('consultation pending → confirmed (no payment)', () => { expect(canTransition('pending','confirmed')).toBe(true) })
  it('cannot jump pending → completed', () => { expect(canTransition('pending','completed')).toBe(false) })
  it('confirmed → cancelled allowed', () => { expect(canTransition('confirmed','cancelled')).toBe(true) })
})
```

- [ ] **Step 5: Implement `status.ts`**

```ts
import type { BookingStatus } from '@/types/booking'

const ALLOWED: Record<BookingStatus, BookingStatus[]> = {
  pending: ['awaiting_payment','confirmed','scheduled','cancelled'], // confirmed = consultation path (no pay)
  scheduled: ['awaiting_payment','confirmed','cancelled'],
  awaiting_payment: ['confirmed','cancelled'],
  confirmed: ['checked_in','cancelled','no_show','rescheduled'],
  checked_in: ['in_progress','no_show','cancelled'],
  in_progress: ['completed'],
  completed: [],
  cancelled: [],
  no_show: [],
  rescheduled: ['pending','confirmed'],
}
export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return ALLOWED[from]?.includes(to) ?? false
}
export const STATUS_LABEL: Record<BookingStatus,string> = {
  pending: 'Awaiting approval', scheduled: 'Scheduled', awaiting_payment: 'Awaiting payment',
  confirmed: 'Confirmed', checked_in: 'Checked in', in_progress: 'In progress',
  completed: 'Completed', cancelled: 'Cancelled', no_show: 'No-show', rescheduled: 'Rescheduled',
}
```

- [ ] **Step 6: Run both test files — expect PASS** `npx vitest run src/lib/booking`

- [ ] **Step 7: Commit**

```bash
git add src/lib/booking
git commit -m "feat(booking): status machine + policy logic with tests"
```

---

### Task 5: `createBookingRequest` server action + customer reads

**Files:**
- Create: `src/lib/booking/actions.ts` (this task adds `createBookingRequest`)
- Create: `src/lib/storefront/booking.ts`

**Interfaces:**
- Consumes: `BookingRequestInput` (Task 2); `requiredTherapistGender`, `payableAmount` (Task 4); service-role client.
- Produces:
  - `createBookingRequest(input: BookingRequestInput): Promise<{ id: string } | { error: string }>`
  - `getBookingForPayment(id: string): Promise<StaffAppointment | null>` (in `storefront/booking.ts`)
  - `getMyBookings(supabase, userId): Promise<StaffAppointment[]>`

- [ ] **Step 1: Implement `createBookingRequest`** in `src/lib/booking/actions.ts`

```ts
'use server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createSb } from '@supabase/supabase-js'
import type { BookingRequestInput } from '@/types/booking'
import { requiredTherapistGender } from './policy'

function admin() {
  return createSb(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  })
}

export async function createBookingRequest(input: BookingRequestInput) {
  if (!input.acceptedPolicies) return { error: 'Please accept the booking policies.' }
  if (!input.patientName || !input.patientPhone) return { error: 'Name and contact number are required.' }

  const sb = admin()
  // Look up the treatment for price/duration/name + booking_type validation.
  const { data: t } = await sb.from('treatments')
    .select('id, title, duration, price_rm, booking_type, category_id, requires_consultation')
    .eq('id', input.treatmentId).maybeSingle()
  if (!t) return { error: 'Treatment not found.' }
  if (t.booking_type === 'enquiry') return { error: 'This therapy is enquiry-only; please WhatsApp us.' }

  // Signed-in user (if any) to attach the booking + snapshot account health later.
  const ssr = await createServerClient()
  const { data: auth } = await ssr.auth.getUser()
  const userId = auth.user?.id ?? null

  const payable = t.booking_kind === 'consultation' ? null : (t.price_rm ?? null)
  const { data, error } = await sb.from('appointments').insert({
    customer_id: input.isGuest ? null : userId,
    is_guest: input.isGuest || !userId,
    booking_kind: input.bookingKind,
    treatment_id: t.id,
    treatment_category_id: t.category_id,
    treatment_name: t.title,
    duration_mins: null,
    status: 'pending',
    requested_datetime: input.preferredAt,
    requested_datetime_alt: input.preferredAtAlt ?? null,
    patient_name: input.patientName,
    patient_phone: input.patientPhone,
    patient_email: input.patientEmail,
    patient_gender: input.patientGender,
    gender_requirement: requiredTherapistGender(input.patientGender),
    pre_visit_form: input.healthIntake,
    payable_amount_rm: input.bookingKind === 'treatment' ? (t.price_rm ?? null) : null,
    payment_status: 'unpaid',
    parent_consultation_id: input.parentConsultationId ?? null,
    mode: 'in-person',
  }).select('id').single()

  if (error) return { error: error.message }
  return { id: data.id }
}
```

- [ ] **Step 2: Implement reads** in `src/lib/storefront/booking.ts` (`getBookingForPayment` via service role by id; `getMyBookings` via the passed authed client filtered to `customer_id = userId`). Map rows → `StaffAppointment`.

- [ ] **Step 3: Typecheck & commit**

```bash
npx tsc --noEmit
git add src/lib/booking/actions.ts src/lib/storefront/booking.ts
git commit -m "feat(booking): createBookingRequest action + customer reads"
```

---

### Task 6: Native booking request form (replaces Cal.com)

**Files:**
- Create: `src/components/booking/BookingRequestForm.tsx` (client component)
- Create: `src/components/booking/PolicyDisclaimers.tsx`
- Create: `src/components/booking/HealthIntakeFields.tsx`
- Modify: `src/app/(public)/book/treatment/page.tsx` — render the catalog picker (existing) → on select, show `BookingRequestForm` (kind `treatment`); remove the Cal.com embed/orchestrator usage.
- Modify: `src/app/(public)/book/consultation/page.tsx` — render `BookingRequestForm` in `consultation` kind (free; no price); remove Cal.com.
- Reference (read, do not rewrite): `src/components/booking/TreatmentPicker.tsx`, `BookingTreatmentOrchestrator.tsx`, `ConsultationRequiredNotice.tsx`.

**Interfaces:**
- Consumes: `createBookingRequest` (Task 5); treatment list from `getTreatmentsFlat` (existing).
- Produces: on submit success, `router.push('/book/request/' + id)`.

- [ ] **Step 1: Build `PolicyDisclaimers.tsx`** — three concise notices using existing card tokens (`border-accent/30`, `font-heading` uppercase eyebrow): (1) same-gender therapist policy, (2) 12h cancellation = non-refundable after, (3) reschedule via WhatsApp 12–24h before. A required checkbox "I understand and accept these policies" sets `acceptedPolicies`.

- [ ] **Step 2: Build `HealthIntakeFields.tsx`** — fields: existing conditions, allergies, current medications, pregnancy (for female), free-text notes. Shown for everyone; pre-filled from account health when signed in (passed as props).

- [ ] **Step 3: Build `BookingRequestForm.tsx`** — fields: treatment (preselected/!readonly), preferred date+time (native `datetime-local`, min = now+leadTime from treatment), optional alternate time, gender (male/female), name, phone, email; for signed-in users prefill name/email and toggle "book as guest"; embed `HealthIntakeFields` + `PolicyDisclaimers`. On submit call `createBookingRequest`; show inline error or redirect. Match the visual style of the existing booking components (cream cards, accent buttons).

- [ ] **Step 4: Wire pages** — `book/treatment` keeps the existing category/treatment picker; selecting a `consultation`-type treatment routes through the consultation form first (show `ConsultationRequiredNotice`). `book/consultation` renders the form in consultation kind directly.

- [ ] **Step 5: Manually verify** — submit a guest treatment request → row appears in `appointments` (status `pending`), redirect to `/book/request/<id>`.

- [ ] **Step 6: Commit**

```bash
git add src/components/booking src/app/(public)/book
git commit -m "feat(booking): native request form replacing Cal.com"
```

---

### Task 7: Request status + pay page (customer)

**Files:**
- Create: `src/app/(public)/book/request/[id]/page.tsx`

**Interfaces:**
- Consumes: `getBookingForPayment` (Task 5); `STATUS_LABEL` (Task 4).
- Produces: a status view; when `status === 'awaiting_payment'`, a "Pay RM<amount>" button linking to `/book/request/[id]/pay` (Task 14). When `pending`, an "Awaiting clinic approval" state. When `confirmed`, a success + details + WhatsApp reschedule link.

- [ ] **Step 1: Build the page** — server component; fetch by id; render status timeline (Requested → Approved → Paid → Confirmed), the appointment details, policy reminders, and the contextual CTA. Guard: only show contact details, never another patient's data (fetch is by opaque id; acceptable for day 1, harden with a token later — note this in `internal_notes`).

- [ ] **Step 2: Commit**

```bash
git add "src/app/(public)/book/request"
git commit -m "feat(booking): customer request status + pay page"
```

---

## PHASE 2 — Staff console & doctor dashboard

### Task 8: Staff guard + appointment reads

**Files:**
- Create: `src/lib/staff/guard.ts`, `src/lib/staff/appointments.ts`

**Interfaces:**
- Produces:
  - `requireStaff(allowed?: Role[]): Promise<{ user, role, db }>` — verifies session + role via the SSR client, returns a **service-role** `db` client; redirects to `/staff/login` if unauthorized.
  - `listAppointments(db, filters): Promise<StaffAppointment[]>`
  - `getAppointment(db, id): Promise<StaffAppointment | null>`

- [ ] **Step 1: Implement `requireStaff`**

```ts
import { redirect } from 'next/navigation'
import { createClient as ssr } from '@/lib/supabase/server'
import { createClient as sb } from '@supabase/supabase-js'

export type Role = 'admin' | 'doctor' | 'front_desk'
export async function requireStaff(allowed: Role[] = ['admin','doctor','front_desk']) {
  const s = await ssr()
  const { data: { user } } = await s.auth.getUser()
  if (!user) redirect('/staff/login')
  const { data: profile } = await s.from('users').select('role').eq('id', user.id).maybeSingle()
  const role = profile?.role as Role | undefined
  if (!role || !allowed.includes(role)) redirect('/staff/login')
  const db = sb(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
  return { user, role, db }
}
```

- [ ] **Step 2: Implement `listAppointments` / `getAppointment`** — select the `StaffAppointment` columns, support filters (status, booking_kind, date range, search by patient_name/phone), order by `requested_datetime`/`created_at`. Map rows → `StaffAppointment`.

- [ ] **Step 3: Typecheck & commit**

```bash
npx tsc --noEmit
git add src/lib/staff/guard.ts src/lib/staff/appointments.ts
git commit -m "feat(staff): role guard + appointment reads"
```

---

### Task 9: Shared staff console (admin + front desk)

**Files:**
- Create: `src/app/(staff)/layout.tsx`, `src/app/(staff)/console/page.tsx`, `src/app/(staff)/console/[id]/page.tsx`
- Create: `src/components/staff/BookingQueue.tsx`, `StatusBadge.tsx`

**Interfaces:**
- Consumes: `requireStaff(['admin','front_desk'])`, `listAppointments`, `getAppointment`.
- Produces: the queue UI + detail page that Task 10 attaches the approve/assign action to.

- [ ] **Step 1: `(staff)/layout.tsx`** — calls `requireStaff()`; renders a simple shell (brand header, nav: Console / Doctor (if doctor) / back to site, signed-in role badge).

- [ ] **Step 2: `console/page.tsx`** — `requireStaff(['admin','front_desk'])`; tabs/filter: **New requests** (`pending`), **Awaiting payment**, **Confirmed (today/upcoming)**, **All**. Render `BookingQueue` (table: patient, treatment, kind, requested time, gender, status badge, amount, link to detail). Include `<AutoRefresh/>` (Task 12).

- [ ] **Step 3: `console/[id]/page.tsx`** — appointment detail: patient + contact, requested times, treatment + price, health intake, status timeline, and the **Assign & Approve** panel (Task 10).

- [ ] **Step 4: Commit**

```bash
git add "src/app/(staff)" src/components/staff
git commit -m "feat(staff): shared bookings console (admin + front desk)"
```

---

### Task 10: Approve & assign action

**Files:**
- Create: `src/lib/staff/actions.ts` (adds `approveAndAssign`, `setStatus`)
- Create: `src/components/staff/AssignDrawer.tsx`

**Interfaces:**
- Consumes: `requireStaff`, `canTransition`, `requiredTherapistGender`.
- Produces:
  - `approveAndAssign(id, { therapistName, therapistGender, confirmedAt, room }): Promise<{ ok: true } | { error }>` — validates therapist gender === patient `gender_requirement`; sets `appointment_date_time`, therapist fields, `approved_by/at`; transitions: treatment → `awaiting_payment`; consultation → `confirmed`.
  - `setStatus(id, to): Promise<...>` — guarded by `canTransition`.

- [ ] **Step 1: Implement `approveAndAssign`**

```ts
'use server'
import { requireStaff } from './guard'
import { canTransition } from '@/lib/booking/status'

export async function approveAndAssign(id: string, p: {
  therapistName: string; therapistGender: 'male'|'female'; confirmedAt: string; room?: string
}) {
  const { user, db } = await requireStaff()
  const { data: appt } = await db.from('appointments')
    .select('status, booking_kind, gender_requirement').eq('id', id).maybeSingle()
  if (!appt) return { error: 'Not found' }
  if (appt.gender_requirement && p.therapistGender !== appt.gender_requirement)
    return { error: `Same-gender policy: assign a ${appt.gender_requirement} therapist.` }
  const to = appt.booking_kind === 'consultation' ? 'confirmed' : 'awaiting_payment'
  if (!canTransition(appt.status, to)) return { error: `Cannot move ${appt.status} → ${to}` }
  const { error } = await db.from('appointments').update({
    assigned_therapist_name: p.therapistName,
    assigned_therapist_gender: p.therapistGender,
    appointment_date_time: p.confirmedAt,
    room: p.room ?? null,
    approved_by: user.id, approved_at: new Date().toISOString(),
    status: to,
  }).eq('id', id)
  return error ? { error: error.message } : { ok: true as const }
}
```

- [ ] **Step 2: Build `AssignDrawer.tsx`** — therapist name, therapist gender (pre-locked to `gender_requirement`), confirmed datetime, room; calls `approveAndAssign`; on success `router.refresh()`.

- [ ] **Step 3: Manually verify** — approve a pending treatment → status `awaiting_payment`; approve a consultation → `confirmed`; mismatched gender → blocked.

- [ ] **Step 4: Commit**

```bash
git add src/lib/staff/actions.ts src/components/staff/AssignDrawer.tsx
git commit -m "feat(staff): approve & assign with gender-match enforcement"
```

---

### Task 11: Doctor dashboard (booked patients only)

**Files:**
- Create: `src/app/(staff)/doctor/page.tsx`, `src/app/(staff)/doctor/[id]/page.tsx`
- Modify: `src/lib/staff/appointments.ts` (add `getDoctorPatients`, `getDoctorPatient`)
- Modify: `src/lib/staff/actions.ts` (add `saveClinicalNotes`)

**Interfaces:**
- Consumes: `requireStaff(['admin','doctor'])`.
- Produces: doctor list scoped to **booked** appointments (status in `confirmed,checked_in,in_progress,completed` OR `booking_kind='consultation'` once confirmed); each patient view shows **name, contact number, previous health information** (account health + pre-visit intake + past appointments), and a clinical-notes editor.

- [ ] **Step 1: `getDoctorPatients(db)`** — select appointments where `status in ('confirmed','checked_in','in_progress','completed')`, newest first; map to `StaffAppointment`. (This satisfies "doctor only sees patients once they've booked".)

- [ ] **Step 2: `getDoctorPatient(db, id)`** — fetch the appointment + (if `customer_id`) join `users` health fields + fetch that patient's past appointments; assemble `DoctorPatientView`.

- [ ] **Step 3: `doctor/page.tsx`** — `requireStaff(['admin','doctor'])`; render today's & upcoming booked patients (name, treatment, time, contact, status). `<AutoRefresh/>`.

- [ ] **Step 4: `doctor/[id]/page.tsx`** — header: patient name + phone; **Health** panel (account allergies/medications/conditions/height/weight + intake answers + pregnancy flag + contraindication reminder from the treatment); **History** (past appointments); **Clinical notes** editor calling `saveClinicalNotes(id, text)`; for **consultations**, an **"Unlock treatment"** button (Task 16).

- [ ] **Step 5: `saveClinicalNotes`** — `requireStaff(['admin','doctor'])` then update `clinical_notes`.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(staff)/doctor" src/lib/staff
git commit -m "feat(doctor): dashboard scoped to booked patients with health view"
```

---

### Task 12: Auto-refresh (poll) for live sync

**Files:**
- Create: `src/components/staff/AutoRefresh.tsx`

**Interfaces:**
- Produces: a tiny client component that calls `router.refresh()` every 20s (and on window focus).

- [ ] **Step 1: Implement & drop into console + doctor pages.** Commit.

```bash
git add src/components/staff/AutoRefresh.tsx
git commit -m "feat(staff): polling auto-refresh for near-live updates"
```

---

## PHASE 3 — Payment seam (stub day 1, Billplz day 2)

### Task 13: Payment provider seam + stub

**Files:**
- Create: `src/lib/payments/provider.ts`, `src/lib/payments/stub.ts`, `src/lib/payments/billplz.ts` (shell), `src/lib/payments/index.ts`

**Interfaces:**
- Produces:
  - `interface PaymentProvider { createBill(args: { appointmentId, amountRm, name, email, phone, description, callbackUrl, redirectUrl }): Promise<{ billId: string; url: string }>; verifyCallback(req: Request): Promise<{ billId: string; paid: boolean }>; }`
  - `getPaymentProvider(): PaymentProvider` — returns `billplz` if `BILLPLZ_API_KEY` set, else `stub`.

- [ ] **Step 1: Define the interface** (`provider.ts`).
- [ ] **Step 2: Implement `stub.ts`** — `createBill` returns `{ billId: 'stub_'+appointmentId, url: '/book/request/'+appointmentId+'/pay?stub=paid' }`; `verifyCallback` reads `?billId` and treats `stub=paid` as paid. This lets the full flow run with no Billplz account.
- [ ] **Step 3: Create `billplz.ts` shell** — same interface, methods `throw new Error('Billplz wiring pending — see day-2 task')`. Day 2: implement `createBill` (POST `https://www.billplz.com/api/v3/bills`) + `verifyCallback` (x-signature check).
- [ ] **Step 4: `index.ts`** — env-based selector.
- [ ] **Step 5: Commit**

```bash
git add src/lib/payments
git commit -m "feat(payments): provider seam + stub (Billplz drop-in for day 2)"
```

---

### Task 14: Pay route + callback

**Files:**
- Create: `src/app/(public)/book/request/[id]/pay/route.ts`, `src/app/api/payments/callback/route.ts`
- Modify: `src/lib/booking/actions.ts` (add `startPayment`, `markPaid`)

**Interfaces:**
- Consumes: `getPaymentProvider`, `canTransition`.
- Produces:
  - `startPayment(id)` — guards `status==='awaiting_payment'`; calls `createBill`; stores `payment_bill_id/url/provider`, sets `payment_status='pending'`; returns `url`.
  - `markPaid(billId)` — sets `payment_status='paid'`, `paid_at`, transitions `awaiting_payment → confirmed`.

- [ ] **Step 1: `pay/route.ts`** — GET: load appointment; if stub `?stub=paid`, call `markPaid` then redirect to the request page; else call `startPayment` and redirect to provider `url`.
- [ ] **Step 2: `api/payments/callback/route.ts`** — POST/GET: `verifyCallback`; if paid, `markPaid(billId)`; respond 200.
- [ ] **Step 3: Manually verify** stub path: approve a treatment (→ awaiting_payment) → open request page → Pay → returns `confirmed`.
- [ ] **Step 4: Commit**

```bash
git add "src/app/(public)/book/request" src/app/api/payments src/lib/booking/actions.ts
git commit -m "feat(payments): pay route + callback (stub end-to-end)"
```

---

## PHASE 4 — Policies & consultation unlock

### Task 15: Cancellation + reschedule

**Files:**
- Modify: `src/lib/booking/actions.ts` (add `cancelBooking`)
- Modify: `src/app/(public)/book/request/[id]/page.tsx` (cancel button + WhatsApp reschedule link)

**Interfaces:**
- Produces: `cancelBooking(id)` — uses `canCancel(appointment_date_time, now)`; sets `status='cancelled'`, `cancelled_at`, `cancellation_reason`; if within 12h and paid, mark non-refundable (`payment_status` stays `paid`, add note); else flag refund-eligible (`refunded` handled manually day 1).

- [ ] **Step 1: Implement `cancelBooking`** with the 12h rule. **Step 2:** wire button + `whatsappRescheduleLink`. **Step 3:** verify within/outside window. **Step 4:** commit.

```bash
git commit -am "feat(booking): cancellation (12h rule) + WhatsApp reschedule"
```

---

### Task 16: Consultation → treatment unlock

**Files:**
- Modify: `src/lib/staff/actions.ts` (add `unlockTreatment`)
- Modify: `src/app/(staff)/doctor/[id]/page.tsx` (unlock button on consultations)
- Modify: `src/components/booking/BookingRequestForm.tsx` (accept `parentConsultationId`)

**Interfaces:**
- Produces: `unlockTreatment(consultationId, { treatmentId, note })` — on a completed/confirmed consultation, sets `consultation_outcome=note`, `treatment_unlocked=true`; returns a prefilled booking link `/book/treatment?from=<consultationId>&treatment=<treatmentId>` the customer (or front desk) uses to raise the treatment booking, which carries `parent_consultation_id`.

- [ ] **Step 1: Implement `unlockTreatment`.** **Step 2:** doctor UI button. **Step 3:** form reads `from`/`treatment` query params and passes `parentConsultationId`. **Step 4:** verify a consultation can unlock a treatment that then runs approve → pay → confirm. **Step 5:** commit.

```bash
git commit -am "feat(booking): consultation unlocks treatment booking"
```

---

## PHASE 5 — Notifications & verification

### Task 17: Transactional emails (fast-follow, optional for day 1)

**Files:** Create `src/lib/booking/notify.ts` — Resend emails on: request received, approved/awaiting-payment, payment confirmed, cancelled. Call from the relevant actions. Skip if `RESEND_API_KEY` unset. Commit.

### Task 18: End-to-end verification

- [ ] Guest **direct** treatment: request → console shows it → approve+assign → awaiting_payment → pay (stub) → confirmed; doctor dashboard shows the patient with name/contact/health.
- [ ] Signed-in **consultation-required** treatment: consultation request → approve → confirmed → doctor unlocks treatment → treatment booking → approve → pay → confirmed.
- [ ] Gender mismatch blocked at assignment.
- [ ] Cancel >12h allowed; <12h shows non-refundable.
- [ ] `npx tsc --noEmit` clean; `npx vitest run src/lib/booking` green.
- [ ] Confirm doctor cannot see non-booked customers (query scope).

---

## Self-Review

- **Spec coverage:** Direct booking (T5,6,10,14) ✓; consultation-first (T6,10,16) ✓; drop Cal.com (T6) ✓; simultaneous staff visibility (T9,11,12) ✓; guest or sign-in (T5,6) ✓; gender policy disclaimer + enforcement (T6,10) ✓; 12h cancellation (T4,15) ✓; WhatsApp reschedule (T4,15) ✓; doctor sees only booked patients with name/health/contact (T11) ✓; payment after approval, Billplz day-2 drop-in (T13,14) ✓.
- **Deferred (stated):** real Billplz wiring (T13 shell → day 2), real-time sockets (polling instead, T12), per-role bespoke dashboards beyond shared console + doctor view, refund automation.
- **Type consistency:** `BookingStatus`/`StaffAppointment`/`DoctorPatientView` defined in T2 and used verbatim in T5/T8/T11; `approveAndAssign`/`markPaid`/`createBookingRequest` signatures consistent across T5/T10/T14.
