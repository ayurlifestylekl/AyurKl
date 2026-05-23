# Kerala Ayurvedic — Admin Command Center Master Inventory

> **Owner:** Sanjay Gunabalan / Aurexis Solution
> **Client:** Kerala Ayurvedic Lifestyle Sdn Bhd
> **Date:** 2026-05-19
> **Purpose:** A-to-Z feature inventory of the custom-built admin panel and how it connects to the customer + sales agent dashboards. Use as the single reference doc for what gets built into the admin Command Center, in what order, and how data flows between portals.
>
> **How to import to Notion:** In Notion, open the target page → top-right `⋯` menu → **Import** → **Text & Markdown** → upload this file. Headings become page headings, tables become Notion tables, and every `- [ ]` checkbox becomes a Notion to-do. Alternatively, paste the raw markdown directly into a Notion page — it auto-converts.

---

## Table of Contents

- [Overview](#overview)
- [Section A — Core Commerce Modules](#section-a--core-commerce-modules)
  - [1. Orders](#1-orders)
  - [2. Products](#2-products)
  - [3. Inventory](#3-inventory)
  - [4. Shipping & Fulfilment](#4-shipping--fulfilment)
  - [5. Finance](#5-finance)
- [Section B — Customer-Facing Modules](#section-b--customer-facing-modules)
  - [6. Customers (CRM)](#6-customers-crm)
  - [7. Appointments / Clinic](#7-appointments--clinic)
  - [8. Messages / Support](#8-messages--support)
  - [9. Marketing & Vouchers ★](#9-marketing--vouchers-)
  - [10. Reviews & Feedback](#10-reviews--feedback)
  - [11. Customer Health Records (Vaidya-only)](#11-customer-health-records-vaidya-only)
- [Section C — Platform Modules](#section-c--platform-modules)
  - [12. Sales Agents / Partners](#12-sales-agents--partners)
  - [13. Content & CMS (Sanity bridge)](#13-content--cms-sanity-bridge)
  - [14. Reports & Analytics](#14-reports--analytics)
  - [15. Settings](#15-settings)
  - [16. Staff & Roles (RBAC)](#16-staff--roles-rbac)
  - [17. Audit & System Health](#17-audit--system-health)
- [Section D — Cross-Hub Connections](#section-d--cross-hub-connections)
  - [D1. Admin ↔ Customer Dashboard](#d1-admin--customer-dashboard)
  - [D2. Admin ↔ Sales Agent Dashboard](#d2-admin--sales-agent-dashboard)
  - [D3. Sales Agent ↔ Customer (indirect)](#d3-sales-agent--customer-indirect)
  - [D4. The "single source of truth" rule](#d4-the-single-source-of-truth-rule)
- [Section E — Build Order](#section-e--build-order)
- [Glossary](#glossary)

---

## Overview

Kerala Ayurvedic Lifestyle is a custom-built Ayurvedic e-commerce + clinic platform. No WooCommerce, no Shopify, no off-the-shelf e-commerce. Every admin feature listed below has to be built into the Command Center.

**Three portals share one Supabase database:**

- **Customer Portal** (`/account/*`) — orders, appointments, support, voucher wallet, wishlist, profile
- **Sales Agent Portal** (`/agent/*`) — referral links, attributed orders, commissions, payouts, marketing assets
- **Admin Command Center** (`/admin/*`) — runs everything

The architectural rule: **no portal talks to another portal directly. All cross-portal communication goes through Supabase tables, realtime subscriptions, and Resend transactional email.** See Section D.

**Status snapshot at time of writing:**

- ✅ Auth, role-gating middleware, customer portal Phases 1–2 shipped
- ✅ Admin login + Admin Overview dashboard (KPIs, charts, insights, recent activity)
- ⏳ Every other admin module — to be built next, in the order listed in Section E

---

## Section A — Core Commerce Modules

### 1. Orders

The most-clicked module. Without this, the clinic cannot fulfil anything.

**List + filters**
- [ ] All-orders list with infinite scroll / pagination
- [ ] Filter by status (pending / paid / processing / packing / shipped / delivered / completed / cancelled / refunded / failed)
- [ ] Filter by payment status (pending / paid / refunded / failed)
- [ ] Filter by date range
- [ ] Filter by customer
- [ ] Filter by channel (web / manual / walk-in / phone)
- [ ] Filter by has-tracking-number
- [ ] Search by order ID, customer name, email, phone

**Order detail page**
- [ ] Line items list (product, qty, price, subtotal)
- [ ] Customer mini-card (name, email, phone, member tier)
- [ ] Billing + shipping addresses
- [ ] Payment trail (every transaction attempt, gateway response)
- [ ] Fulfilment timeline (status history with timestamps)
- [ ] Practitioner note (visible to customer)
- [ ] Internal admin notes (private staff-only)
- [ ] Full event audit log

**Workflow actions**
- [ ] Move order status forward
- [ ] Cancel order (with reason, audited)
- [ ] Issue full refund
- [ ] Issue partial refund (per line item or custom amount)
- [ ] Re-attempt failed payment
- [ ] Mark COD received
- [ ] Mark bank transfer received (with reference number)
- [ ] Resend order confirmation email
- [ ] Resend invoice

**Print artefacts (the "postage" features you flagged)**
- [ ] Print packing slip (PDF)
- [ ] Print tax invoice (SST-compliant PDF)
- [ ] Print shipping label (Pos Laju / J&T / Ninja Van format)
- [ ] Print picking list (warehouse worker's list)
- [ ] Batch print N orders' labels + slips in one PDF

**Tracking**
- [ ] Carrier dropdown selection
- [ ] Tracking number entry
- [ ] Auto-fetch tracking URL by carrier
- [ ] Customer auto-notified by email + bell when tracking added

**Bulk actions**
- [ ] Mark paid (bulk)
- [ ] Mark shipped (bulk)
- [ ] Export to CSV
- [ ] Batch print labels
- [ ] Bulk cancel (with reason)

**Manual order entry**
- [ ] Create order for walk-in / phone customer
- [ ] Add products from catalog
- [ ] Apply manual discount
- [ ] Assign to existing customer or create new on the fly
- [ ] Choose payment method (cash, bank transfer, card-on-file, COD)
- [ ] Optionally attribute to a sales agent

### 2. Products

**Catalogue**
- [ ] Product list with filters (active / draft / archived / low stock / out of stock / by category)
- [ ] Quick search by name, SKU, slug
- [ ] Sort by price / stock / sales velocity / created date

**Add / edit product**
- [ ] Name, SKU, slug
- [ ] Multi-image upload with reorder
- [ ] Rich-text long description
- [ ] Short description
- [ ] Ingredients list
- [ ] Dosage instructions
- [ ] Contraindications (Ayurvedic-specific)
- [ ] Certifications (organic, KKM, GMP)
- [ ] Ayurvedic indications (which dosha / condition)
- [ ] Regular price (RM)
- [ ] Sale price + sale start/end schedule
- [ ] Member-tier price
- [ ] Stock quantity
- [ ] Low-stock threshold (per-product override)
- [ ] Allow-backorder toggle
- [ ] Variants (size, weight, pack count)
- [ ] Bundle composition (kits = multiple products sold as one)
- [ ] Categories (multi-select)
- [ ] Tags (multi-select)
- [ ] Featured / trending toggles
- [ ] SEO meta title, meta description, OG image, canonical URL

**Sanity sync**
- [ ] Long-form content body lives in Sanity
- [ ] Commerce fields (price, stock, SKU) live in Supabase
- [ ] Admin shows merged view
- [ ] Open-in-Sanity-Studio deep link

**Bulk operations**
- [ ] CSV import (with validation)
- [ ] CSV export
- [ ] Bulk archive
- [ ] Bulk price update (e.g. +5% across category)

### 3. Inventory

**Stock view**
- [ ] Stock levels per SKU (live)
- [ ] Per-variant stock if variants exist
- [ ] Sort by stock level / velocity / value

**Stock adjustments**
- [ ] Receive stock (purchase order intake with cost-price record)
- [ ] Write-off stock (damaged / expired, with reason)
- [ ] Re-count adjustment (physical count vs system)

**Stock movement log**
- [ ] Immutable ledger: every change with who / when / why / delta
- [ ] Filter by product, by date, by movement type

**Alerts**
- [ ] Per-product low-stock threshold
- [ ] Global default threshold
- [ ] Notification to admin when product crosses below threshold

**Forecasting**
- [ ] Sales velocity per SKU (last 7 / 30 / 90 days)
- [ ] Re-order suggestion ("Will run out in ~12 days at current rate")
- [ ] Dead stock report (no sales in 90+ days)

**Stocktake mode**
- [ ] Mobile-friendly count entry
- [ ] Reconcile counted vs system, with variance report
- [ ] Generate write-off / receive entries to true up

**Other**
- [ ] Barcode generator (printable labels per SKU)
- [ ] Expiry-date tracking (critical for Ayurvedic herbs)
- [ ] Expiring-soon alerts

### 4. Shipping & Fulfilment

**Configuration**
- [ ] Shipping zones (West Malaysia, East Malaysia, Singapore, international tiers)
- [ ] Rate tables (flat / weight-based / order-value-based)
- [ ] Free-shipping threshold
- [ ] Carrier accounts (Pos Laju, J&T, Ninja Van, DHL — API keys or manual)

**Operations**
- [ ] Pickup-from-clinic toggle (Brickfields walk-in)
- [ ] Address validation
- [ ] Batch label printing (select N orders → one PDF)
- [ ] COD reconciliation log

**Returns / RMA**
- [ ] Customer requests return
- [ ] Admin approves / rejects with reason
- [ ] Track received-back status
- [ ] Refund linked to return

### 5. Finance

**Payments**
- [ ] Payments log (Billplz, COD, bank transfer, FPX, cards)
- [ ] Refunds log
- [ ] Daily revenue summary
- [ ] Outstanding balances (unpaid orders aged)

**Reconciliation**
- [ ] Billplz settlement file import + cross-check
- [ ] Variance report (system says paid vs gateway says paid)

**Tax**
- [ ] SST tax tracker (6% service / 5-10% sales)
- [ ] Tax-invoice numbering sequence (legal requirement)
- [ ] Quarterly SST return report

**Liabilities**
- [ ] Commission liability ledger (total owed to sales agents at any moment)
- [ ] Refund liability (pending refunds yet to be paid out)

**Manual entries**
- [ ] Record offline payment (cheque, cash, bank-in slip)
- [ ] Generate manual invoice

---

## Section B — Customer-Facing Modules

### 6. Customers (CRM)

**List + filters**
- [ ] All / new (<30d) / VIP (high LTV) / at-risk (no order >90d) / blocked
- [ ] Filter by dosha
- [ ] Filter by tag / segment
- [ ] Search by name, email, phone, order ID, member number

**Customer detail page**
- [ ] Identity (name, email, phone, DOB, gender, language, member since)
- [ ] Wellness intake (dosha, allergies, medications, conditions, prakriti result)
- [ ] All saved addresses
- [ ] Order history + LTV + AOV + last-order date
- [ ] Appointment history + clinical notes (vaidya-only RLS)
- [ ] Support ticket history
- [ ] Vouchers in wallet
- [ ] Wishlist items
- [ ] Internal admin notes (timestamped, private)
- [ ] Communication log (every email / SMS / WhatsApp sent)

**Actions on a customer**
- [ ] Send password reset
- [ ] Push voucher to wallet (see Module 9)
- [ ] Block / unblock
- [ ] Add to segment / tag
- [ ] Assign internal owner (which staff handles them)
- [ ] Send one-off manual email
- [ ] View-as / impersonate (debug their session, audited)
- [ ] Export their PDPA data
- [ ] Hard-delete account (after 30-day cool-off)
- [ ] Create manual order for them
- [ ] Book appointment on their behalf

**Bulk**
- [ ] Export to CSV
- [ ] Bulk tag
- [ ] Bulk voucher push
- [ ] Bulk email campaign

**Birthday list**
- [ ] This-week + this-month view
- [ ] One-click bulk push birthday voucher

### 7. Appointments / Clinic

**Views**
- [ ] Day calendar
- [ ] Week calendar
- [ ] List with filters (today / upcoming / past / cancelled / no-show)

**Appointment detail**
- [ ] Customer card + wellness snapshot
- [ ] Treatment, mode (in-person / virtual / home), room, vaidya
- [ ] Duration, price, status
- [ ] Pre-visit intake form responses
- [ ] Attached files (lab reports, prescriptions, before/after photos)
- [ ] Linked order (if products prescribed during consult)

**Status workflow**
- [ ] pending payment → confirmed → checked-in → in-progress → completed
- [ ] Plus: rescheduled, cancelled, no-show

**Actions**
- [ ] Reschedule
- [ ] Cancel (with reason)
- [ ] Mark completed
- [ ] Mark no-show
- [ ] Mark checked-in
- [ ] Send reminder manually (in addition to auto reminders)
- [ ] Vaidya consultation notes (clinical record, vaidya-only)
- [ ] Prescribe products → spawns linked order
- [ ] Issue receipt
- [ ] Convert into follow-up booking

**Treatment catalogue**
- [ ] Name, duration, price, prep instructions, contraindications, after-care
- [ ] Gender rule (men-to-men / ladies-to-ladies / either)
- [ ] Active / draft / archived

**Vaidya availability**
- [ ] Block off unavailability (holidays, lunch breaks, leave)
- [ ] Flows to Cal.com via API
- [ ] Override Cal.com for emergencies

**Sync**
- [ ] Cal.com webhook log (last received, errors)
- [ ] Manual resync trigger

**Walk-in mode**
- [ ] Staff creates appointment without Cal.com (in-person walk-in)

### 8. Messages / Support

**Inbox**
- [ ] Unread
- [ ] Mine (assigned to me)
- [ ] Assigned to team
- [ ] All open
- [ ] Closed
- [ ] By topic / category

**Ticket detail**
- [ ] Thread (customer + staff messages)
- [ ] Customer mini-card with link to CRM
- [ ] Related orders + appointments
- [ ] Internal-only notes (staff-side panel)

**Reply features**
- [ ] Quick replies / canned responses library
- [ ] Attach files
- [ ] Attach product links
- [ ] Attach appointment booking links
- [ ] Convert reply → appointment, → cart, → voucher push

**Management**
- [ ] Assign to staff
- [ ] Escalate
- [ ] Change topic / category
- [ ] SLA tracker (first-response time, resolution time)
- [ ] SLA breach alerts

**Conversions**
- [ ] Convert ticket → appointment
- [ ] Convert ticket → manual order
- [ ] Convert ticket → voucher push

**Bulk**
- [ ] Bulk close stale tickets

### 9. Marketing & Vouchers ★

This is the module that touches the customer dashboard most directly. Two distinct concepts inside.

**9A. Promo Codes (public, code-based)**

- [ ] CRUD on promo codes
- [ ] Discount type: % off, RM off, free shipping, free gift, BOGO
- [ ] Scope: cart-wide, specific product, specific category, specific customer segment
- [ ] Start date, end date
- [ ] Max uses total, max uses per customer
- [ ] Stackable toggle
- [ ] Minimum spend
- [ ] Code generator / suggestion
- [ ] Usage report (redemption count, revenue impact, conversion rate)

**9B. Voucher Push** ★ (admin → individual customer's wallet)

Direct push of a voucher into one or many customers' wallets, bypassing the public code system.

- [ ] From customer detail page: "Push voucher" button
- [ ] From customers list: select N → bulk push
- [ ] From a saved segment: push to whole segment
- [ ] Pick template: existing promo code OR custom one-off
- [ ] Voucher types: % off, RM off, free shipping, free product
- [ ] Optional message ("Welcome gift", "Birthday voucher", "Thanks for the review")
- [ ] Set expiry (default 14 days)
- [ ] Preview before send

**On submit, the system must:**

1. Insert row into `customer_promos` for each target customer
2. Insert row into `notifications` (gold dot on bell)
3. Send Resend transactional email ("You've got a voucher!")
4. Log to communication history
5. Track redemption per push (which pushes converted)

**Trigger options:**

- [ ] Manual one-off (admin clicks button)
- [ ] Scheduled (push at future date)
- [ ] Automated rule (birthday auto-push, signup auto-push, post-purchase auto-push) — Phase 3

**9C. Email Campaigns (broadcasts)**

- [ ] Compose: subject, preview text, rich body, CTA button
- [ ] Template builder with saved templates
- [ ] Audience picker (all / VIPs / dosha-segment / lapsed / custom)
- [ ] Schedule (send now or later)
- [ ] Preview, send-test
- [ ] Track opens, clicks, unsubscribes (Resend events)

**9D. Site Banner / Announcement bar**

- [ ] Headline + CTA + link
- [ ] Schedule start + end
- [ ] Audience (all / signed-in only / segment)
- [ ] Show on which pages (storefront / cart / product / all)
- [ ] Style (info / promo / urgent)

**9E. Automation rules (Phase 3 territory)**

- [ ] Birthday voucher auto-push
- [ ] Abandoned-cart email + voucher
- [ ] Post-purchase review request
- [ ] 30-day re-engagement sequence
- [ ] Welcome series for new signups
- [ ] Win-back for lapsed customers

### 10. Reviews & Feedback

- [ ] Moderation queue (new → approved / hidden / spam)
- [ ] Product reviews (rating, title, body, photo, verified-purchaser badge)
- [ ] Clinic/service reviews (post-appointment NPS)
- [ ] Reply publicly to a review
- [ ] Featured testimonials picker (which to show on homepage)
- [ ] Star-rating analytics (avg per product, trend)
- [ ] Review request emails (auto after order delivered / appointment completed)

### 11. Customer Health Records (Vaidya-only, PDPA-sensitive)

Separate from CRM. Access restricted to `vaidya` role even within admin staff.

- [ ] Patient list (only consented customers)
- [ ] Per-customer clinical chart
- [ ] Consultation notes in SOAP format (Subjective, Objective, Assessment, Plan)
- [ ] Prescription log (product, dose, duration)
- [ ] Vital signs trail
- [ ] Lab/test results upload
- [ ] Pulse diagnosis notes (Nadi pariksha)
- [ ] Follow-up reminders
- [ ] Audit log of who viewed which record
- [ ] Export single patient chart (PDF, for handover or patient request)
- [ ] Patient consent revocation flow

---

## Section C — Platform Modules

### 12. Sales Agents / Partners

**List + filters**
- [ ] All / active / pending invite / suspended
- [ ] By commission type (affiliate / reseller)
- [ ] By tier (top / mid / dormant)

**Issue invite**
- [ ] Single invite (already built, extend with bulk + CSV)
- [ ] Bulk invite via CSV
- [ ] Re-send invite

**Agent detail page**
- [ ] Profile, referral code, commission rate + type, status
- [ ] Earnings totals (total earned, paid out, pending, lifetime)
- [ ] Performance (orders attributed, conversion rate, AOV of referrals, top product)
- [ ] Referred customers list
- [ ] Attributed orders list
- [ ] Payout history
- [ ] Internal notes
- [ ] Downloaded marketing assets

**Actions**
- [ ] Adjust commission rate (with reason, audited)
- [ ] Change commission type
- [ ] Suspend / re-activate
- [ ] Reset referral code
- [ ] Manually attribute an order
- [ ] Approve payout
- [ ] Send direct message
- [ ] Revoke account

**Payouts module**
- [ ] Outstanding commission queue (across all agents)
- [ ] Bulk select → mark paid
- [ ] Generate bank-transfer batch CSV (for client's bank portal)
- [ ] Per-payout detail (which orders, deductions for reversals)
- [ ] Payout history ledger
- [ ] Minimum payout threshold setting

**Reports**
- [ ] Leaderboard (this month / quarter / year)
- [ ] Performance export

**Marketing materials library**
- [ ] Upload banners, social posts, sales scripts
- [ ] Categorise by use case
- [ ] Track downloads per agent

### 13. Content & CMS (Sanity bridge)

- [ ] Embedded Sanity Studio link (already at `/studio`)
- [ ] Blog posts list with deep-links to Sanity edit
- [ ] FAQs editor
- [ ] Static pages (about, contact, partners, FAQ, T&C, privacy, return policy, shipping policy)
- [ ] Homepage hero + section content
- [ ] Testimonials moderation
- [ ] Dosha quiz content editor
- [ ] Treatment description content
- [ ] Site search index status / re-build
- [ ] Media library (images, downloadable PDFs, brochures)

### 14. Reports & Analytics

**Sales**
- [ ] Today / this week / this month / YTD revenue
- [ ] Revenue by product / category / channel / payment method / agent
- [ ] AOV trend
- [ ] Top customers (LTV)

**Customers**
- [ ] New signups over time
- [ ] Active / churned cohorts
- [ ] Dosha distribution
- [ ] Top spenders

**Conversion**
- [ ] Visits → cart → checkout → paid funnel (needs basic event tracking)
- [ ] Drop-off points

**Operations**
- [ ] Refund / cancellation rate
- [ ] Appointment metrics (booked, completed, no-show, vaidya utilization, popular treatments)
- [ ] Inventory turnover, dead stock, fast-movers

**Marketing**
- [ ] Promo code usage + revenue impact
- [ ] Voucher push redemption rate
- [ ] Campaign opens / clicks / unsubscribes

**Tax**
- [ ] SST quarterly report (for filing)

**General**
- [ ] Custom date range + comparison vs prior period
- [ ] Export CSV + PDF
- [ ] Saved reports (named, re-runnable)

### 15. Settings

**Business info**
- [ ] Legal name (Kerala Ayurvedic Lifestyle Sdn Bhd)
- [ ] Reg no (847466D), SSM number
- [ ] Address, contact, hours
- [ ] Store hours (Mon-Sun 9am-9pm)
- [ ] Clinic hours (Tue-Sun 9:30am-7:30pm)
- [ ] Closure days (Deepawali, plus admin-added)

**Policies (rich-text editor)**
- [ ] Return policy
- [ ] Refund policy
- [ ] Privacy policy
- [ ] T&C
- [ ] Shipping policy
- [ ] PDPA notice

**Tax**
- [ ] SST registration toggle, registration number
- [ ] Rate per category
- [ ] Tax-inclusive vs exclusive pricing

**Payment methods**
- [ ] Billplz on/off
- [ ] COD on/off
- [ ] Bank transfer (account details for invoice)
- [ ] FPX
- [ ] Cards

**Shipping**
- [ ] Zones + rates editor
- [ ] Free-shipping threshold
- [ ] Carrier API keys

**Email + SMS templates**
- [ ] Order confirmation
- [ ] Order shipped
- [ ] Order delivered
- [ ] Refund issued
- [ ] Password reset
- [ ] Voucher push
- [ ] Appointment confirmation
- [ ] Appointment reminder (24h, 2h)
- [ ] Appointment follow-up
- [ ] Welcome
- [ ] Birthday
- [ ] All editable with `{{variables}}` and live preview

**Notification preferences**
- [ ] Per-event matrix: bell / email / SMS / WhatsApp

**Branding**
- [ ] Logo, favicon, OG image
- [ ] Primary / accent colors
- [ ] Typography

**Locale**
- [ ] Currency (RM)
- [ ] Timezone (Asia/Kuala_Lumpur)
- [ ] Date format
- [ ] Language (English + Bahasa later)

**Feature flags**
- [ ] Phone OTP toggle
- [ ] Apple Sign-in toggle
- [ ] 2FA toggle
- [ ] Wishlist toggle
- [ ] Maintenance mode toggle

**Cookie banner**
- [ ] Enable / disable
- [ ] PDPA notice content

**Integrations panel** (connection status + re-auth buttons)
- [ ] Cal.com
- [ ] Resend
- [ ] Billplz
- [ ] Sanity
- [ ] Supabase

### 16. Staff & Roles (RBAC)

**Staff list**
- [ ] Roles: super_admin, admin, vaidya, support, packer, finance
- [ ] Name, email, phone, role, status
- [ ] Vaidya licence number (if applicable)

**Add / edit staff**
- [ ] Invite via email link to set password
- [ ] Suspend / re-activate
- [ ] Change role
- [ ] Force-logout sessions

**Permissions matrix**
- [ ] Per-role read/write/approve scopes
- [ ] Packer sees only orders awaiting fulfilment + can print labels
- [ ] Vaidya sees clinical records + appointments only
- [ ] Finance sees payments + payouts + reports
- [ ] Support sees tickets + customers (no finance)

**Activity per staff**
- [ ] Activity log (every action with timestamp + IP)
- [ ] Login history (when, where, device)

**Security**
- [ ] 2FA enforcement per role (mandatory for admin + vaidya)
- [ ] Session management — admin can force-logout any staff
- [ ] Password policy

### 17. Audit & System Health

**Audit log**
- [ ] Every meaningful action (who / what / when / before → after)
- [ ] Filter by actor, entity, date

**Webhook log**
- [ ] Cal.com bookings — status + payload + retry button
- [ ] Billplz payments
- [ ] Resend delivery events

**Email / SMS delivery log**
- [ ] Bounces, opens, clicks, complaints
- [ ] Per-customer history

**Error log**
- [ ] Server errors with stack trace
- [ ] Failed background jobs

**System status**
- [ ] Supabase, Sanity, Cal.com, Billplz, Resend — green/red dots + last check time

**Background jobs**
- [ ] Scheduled tasks (birthday push, abandoned cart, 30-day cleanup)
- [ ] Status + last run + manual trigger

**Database health**
- [ ] Row counts per major table
- [ ] Storage usage
- [ ] Slow query log (Supabase)

---

## Section D — Cross-Hub Connections

The architectural answer to *"What is the connection between the sales dashboard and the admin dashboard, and what is the connection between the customer dashboard and the admin dashboard?"*

### D1. Admin ↔ Customer Dashboard

Every admin action that affects a customer is a write to a shared Supabase table. The customer portal subscribes via realtime + reads via RLS scoped to `auth.uid()`. Notifications fan out via the `notifications` table (bell) and Resend (email).

**Twelve concrete connections:**

| # | Admin action | Tables touched | What customer sees | Notification |
|---|---|---|---|---|
| 1 | Update order status (pending → processing → shipped → delivered) | `orders.fulfillment_status` + `order_events` log | `/account/orders/{id}` timeline progresses | Bell + email per state |
| 2 | Add tracking number + carrier | `orders.tracking_number, tracking_url, carrier` | Tracking widget appears with "Track your parcel" button | Bell + "Your order has shipped" email |
| 3 | Add practitioner note to an order | `orders.practitioner_note` | Gold chip appears on order detail | Bell ("Vaidya left a note") |
| 4 | Cancel order | `orders.status='cancelled', cancelled_at` | Order shows "Cancelled" badge | Bell + email |
| 5 | Issue refund | `refunds` insert + `orders.payment_status='refunded'` | Refund line in payment trail | Bell + email |
| 6 | **Push voucher to customer** ★ | `customer_promos` insert + `notifications` insert | Voucher in `/account/promos` wallet, applies at checkout | Bell + Resend email |
| 7 | Reply to support ticket | `support_messages` insert + `support_tickets.last_message_at` | New message in `/account/messages/{ticketId}` thread | Bell + (optional) email |
| 8 | Reschedule appointment | `appointments.starts_at, rescheduled_from` | `/account/appointments/{id}` shows new time | Bell + email |
| 9 | Mark appointment completed | `appointments.status='completed', completed_at` | Aftercare panel opens, "Leave a review" CTA | Bell |
| 10 | Vaidya posts consultation note | `consultation_notes` (vaidya-only RLS) | Customer sees high-level summary only | Bell ("Your consultation summary is ready") |
| 11 | Send broadcast email campaign | `email_campaigns` + `email_deliveries` | Email lands in inbox | Email only |
| 12 | Manually create customer / order on their behalf | `users` insert + `orders` insert with `channel='manual'` | Customer can sign in, sees the order | Welcome email with password-setup link |

### D2. Admin ↔ Sales Agent Dashboard

**Eight concrete connections:**

| # | Admin action | Tables touched | What agent sees |
|---|---|---|---|
| 1 | Issue invite | `agent_invites` insert | Agent receives link, signs up, becomes active |
| 2 | Adjust commission rate | `sales_agents.commission_rate` + audit row | Earnings calc updates from next attributed order |
| 3 | Suspend agent | `sales_agents.status='suspended'` | Middleware redirects them away from `/agent/*` |
| 4 | Manually attribute an order | `orders.referred_by_agent_id` + `agent_commissions` row | New row in agent's "Attributed orders", pending-payout total increases |
| 5 | Reverse commission (refunded/cancelled order) | `agent_commissions.status='reversed'` | Pending-payout adjusts down, "Reversed" line item appears |
| 6 | Approve payout | `agent_payouts` insert + `agent_commissions.status='paid'` | "Paid" tag, payout amount in history with date + reference |
| 7 | Upload marketing asset | `agent_marketing_assets` insert (file in Supabase Storage) | Agent's "Materials" section gets new downloadable |
| 8 | Send agent direct message | `agent_messages` (new) | Message in agent's inbox |

**Commission data flow:**

1. Customer signs up with `?ref=PRIYA01` → `users.referred_by_agent_id = PRIYA01`
2. Customer places order → `orders.referred_by_agent_id` inherited
3. Order moves to `payment_status='paid'` → trigger inserts `agent_commissions` row (`order_id, agent_id, base_amount, rate, computed_amount, status='pending'`)
4. If order later refunded → trigger flips `agent_commissions.status='reversed'`
5. Admin's payout module groups `status='pending'` rows per agent → admin marks paid → inserts `agent_payouts` row → flips commissions to `status='paid'`
6. Agent dashboard reads from commissions + payouts + attributed orders to show: pending, paid, lifetime

### D3. Sales Agent ↔ Customer (indirect)

Agents do **not** directly interact with customers. They only generate referrals.

- Agent shares their link → customer signs up + buys → admin sees attribution → agent sees commission
- Agents never see customer PII (PDPA + business protection); they see anonymised counts ("3 customers referred this month") or first-name + masked email at most

### D4. The "single source of truth" rule

The whole architecture works because **no portal talks to another portal directly**. Every action goes:

> Portal A UI → server action → Supabase write → realtime + RLS → Portal B UI reads
>
> ↘ notifications insert + Resend email → Portal B user notified

This is why we don't need a message bus or internal webhooks between portals — **Supabase is the bus**. The only external webhooks are inbound (Cal.com bookings, Billplz payments) which already follow a pattern.

**Implications:**

- Adding a new connection = adding a column / table + RLS policy + (optionally) a notification insert
- No "API" between portals — they share data, not endpoints
- Real-time updates work for free via Supabase subscriptions
- RLS handles security — admin queries use `is_admin()` to bypass row scope; customer queries are auto-scoped to `auth.uid()`

---

## Section E — Build Order

Eight sub-projects, sized to ship in 2–4 days each, sequenced so each unlocks the next.

| # | Sub-project | Why now | Unlocks | Est. effort | Critical for launch? |
|---|---|---|---|---|---|
| 1 | **Orders** | Highest-value dashboard link. Without it, the clinic can't fulfil anything. Includes packing slip + label + tracking. | End-to-end revenue flow | ~4 days | ✅ Yes |
| 2 | **Products + Inventory** | Needed before client can list real SKUs. Inventory shares the data model. | Storefront sells real items | ~3 days | ✅ Yes |
| 3 | **Customers (CRM) + Voucher Push** ★ | CRM unlocks customer detail page where voucher-push button lives. | The push-voucher workflow you asked for | ~3 days | ✅ Yes |
| 4 | **Appointments / Clinic** | Clinic side of business — bookings, vaidya notes, treatment catalog. | Vaidya runs day-to-day from the system | ~3 days | ✅ Yes |
| 5 | **Messages / Support inbox** | Plugs into Phase 2 tickets that exist. | Staff stops switching to email | ~2 days | ⚠️ Soft |
| 6 | **Sales Agents (full module)** | Adds payout + commissions + agent detail + performance. Wires agent dashboard properly. | Agent portal becomes real | ~3 days | ⚠️ Soft |
| 7 | **Marketing (full)** | Promo CRUD + campaigns + banners + automation rules. | Client runs own promotions | ~3 days | ⚠️ Soft |
| 8 | **Reports + Finance + Settings + RBAC + Audit** | Admin-only utilities. Less critical for day-1 but needed before handover. | Client self-sufficient at handover | ~4 days | ⚠️ Soft |

**Total:** ~25 working days of admin build.

Sub-projects 1–4 are critical-path for go-live. 5–8 can ship post-launch using SQL fallbacks during the first week of live operations.

**Notes on slicing:**
- Health Records (Module 11) is a slice of Sub-project 4 (Appointments), gated by the `vaidya` role
- RBAC (Module 16) is a slice of Sub-project 8 — until then, everyone with `role='admin'` sees everything
- Each sub-project gets its own design doc + implementation plan + verification checklist (same pattern as the existing Admin Overview)

---

## Glossary

| Term | Meaning |
|---|---|
| **Hub** | One of the four product surfaces: Storefront, Customer Portal, Admin Center, Agent Portal |
| **RLS** | Row-Level Security — Supabase policy that auto-scopes queries by `auth.uid()` |
| **Vaidya** | Ayurvedic practitioner. Clinical role with PDPA-restricted access |
| **Dosha** | Ayurvedic body constitution (Vata / Pitta / Kapha) |
| **SOAP** | Subjective, Objective, Assessment, Plan — standard clinical note structure |
| **SST** | Sales & Service Tax — Malaysian indirect tax |
| **PDPA** | Personal Data Protection Act — Malaysian data privacy law |
| **Billplz** | Malaysian payment gateway |
| **FPX** | Malaysian online banking interchange |
| **AOV** | Average Order Value |
| **LTV** | Lifetime Value (per customer) |
| **RMA** | Return Merchandise Authorization |
| **Commission type** | `affiliate` (% per order) or `reseller` (% per net margin) |
