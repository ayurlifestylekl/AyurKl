# Kerala Ayurvedic Lifestyle — Booking System Guide

A complete A–Z guide to how online booking works, and how your team manages it
from the dashboards. Website: **https://keralaayurvediclifestyle.com.my**

---

## 1. How booking works (the big picture)

There are **two types of bookings**:

### A) Direct Treatment (pay to confirm)
For treatments that don't need a consultation first.

```
Customer picks a treatment  →  chooses a preferred time  →  submits request
        →  Staff approve & assign a therapist
        →  Customer pays the full price online (FPX / online banking)
        →  Booking CONFIRMED
```

### B) Consultation-First
For treatments that require a practitioner consultation before they can be done
(e.g. children's therapies, certain conditions).

```
Customer requests a consultation  →  chooses a preferred consultation time  →  submits
        →  Staff/Doctor approve the consultation  →  consultation happens (free)
        →  Doctor "clears" the patient for the treatment
        →  Customer books the actual treatment  →  pays online  →  CONFIRMED
```

**Customers can book as a guest or while signed in** — no account is required.

### Booking policies (shown to the customer at checkout)
- **Same-gender therapist** — male patients get male therapists, female patients get
  female therapists. No mixed pairings.
- **Cancellation** — cancellations within **12 hours** of the appointment are
  **non-refundable**.
- **Rescheduling** — done via **WhatsApp**, with 12–24 hours notice.

---

## 2. Where each request appears

When a customer submits a request, it shows up in **all three** staff areas at once,
so whoever is free can act on it:

| Who | Dashboard | Can do |
|-----|-----------|--------|
| **Front Desk** | Bookings Console | Approve, assign therapist, take payment, check-in |
| **Doctor** | Doctor Portal | Approve, assign therapist, clinical notes, clear consultations |
| **Admin** | Admin → Appointments | Full oversight; approve via the Console |

Once **any one** of them approves a request, it moves forward and drops off
everyone's "new requests" list.

---

## 3. Staff logins (links, emails & passwords)

> Keep these private. Each person signs in at their own link below.

### 🛎️ Front Desk
- **Login link:** https://keralaayurvediclifestyle.com.my/staff/login
- **Email:** `frontdesk@keralaayurvediclifestyle.com.my`
- **Password:** `@Frontdesk2026`
- **Lands on:** the **Bookings Console**

### 🩺 Doctor
- **Login link:** https://keralaayurvediclifestyle.com.my/doctor/login
- **Email:** `kals.admin1@keralaayurvediclifestyle.com.my`
- **Password:** `@Doctor2026`
- **Lands on:** the **Doctor Portal**

### 🛠️ Admin (full back-office)
- **Login link:** https://keralaayurvediclifestyle.com.my/admin/login
- **Email:** _[your admin account email]_
- **Password:** _[your admin account password]_
- **Lands on:** the **Admin dashboard** (appointments, products, customers, etc.)

> Tip: to use two dashboards at once (e.g. front desk + doctor), open them in
> separate browsers or one normal + one incognito window, so the sessions don't
> overwrite each other. Use **Sign out** (top-right) when done.

---

## 4. Front Desk — Bookings Console

**Link:** https://keralaayurvediclifestyle.com.my/console

A burgundy sidebar on the left with these sections:

- **Overview** — at-a-glance counts (new requests, awaiting payment, today's
  appointments, therapists free now) + today's schedule + anything needing attention.
- **Today** — today's appointments by time, with one-tap **Check in → Start → Complete**
  buttons and **WhatsApp / Call** links for each customer.
- **New requests** — incoming booking & consultation requests waiting for approval
  (shows a count badge).
- **Awaiting payment** — approved bookings waiting for the customer to pay.
- **Confirmed** — paid & confirmed appointments.
- **Therapists** — live board of which therapist is free or busy right now, and when
  each frees up.
- **All** — every booking.
- **+ New booking** — create a walk-in / phone booking yourself.
- **Search** (top of the page) — find any customer instantly by name or phone.

### Approving a request (front desk or doctor)
1. Open the request (click it).
2. Pick a **therapist** from the dropdown — only therapists of the **matching gender**
   are shown.
3. Set the **confirmed date & time** (and room, optional).
4. Click **Approve**.
   - Direct treatment → moves to **Awaiting payment**; the customer gets a pay link.
   - Consultation → **Confirmed** (free).

If the chosen therapist is already busy at that time (their session + 30-min buffer),
the system **blocks it** and tells you when they're free — pick another therapist or time.

### Other actions on a request
- **Reject request** — declines it but keeps the record; the customer is notified.
- **Delete** — permanently removes a record (spam / test / duplicate).

---

## 5. Doctor — Doctor Portal

**Link:** https://keralaayurvediclifestyle.com.my/doctor

Same burgundy sidebar, with the doctor's tools:

- **Overview** — today's patients, new requests, consultations to clear, total patients,
  plus today's schedule and what needs attention.
- **Schedule** — today's and upcoming booked patients.
- **Requests** — new booking/consultation requests the doctor can approve & assign
  (count badge).
- **Calendar** — all upcoming appointments grouped by day, with time, patient,
  therapist and room.
- **Patients** — a searchable directory of everyone who has booked, with visit count
  and last visit. Open a patient to see their health details and history.
- **Consultations** — consultations waiting for the doctor's clearance before treatment
  (count badge).

### The doctor sees, for each booked patient:
1. **Patient's name**
2. **Previous health information** (from their booking intake / account)
3. **Contact number**
…plus clinical notes the doctor can add.

### Clearing a consultation for treatment
After a consultation, open it → record the outcome → **clear the patient**. This unlocks
the treatment so the customer can book and pay for it.

---

## 6. Admin — Appointments

**Link:** https://keralaayurvediclifestyle.com.my/admin/appointments

- Opens on a **Requests** tab (count badge) showing everything awaiting action.
- Other tabs: Today, Upcoming, Past, Cancelled, No-show, All.
- **"Approve →"** on a request opens the Console's approve & assign screen.
- The admin also has the full back-office (products, customers, orders, etc.).

---

## 7. Therapist assignment

- The doctor/front desk assigns a therapist **by name** from a dropdown.
- Only therapists of the **same gender** as the patient are shown.
- Each therapist works a session of up to **1.5 hours**, followed by a **30-minute
  buffer** before their next customer. The system **prevents double-booking**.

Current therapist roster (edit anytime in the system):

| Code | Name | Gender |
|------|------|--------|
| NT02 | Nithin | Male |
| DP03 | Deepak | Male |
| BN08 | Bintu | Female |
| SM05 | Sreeja Mol | Female |
| CR08 | Seeta | Female |
| AS12 | Asha | Female |

---

## 8. Payments

- Treatments are **paid in full online** (Billplz — FPX / online banking) **after**
  the booking is approved.
- The customer sees a **Pay** button on their booking page, and a payment link by email.
- Once payment succeeds, the booking automatically becomes **Confirmed**.
- Consultations are **free**.
- Refunds (for eligible cancellations more than 12 hours out) are processed manually
  from the Billplz dashboard.

---

## 9. Daily quick reference

| Task | Where |
|------|-------|
| See today's appointments | Console → **Today** / Doctor → **Schedule** |
| Approve a new request | Console/Doctor → **New requests / Requests** → open → Approve |
| Check a customer in on arrival | Console → **Today** → **Check in** |
| Find a customer who called | Console → **Search** (name or phone) |
| See which therapists are free | Console → **Therapists** |
| Add a walk-in booking | Console → **+ New booking** |
| Review a patient's health info | Doctor → **Patients** → open patient |
| Clear a consultation for treatment | Doctor → **Consultations** → open → clear |

---

*Prepared for Kerala Ayurvedic Lifestyle · Brickfields, Kuala Lumpur.*
