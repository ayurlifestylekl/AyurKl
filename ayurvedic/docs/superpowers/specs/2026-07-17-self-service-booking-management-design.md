# Self-Service Booking Management Design

**Date:** 2026-07-17
**Status:** Approved for implementation planning
**Scope:** Customer and guest rescheduling, cancellation, automatic refunds, group splitting, notifications, and removal of obsolete customer-booking behavior

## 1. Objective

Add a secure, fully self-service `Manage booking` experience so registered customers and guest customers can reschedule or cancel eligible appointments without using WhatsApp. The feature must preserve the approved instant-booking flow, enforce capacity and refund rules on the server, support individual changes within group bookings, and remove remaining customer-facing behavior from the approval and Cal.com-era system.

## 2. Authoritative Policy

All time comparisons use the appointment time in the clinic timezone, `Asia/Kuala_Lumpur`.

### 2.1 Rescheduling

- Self-service rescheduling is available until exactly 24 hours before the appointment.
- At less than 24 hours before the appointment, self-service rescheduling is disabled.
- Staff may handle exceptional late changes internally, but the customer interface does not promise an exception.
- A paid treatment remains paid and confirmed when rescheduled. The customer is not charged again.
- A consultation remains a free, confirmed, 30-minute Vaidya booking.
- A rescheduled treatment loses its named therapist assignment and returns to the `Needs therapist` queue because the previous therapist may not be available at the new time.

### 2.2 Cancellation and automatic refund eligibility

A customer receives an automatic full refund when either condition is true:

1. the cancellation is submitted no more than one hour after the appointment row was created; or
2. the cancellation is submitted at least 48 hours before the appointment start.

The one-hour mistake window takes precedence over the appointment-time window. Therefore, a customer who books an appointment fewer than 48 hours away can still receive a full refund if they cancel within one hour of creating it, provided the appointment has not started and the booking is otherwise cancellable.

Between 24 and 48 hours before the appointment:

- automatic refund cancellation is unavailable; and
- self-service rescheduling remains available.

At less than 24 hours before the appointment:

- self-service cancellation and rescheduling are disabled;
- the interface explains that the online change window has closed; and
- a staff-initiated cancellation, if granted as an exception, is non-refundable unless an authorized staff member explicitly overrides it outside this customer flow.

For unpaid `awaiting_payment` bookings, cancellation releases the hold and voids any open payment bill; there is no refund because no settled payment exists.

### 2.3 Refund completion semantics

- An eligible paid cancellation requests a full refund through the original payment provider.
- The appointment must not be presented as `refunded` until the provider confirms the refund.
- The customer sees `Refund pending` while confirmation is outstanding.
- A failed or ambiguous refund is placed in a prominent staff exception queue and the customer is told that the clinic is reviewing the refund.
- Refund requests and provider callbacks are idempotent so retries cannot produce duplicate refunds.
- The system records provider refund identifiers, request time, confirmation time, failure reason, and the policy rule that made the refund eligible.

## 3. Access and Identity

### 3.1 Registered customers

Registered customers access `Manage booking` from:

- their customer dashboard;
- booking confirmation and reminder emails; and
- the secure booking-status page.

The server authorizes access by the authenticated customer ID. Email links may also contain a signed booking token as a fallback.

### 3.2 Guest customers

Guest customers do not need to create an account. They access `Manage booking` through the existing signed booking token included in confirmation and reminder emails.

If the original email or token is unavailable, the guest can use `Find my booking`:

1. enter the email address used for booking;
2. receive a six-digit verification code through the existing Brevo SMTP transport;
3. enter the code within 10 minutes; and
4. receive a newly rotated signed management link for bookings belonging to that verified guest identity.

The recovery response is neutral and does not reveal whether the email has bookings. OTP records store only a cryptographic hash, expiry, attempt count, resend count, request metadata, and consumption time. Verification is rate-limited by email and IP. Repeated failures temporarily block further attempts.

Supabase Auth membership is not required for guest recovery. Supabase stores the recovery records; Brevo sends the email through the existing provider-neutral SMTP client.

### 3.3 Token behavior

- Signed management links grant access only to the authorized booking or verified guest booking set.
- A recovered link rotates the previous recovery token where practical.
- Tokens and OTPs are never written to logs, analytics events, or staff-visible notes.
- Group access does not authorize unrelated bookings belonging to the same email address unless the guest has completed OTP verification for that email.

## 4. Customer Experience

### 4.1 Entry points

