# Self-Service Booking Verification

Date: 2026-07-17

## Automated local gate

- Vitest: PASS — 365 tests across 34 files.
- TypeScript (`tsc --noEmit`): PASS.
- Whitespace (`git diff --check`): PASS.
- Network-enabled Next.js production build: PASS.
- Schema verifier: FAIL (Expected due to missing unapplied staging migrations). Exact failures: atomic reschedule RPC, atomic cancellation RPC, appointment columns, booking management OTPs, booking management grants, booking events, booking refunds, booking resource members.

## Approval-gated staging evidence

The following checks intentionally remain pending until a human explicitly approves use of the staging database, payment sandboxes, role accounts, and test-data cleanup:

- Staging migration application in order (20260718_self_service_booking_management.sql, 20260718b_atomic_booking_reschedule.sql, 20260718c_atomic_booking_cancellation.sql).
- Post-migration schema probe verification.
- Verification of Brevo recovery and notification emails (reschedule, cancellation, refund pending, refund confirmed, refund exception).
- Verification of provider refunds in sandboxes/test mode (Stripe and Billplz, group and individual refunds).
- Verification of concurrency and group invariants (simultaneous claims, failed group moves).
- Browser smoke tests at 390px and 1440px for new self-serve flows.

No live migration, deployment, production credential, or real payment was used during this verification phase.
