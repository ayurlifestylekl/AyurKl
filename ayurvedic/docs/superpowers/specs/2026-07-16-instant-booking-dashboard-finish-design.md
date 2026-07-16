# Instant Booking and Dashboard Finish Design

**Date:** 2026-07-16  
**Status:** Approved for implementation planning  
**Source of truth:** Customer-provided booking-flow screenshot and the subsequent confirmations in this task

## 1. Objective

Finish the Kerala Ayurvedic Lifestyle booking system so the online treatment and consultation paths match the approved screenshot exactly, remove obsolete approval-oriented dashboard workflows, harden payment and scheduling correctness, and verify the public/customer, front-desk/admin, and doctor experiences before release.

The release standard is: no known defects, every approved flow covered by automated tests, every role-specific dashboard smoke-tested, the required database migrations verified, and test-mode payment callbacks completed successfully.

## 2. Authoritative Business Rules

1. Online customers choose a treatment and one genuinely available time slot.
2. Online treatment bookings proceed directly to FPX/card checkout without staff approval.
3. A treatment is confirmed automatically only after successful payment.
4. A free consultation is confirmed immediately and never enters a payment flow.
5. Customers do not choose therapists.
6. After a treatment is paid and confirmed, front desk, admin, or doctor assigns the actual therapist internally.
7. Therapist assignment may happen whenever operationally convenient; there is no assignment deadline.
8. Unassigned confirmed treatments remain prominently flagged in red until assigned.
9. Therapist assignment must enforce the same-gender policy, schedule clashes, leave, blocks, and database double-booking protection.
10. A treatment cannot be checked in or started until a therapist is assigned.
11. Once assigned, the appointment appears in that therapist's calendar at the confirmed slot.
12. Consultations use one 30-minute Vaidya slot, regardless of the duration of any linked treatment.
13. After the consultation, only a doctor or admin records the outcome and clears the customer for treatment.
14. A cleared customer can then book and pay for the linked treatment through the standard online treatment path.
15. Manual phone and walk-in bookings remain available as an internal staff operation, but do not reintroduce an approval stage into online bookings.

## 3. Online Treatment Flow

### 3.1 Customer selection

The customer selects a directly bookable treatment, gender, one available date/time, contact details, required health information, and accepts the policies. The online form does not request an alternate slot because staff no longer review or negotiate online requests.

The slot picker is an availability preview only. The server must independently verify that the submitted time:

- parses to a valid timestamp;
- is in the future;
- is one of the clinic's generated appointment slots;
- falls within the configured treatment operating hours;
- satisfies treatment-specific lead time;
- is not blocked by a centre closure or relevant therapist leave;
- has sufficient same-gender roster capacity for the complete treatment duration; and
- remains available at the atomic database claim.

### 3.2 Checkout hold

When validation succeeds, the system atomically claims the required capacity and inserts an `awaiting_payment` appointment with a 20-minute payment expiry. Group bookings claim every guest in one transaction so the entire group succeeds or fails together.

The checkout page presents enabled payment methods:

- FPX through Billplz; and
- credit/debit card through Stripe when configured.

An expired hold is no longer payable and is released for another customer. Repeated payment clicks must reuse an existing open bill for the same provider instead of creating duplicate payable bills.

### 3.3 Payment confirmation

The payment callback or return-page reconciliation identifies the lead appointment deterministically even when a group shares one bill ID. A successful payment atomically moves the individual appointment or every member of the group from `awaiting_payment` to `confirmed`, writes paid metadata, and sends notifications once.

A paid booking has no therapist assignment initially. If money arrives after cancellation or expiry and the appointment cannot be confirmed, the customer must not receive a false confirmation; staff receive an urgent payment-problem alert for manual refund or reconciliation.

### 3.4 Post-payment assignment and visit

The confirmed appointment appears in:

- the confirmed-bookings view;
- the paid-but-unassigned alert queue;
- the red `Unassigned` schedule column for its appointment day; and
- staff/doctor notification channels.

Front desk, admin, or doctor assigns or reassigns a therapist without changing the booking's confirmed status. The assignment operation performs same-gender, overlap, leave/block, and concurrent double-booking checks.