Every eligible upcoming appointment displays a single consistent `Manage booking` action. It replaces separate WhatsApp, Cal.com-dependent, reschedule, and cancellation actions across customer appointment cards and the next-appointment hero.

Confirmation and reminder emails include `Manage booking`. Guest emails always use the signed tokenized URL. Registered-customer links may use the authenticated route with the token as a safe fallback.

### 4.2 Management screen

The existing secure booking-status route remains valid for backward compatibility, but its visible page title and primary customer action become `Manage booking`. The management area shows:

- treatment or consultation name;
- current appointment date, time, duration, and status;
- payment and refund status;
- assigned therapist only when one is assigned;
- the exact rescheduling deadline;
- the refund rule currently applicable;
- `Choose a new time` when self-service rescheduling is eligible; and
- `Cancel appointment` when self-service cancellation is eligible.

If an action is unavailable, the interface gives a precise policy explanation rather than offering WhatsApp as the normal workflow.

### 4.3 Rescheduling interaction

Selecting `Choose a new time` opens the existing availability experience in management mode. It excludes the current appointment from its own occupancy calculation, displays only server-valid slots, and asks the customer to confirm the old and new times before submission.

On success, the screen displays the new confirmed time and notification status. On a slot race, block, or policy-boundary failure, the original booking remains unchanged and the customer chooses another slot.

### 4.4 Cancellation interaction

The confirmation dialog displays:

- whether the booking is unpaid, refund-eligible, or non-refundable;
- the reason for that determination;
- the amount expected to be refunded when known; and
- whether the refund will be immediate or pending provider confirmation.

The customer must explicitly confirm the irreversible cancellation. After cancellation, the page displays the cancellation and refund state and offers `Book again` where appropriate.

## 5. Rescheduling Data Flow

The server action performs the complete change as one protected operation:

1. authorize the member session or signed guest token;
2. load the booking and current database time;
3. verify that the booking status is eligible and the 24-hour cutoff has not passed;
4. validate the submitted slot using the existing treatment or consultation scheduling rules;
5. atomically claim the new capacity before releasing the old capacity;
6. preserve payment, patient, treatment, consultation-link, health-intake, and audit data;
7. set the new appointment and requested timestamps;
8. clear treatment therapist assignment and return it to the unassigned workflow without changing confirmed status;
9. record the old time, new time, actor type, and timestamp in an audit event; and
10. send customer and staff notifications after the database commit.

If any validation or capacity claim fails, the transaction leaves the original appointment and assignment unchanged.

## 6. Group Booking Behavior

The management screen provides `Manage group` and per-guest actions.

### 6.1 Whole-group change

- A whole-group reschedule succeeds only if valid capacity exists for every guest at their selected new slots.
- Capacity claims are atomic: either every guest moves or none moves.
- All treatment therapist assignments affected by the change are cleared.

### 6.2 Individual guest change

- A customer may reschedule or cancel one guest without changing the others.
- The selected appointment is detached from future group-management operations while retaining its original group and payment audit references.
- Remaining guests keep their slots, confirmation, and assignments.
- The detached appointment receives its own management identity/link while the original organizer retains authorized access.

### 6.3 Group refunds

- Refund eligibility is calculated per guest using that row's creation and appointment times.
- An individual eligible cancellation refunds only that guest's attributable paid amount.
- The implementation must verify Billplz and Stripe support for partial refunds on the project's configured payment path.
- If the provider cannot safely issue a partial refund, the appointment enters `refund_exception` and staff are alerted; the system must never falsely report an automatic refund.
- Cancelling the entire eligible group can use a full provider refund when it corresponds exactly to the original shared charge.

## 7. Notifications

Brevo SMTP remains the active email transport. The provider-neutral mail client is reused for:

- guest OTP codes;
- new management links;
- reschedule confirmations;
- cancellation confirmations;
- refund requested, confirmed, and failed notifications; and
- staff exception alerts mirrored through existing staff channels.

Notifications never roll back a valid database change. A failed customer email is observable to staff. Messages include the booking name, old and new times where applicable, refund state, and the secure management link. They do not include OTP values in logs or staff alerts.

## 8. Dashboard and Staff Effects

- The customer dashboard shows `Manage booking` on eligible upcoming appointments regardless of historical `calcom_booking_uid`.
- A rescheduled paid treatment immediately returns to `Needs therapist` and the red unassigned schedule column.
- Staff dashboards display reschedule audit history and refund exceptions.
- Staff retain controlled internal powers for exceptional late changes, with an explicit reason and audit event.
- Doctor and front-desk views continue to enforce assignment before treatment check-in or start.

