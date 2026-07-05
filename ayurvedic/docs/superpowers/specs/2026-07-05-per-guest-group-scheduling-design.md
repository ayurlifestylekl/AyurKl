# Per-guest scheduling & health intake for group bookings

**Date:** 5 July 2026 · **Requested by:** client (via Sanjay)

## Problem

Group bookings (2–6 guests) currently share ONE preferred time and ONE health
intake copied to every guest's record. The client wants each guest to choose
their own date & time (e.g. husband takes the 9:30 slot, wife goes at 11:30
while he watches the baby) and to have their own health intake, while keeping
one combined payment for the whole group.

## Decisions (client/Sanjay)

- Each guest picks **one preferred date & time** (no per-guest alternate).
- Each guest gets the **full health intake** (conditions, allergies,
  medications, notes, pregnancy/period for female guests), collapsed by default.
- Payment stays **one combined bill**; one payment confirms every guest.
- One shared room field at approval stays (no per-guest rooms).

## Design

No schema migration: every guest is already an `appointments` row with its own
`requested_datetime`, `appointment_date_time`, and `pre_visit_form`.

### Booking form (`src/components/booking/BookingRequestForm.tsx`)

- Guest card gains a `SlotPicker` in single-guest mode (gender + that guest's
  therapy → only slots with a free same-gender therapist for that duration)
  and a collapsed per-guest health intake with the full field set.
- Group-level Preferred/Alternate pickers and the shared Health Intake section
  are hidden for groups (unchanged for solo bookings).
- Validation: every guest needs name, gender, and a time.

### Create action (`src/lib/booking/actions.ts` — `createGroupBooking`)

- `GroupGuest` gains `preferredAt` (ISO) and `healthIntake`.
- Row insert uses the guest's own time and intake. `requested_datetime_alt`
  is null for groups.
- Request-received email lists each guest with their own time.

### Approval (`src/lib/staff/actions.ts` — `approveGroup`, and
`src/components/staff/GroupApprovalActions.tsx`)

- Still one approve action. Each guest card in the console gets a confirmed
  datetime input prefilled with the guest's requested time, next to the
  therapist dropdown.
- `approveGroup` assignments become `{ id, therapistCode, confirmedAt }[]`.
- Clash checks run per guest at that guest's own time. The blanket
  "one therapist can't serve two guests" rule becomes overlap-aware: the same
  therapist MAY serve two guests whose sessions don't overlap (checked from
  the proposed assignments; rows of the group itself stay excluded from the
  external busy query).
- Schedule blocks are checked per distinct day.

### Payment (`src/lib/booking/payment.ts`, cron)

- Combined bill unchanged. Confirmed email lists each guest with their time.
- Bug fix: the payment-reminder cron currently emails once per guest row —
  dedupe to one reminder per group.

### Emails (`src/lib/booking/notify.ts`)

- `GuestLine` gains `whenISO`. Guest lines render
  `• Name, age — Therapy — Thu 9 Jul, 9:30 am`.
- Group intros drop the single shared date (each line carries its own).
- Applied to request-received, approved, and confirmed emails.

### Customer status page (`src/app/(public)/book/request/[id]/page.tsx`)

- For groups, replace the single "Preferred time" row with a per-guest list
  (name · therapy · own time). Doctor/console detail pages already read
  per-row times.

## Out of scope

- Per-guest rooms, per-guest alternates, per-guest payment splits.
- Reworking the 15-hour payment window.

## Verification

`tsc --noEmit`, `next build`, and a manual walkthrough of: group booking with
two guests at different times → staff approval with staggered times (same
therapist allowed when sessions don't overlap; blocked when they do) →
combined payment → emails show per-guest lines.