Front desk can check in a confirmed treatment only after assignment. Starting treatment is also blocked without assignment. Check-in and subsequent status transitions retain the assigned therapist so the appointment remains on that therapist's calendar.

## 4. Free Consultation Flow

The customer selects `Free Consultation` and one open 30-minute Vaidya slot. The server independently validates future time, consultation operating hours, slot alignment, centre/Vaidya blocks, and Vaidya availability, then atomically creates a `confirmed` consultation.

The consultation does not create a payment hold, bill, checkout page, `Payment received` message, or therapist-assignment instruction. Customer and staff notifications explicitly state that the free consultation is confirmed with the Vaidya.

Consultation status and copy must not mention same-gender therapist assignment. Gender may remain part of the patient's health/profile information but does not affect Vaidya-slot capacity.

Only consultations whose scheduled time has passed and that are in an appropriate attended/completed state appear in `Consultations to clear`. Doctor or admin records the outcome and clears the consultation. Front desk cannot perform clinical clearance.

Clearance must verify that the target record is a consultation and preserve an auditable outcome. The treatment-unlock link carries the consultation ID and optional prescribed treatment ID. The treatment booking server verifies that the referenced consultation is cleared and belongs to the same authenticated customer or matches the guest booking identity/token before accepting a consultation-required treatment.

## 5. Notifications

### 5.1 Paid treatment

After payment:

- customer email: appointment confirmed, treatment, date/time, amount/status link, arrival and policy information;
- staff Telegram: payment received, booking confirmed, assignment required;
- staff email: payment received, booking confirmed, assignment required; and
- email failure alert: Telegram instructs staff to follow up through WhatsApp.

### 5.2 Free consultation

After creation:

- customer email: free consultation confirmed with the Vaidya, date/time and status link;
- staff Telegram: new free consultation confirmed, with no payment wording;
- staff email: new free consultation confirmed, with no payment or therapist-assignment wording; and
- customer copy: no same-gender therapist statement.

Notification delivery failures never roll back a valid booking, but are observable to staff.

## 6. Frontend and Customer Experience

Public and customer-facing booking copy follows the direct flow:

- treatment: `Choose slot` -> `Payment` -> `Confirmed`;
- consultation: `Choose slot` -> `Confirmed`;
- no `request`, `preferred/alternate time`, `clinic review`, `approval`, or `pay after approval` language for online customers; and
- no customer therapist picker.

The customer status page shows the confirmed slot, payment state for treatments, and assigned therapist only after staff assignment. While unassigned, it reassures the customer that the clinic will assign the appropriate therapist without implying that confirmation is pending.

Customer account appointment lists use the same terminology. Obsolete Cal.com references are removed from visible content and active application routes. Shop, cart, and product navigation remain hidden when commerce is disabled.

## 7. Front Desk and Admin Experience

The operational booking surfaces prioritise:

1. paid confirmed treatments needing therapist assignment;
2. today's confirmed appointments;
3. the therapist schedule and red `Unassigned` column;
4. check-in and treatment progress;
5. upcoming consultations; and
6. payment problems or expiring/expired holds that require attention.

Online `New requests`, `Awaiting approval`, `Approve`, `Reject request`, `Contacted via WhatsApp`, and preferred/alternate-time negotiation are removed from the normal online workflow. Historical records remain readable, and internal manual booking creation remains available.

The admin portal uses feature-aware navigation and cards. Commerce, inventory, product, agent, marketplace, wholesale, payout, and promotional modules are hidden when their corresponding business feature is disabled. Their implementation is preserved unless separately retired; cleanup must not destructively delete future business capabilities.

Production dashboards do not show mock/demo figures or demo fallbacks. Empty states accurately describe real data and available actions.

## 8. Doctor Experience

The doctor dashboard contains:

- today's patients;
- doctor calendar/schedule;
- consultations ready for clinical outcome;
- patient directory;
- clinical notes; and
- confirmed treatments requiring therapist assignment when the doctor participates in that operation.

Request-approval pages, counters, and wording are removed from the doctor navigation and overview. Doctor-only accounts continue to have customer contact information redacted.

Doctor/admin can clear eligible consultations. Front desk cannot. Doctor assignment of treatment therapists uses the same central assignment action and validation as front desk/admin.