## 9. Old-System Cleanup

Remove from active customer behavior and copy:

- WhatsApp rescheduling links and normal-flow instructions;
- `calcom_booking_uid` conditions controlling customer actions;
- the active 48-hour cancellation helper and contradictory 12-hour wording;
- `Booking request`, preferred-time, alternate-time, approval, and `once approved` wording for new instant bookings;
- group approval messages for new bookings;
- internal links opened as external Cal.com-style destinations; and
- the unused `resend` package if a final source and build scan proves it has no runtime consumer.

Historical approval fields, requested/alternate timestamps, and Cal.com database columns remain available for safe historical display and migration compatibility. They must not control the new customer-management interface.

## 10. Error Handling

- **Slot already taken:** preserve the original booking and prompt for another slot.
- **Policy cutoff crossed while the dialog was open:** reject on the server and refresh the eligibility display.
- **Invalid or expired guest token:** offer OTP recovery without exposing booking existence.
- **Invalid/expired OTP:** show a neutral error, decrement attempts, and enforce resend cooldown.
- **Refund provider unavailable:** cancel only according to the chosen provider-safe state machine, show `Refund pending/review`, and alert staff.
- **Notification failure:** keep the valid booking/refund transition and alert staff.
- **Concurrent reschedule/cancel:** use row locks or compare-and-swap guards so only one transition succeeds.
- **Group partial failure:** roll back capacity changes; preserve the original group unless the database change committed atomically.

## 11. Data and Migration Requirements

The implementation plan should prefer focused tables/events over adding unrelated columns to the main appointment row. Expected data requirements include:

- guest management OTP/recovery records;
- reschedule audit events;
- refund request/provider state and idempotency keys;
- per-appointment group detachment/management metadata where current group fields are insufficient; and
- indexes and cleanup rules for OTP expiry and refund reconciliation.

All migrations require staging verification before production approval. Existing payment-confirmation migration blockers must be resolved before automatic refunds are tested end to end.

## 12. Testing and Verification

### 12.1 Unit and integration coverage

- one-hour mistake-window boundaries;
- 24-hour reschedule cutoff boundaries;
- 48-hour automatic-refund boundaries;
- precedence of the one-hour rule for near-term appointments;
- unpaid hold cancellation and bill voiding;
- member, valid-token guest, recovered guest, invalid-token, expired-token, and unauthorized access;
- OTP hashing, expiry, consumption, retry, resend, enumeration resistance, and rate limiting;
- treatment and 30-minute consultation slot validation;
- atomic new-slot claim and old-slot preservation on failure;
- therapist assignment clearing after treatment reschedule;
- concurrent last-slot reschedules;
- whole-group atomic reschedule and individual guest detachment;
- full and partial refund success, retry, callback, ambiguous, and failure states;
- idempotent notifications and provider calls; and
- historical rows remaining readable without controlling new actions.

### 12.2 Browser verification

At mobile and desktop widths, verify:

- registered-customer dashboard to management screen;
- guest email link to management screen;
- guest `Find my booking` OTP recovery;
- treatment and consultation rescheduling;
- cancellation eligibility explanations and automatic-refund states;
- individual and whole-group management;
- cutoff-disabled states;
- staff unassigned and refund-exception queues; and
- absence of active WhatsApp, Cal.com, approval, and contradictory policy copy.

### 12.3 External verification

Use only staging/test credentials to verify:

- Brevo OTP and transaction email delivery;
- Billplz and Stripe refund APIs, idempotency, callback/reconciliation, and partial-refund support;
- database concurrency and migration behavior; and
- cleanup of dedicated test bookings and refunds.

No live migration, production deployment, or real refund occurs without explicit approval.

## 13. Completion Criteria

- Members and guests can securely manage eligible bookings without WhatsApp.
- All customer entry points lead to one consistent management experience.
- Rescheduling is race-safe and never loses the original slot on failure.
- The 1-hour, 24-hour, and 48-hour rules are enforced from server time and explained consistently.
- Eligible refunds are automatic, idempotent, and truthfully represented.
- Group members can be managed together or individually without corrupting payment history.
- Rescheduled treatments return to the unassigned workflow and cannot start without a new assignment.
- Customer-facing Cal.com, WhatsApp-reschedule, approval-era, and contradictory policy behavior is removed.
- Automated, browser, staging email, payment-provider, refund, and concurrency verification pass before release approval.
