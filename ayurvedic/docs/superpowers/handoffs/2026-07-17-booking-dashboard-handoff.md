# Booking and Dashboard Completion Handoff

**Date:** 2026-07-17  
**Repository:** `/Users/sanjaygunabalan2626gmail.com/Documents/Ayurvedic /Ayurvedic /ayurvedic`  
**Branch:** `main`  
**Primary plan:** `docs/superpowers/plans/2026-07-16-instant-booking-dashboard-finish.md`  
**Approved design:** `docs/superpowers/specs/2026-07-16-instant-booking-dashboard-finish-design.md`  
**Durable progress ledger:** `../.superpowers/sdd/progress.md`

## Objective

Finish the booking system exactly according to the approved WhatsApp screenshot:

### Paid treatment flow

1. Customer chooses a treatment and one open time slot.
2. Customer pays by FPX or card.
3. The appointment becomes confirmed immediately; there is no staff approval step.
4. The customer receives a confirmation email.
5. Front desk/doctor receives the internal email and Telegram notification.
6. Staff assigns the actual same-gender therapist after payment, whenever operationally convenient.
7. Until assignment, the appointment appears in the red **Needs therapist / Unassigned** backstop.
8. On appointment day, front desk checks the customer in and the appointment appears on the assigned therapist's calendar.
9. Customers must never choose their own therapist.

### Free consultation flow

1. Customer chooses **Free Consultation** and an open Vaidya slot.
2. Consultation is immediately confirmed for 30 minutes with no payment.
3. On/after the attended consultation, the doctor records the outcome and clears treatment booking.
4. The customer can then choose and pay for the permitted treatment.
5. Front desk cannot perform the clinical clearance action.

## Completed and reviewed work

The following commits are complete:

| Task | Commit | Result |
|---|---|---|
| Design specification | `5a0d98c` | Screenshot flow documented |
| Implementation plan | `279baa9` | Ten-task TDD plan |
| Cleanup inventory | `df2ded9` | 57 dashboard/flow dispositions; review approved |
| Slot/instant-booking foundation | `fbb3e4e` | Server slot validation, fixed 30-minute consultations, instant claims; review approved |
| Atomic payments | `05f7f0f` | Atomic/idempotent single/group confirmation and callback policy; review approved |
| Notification separation | `45b3824` | Explicit treatment/consultation confirmation kind; review approved |
| Consultation clearance/linkage | `1c3c91a` | Doctor-only clearance, signed linkage, replay protection; review approved |
| Assignment-before-operation | `f8c9f25` | Implementation complete; final reviewer pass still required |

Task 6 clean-HEAD evidence at `f8c9f25`:

- 27/27 focused tests passed.
- 201/201 clean-HEAD tests passed.
- Archived clean-HEAD `tsc --noEmit` passed.
- Base-to-HEAD diff check passed.
- Migration was not applied.

## Exact next step

Do **not** restart or redo Tasks 1–5.

1. Read this handoff, the plan, design, and progress ledger.
2. Generate a review package for Task 6 from `1c3c91a` to `f8c9f25`.
3. Run the final independent Task 6 spec/code-quality review.
4. Fix and re-review any Critical or Important findings.
5. Mark Task 6 complete in `../.superpowers/sdd/progress.md` only after review approval.
6. Continue Tasks 7, 8, 9, and 10 in order using the subagent-driven-development workflow.

## Remaining work

### Task 7 — Customer flow cleanup

- Remove alternate-slot UI/state/payload.
- Remove approval/request/review terminology from new online bookings.
- Treatment CTA: `Continue to payment`.
- Consultation CTA: `Confirm free consultation`.
- Commit the checkout route and countdown only when the route is clean-HEAD functional.
- Reconcile the current Task 5 status-route contract with Task 7's intended checkout route and update tests accordingly.
- Replace customer `Track request` language with direct booking language.
- Remove customer Cal.com cancel/reschedule behavior.
- Preserve historical approval fields only for displaying old records.

### Task 8 — Front-desk and doctor dashboards

- Remove online request-approval destinations, counts, and actions.
- Front desk priority: Needs therapist, Today, Confirmed, Awaiting payment, Availability.
- Preserve the red unassigned backstop.
- Rename group approval UI to therapist assignment and remove time negotiation/rejection.
- Doctor overview: Today's patients, Needs therapist, To clear, Total patients.
- Redirect old `/doctor/requests` bookmarks to `/doctor`.
- Keep doctor contact redaction and doctor-only clinical clearance.

### Task 9 — Admin and Cal.com cleanup

- Rename active admin destination to `Appointments`.
- Hide commerce/partner navigation unless `NEXT_PUBLIC_COMMERCE_ENABLED=true`.
- Remove appointment mock fallbacks and approval-default segments.
- Add real Needs therapist and Awaiting payment views.
- Remove active Cal.com webhook, link modules, UI, copy, tests, and dependency.
- Preserve historical `calcom_booking_uid` data/read compatibility.
- Focus the disabled-commerce dashboard on real booking operations.

### Task 10 — Release verification

- Create and run the schema verifier.
- Run all tests, TypeScript, diff checks, and production build.
- Apply migrations only to staging/test and only with explicit approval.
- Test FPX sandbox, Stripe test card, group payment, duplicate callbacks, return-page reconciliation, expiry, late payment, and last-slot concurrency.
- Test the linked-treatment advisory-lock race and treatment-assignment trigger with real staging PostgreSQL sessions.
- Run mobile (390px) and desktop (1440px) browser smoke tests for public, customer, front desk, doctor, and admin surfaces.
- Close all 57 inventory rows with commit/evidence and mark them `Verified`.
- Do not deploy to production or use real money without explicit approval.

## Current dirty-worktree warning

The checkout is intentionally dirty and contains relevant unfinished Task 7–9 work plus unrelated user assets/scripts.

**Never run:**

- `git reset --hard`
- `git checkout -- <file>`
- destructive clean commands
- broad `git add .`

Use `git status --short`, exact-path or exact-hunk staging, and commit only the owning task's files.

The current live dirty `BookingRequestForm.tsx` points treatments to the untracked checkout route. Because Task 5's committed clean HEAD intentionally uses the existing signed status route, one Task 5 source-contract test can fail in the dirty checkout until Task 7 commits and reconciles the checkout route. Validate each task from a staged/clean-HEAD archive, then make the final live tree green during Task 7.

## Known minor follow-ups

- Broaden consultation notification forbidden-copy coverage to `/payment|therapist/i`.
- Update the stale `createBookingRequest` comment that still mentions guest/customer use; it is staff-only now.
- Consider `IS DISTINCT FROM` for nullable historical payment group statuses.
- Late-payment alert delivery has a small DB-claim-to-external-message crash window; guaranteed delivery would require a future outbox.
- Final integration should add a server-action test spanning auth/Supabase/notification wiring if it can test real behavior rather than mocks alone.
- The Vite CJS deprecation warning is pre-existing and non-failing, but should be cleaned if practical.

## Required completion standard

Do not report the project as finished merely because unit tests pass. Completion requires:

- Tasks 6–10 reviewed and approved.
- No Critical or Important review findings remain.
- Full live working tree tests and TypeScript pass.
- Production build passes.
- Staging schema/payment/concurrency checks pass or are explicitly documented as blocked by missing credentials/approval.
- Browser smoke tests pass for all required roles and widths.
- No active approval flow, alternate-slot flow, customer therapist picker, mock admin appointment data, or Cal.com behavior remains.
- No production deployment or data mutation occurs without separate explicit approval.