## 9. Data Integrity and Security

The implementation must:

- keep slot claims race-safe through a database transaction and stable advisory-lock ordering;
- confirm a shared group bill without relying on a single-row query over duplicated bill IDs;
- make payment confirmation idempotent and notification-safe;
- reject direct server-action submissions for invalid, past, out-of-hours, misaligned, blocked, or unavailable slots;
- ensure expired unpaid holds do not consume capacity;
- enforce the same-gender rule on both capacity and named assignment;
- prevent treatment check-in/start without assignment;
- restrict clinical clearance to doctor/admin and eligible consultations;
- bind consultation clearance to the correct customer/guest treatment booking; and
- preserve service-role clients behind verified server-side role gates.

## 10. Dashboard Cleanup Inventory

Implementation planning will create a route/component inventory with one of these dispositions for every relevant item:

- **Keep:** required by the approved flow and currently correct;
- **Update:** required but contains legacy logic, copy, permissions, or data handling;
- **Hide by feature:** valid future capability that is disabled for the present launch;
- **Remove:** obsolete, duplicated, mock/demo, or Cal.com-era UI with no supported use; or
- **Historical compatibility:** retained only to display existing legacy records safely.

The inventory covers public booking pages, customer appointment pages, front-desk console, admin dashboard/appointments, and doctor overview/calendar/consultations/patients.

## 11. Error Handling

Customer errors use actionable language and never expose provider/database details. Expected cases include slot just taken, expired hold, unavailable payment method, provider failure, invalid clearance, and already-paid/reconciled booking.

Staff receive an explicit alert for money received against a booking that cannot transition to confirmed. Assignment errors identify gender mismatch, therapist busy-until time, leave/block, or concurrent claim without changing the booking.

Booking creation and payment confirmation remain valid even if email or Telegram delivery fails. Notification failures are logged and surfaced through the existing staff-alert mechanism.

## 12. Verification and Release Gates

### 12.1 Automated tests

Add failing regression tests before fixes for:

- shared group bill lookup and atomic group confirmation;
- single booking payment confirmation and idempotency;
- 20-minute expiry and late-payment handling;
- 30-minute consultation duration with and without a linked treatment;
- paid-treatment versus free-consultation notification content;
- future, operating-hours, slot-alignment, lead-time, block, and capacity validation;
- consultation-clearance role, record-kind, time/status, and ownership rules;
- assignment requirements before treatment check-in/start;
- same-gender assignment, leave, overlap, and concurrent double-booking;
- customer-facing status terminology; and
- feature-aware dashboard/navigation visibility.

Run the entire Vitest suite, TypeScript validation, linting, `git diff --check`, and the network-enabled production build.

### 12.2 Database and payment integration

In a staging/test environment:

- verify every required migration, RPC, enum value, column, index, policy, and exclusion constraint;
- submit two concurrent claims for the final available slot and confirm exactly one succeeds;
- complete FPX and card test-mode payments;
- verify webhook and missed-webhook return-page reconciliation;
- complete a group payment and confirm every guest exactly once;
- expire an unpaid hold and confirm the slot becomes available; and
- simulate late payment against an expired/cancelled booking and confirm the staff alert.

### 12.3 Role-based browser smoke tests

At mobile and desktop sizes, verify:

- public treatment booking and checkout;
- public free consultation booking;
- customer booking status and account appointment list;
- front-desk unassigned queue, assignment, schedule and check-in;
- admin overview and appointment operations;
- doctor overview, contact redaction, assignment, notes and clearance; and
- feature-disabled navigation and empty states.

### 12.4 Release decision

Do not deploy until all automated checks pass, database probes succeed, payment smoke tests complete, role-based browser scenarios pass, and the dashboard cleanup inventory has no unexplained `Update` or `Remove` items remaining.

## 13. Out of Scope

- Customer self-selection of a therapist.
- A new payment provider beyond the existing Billplz and Stripe seams.
- Destructive removal of dormant commerce/agent capabilities that can be safely hidden by feature configuration.
- A visual redesign unrelated to the approved flow.
- Production deployment, live database mutation, or real-money payment without explicit approval.

