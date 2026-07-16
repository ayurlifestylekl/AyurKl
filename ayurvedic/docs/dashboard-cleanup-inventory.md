# Dashboard Cleanup Inventory

| Surface | Route/component | Disposition | Reason | Verification | Status |
|---|---|---|---|---|---|
| Public booking chooser | `/book` | Update | Present only the approved direct treatment and free-consultation paths | Browser | Planned |
| Public booking chooser | `BookingChooser` | Update | Replace contradictory `Pay at Centre` copy with direct online checkout wording | Source scan + browser | Planned |
| Public booking | `/book/treatment` | Update | Remove alternate/approval flow | Browser: direct checkout | Planned |
| Public booking | `BookingTreatmentOrchestrator` | Update | Remove request/review wording and preserve direct treatment selection | Unit + browser | Planned |
| Public booking | `BookingRequestForm` | Update | Submit one selected slot and use treatment/consultation-specific direct CTAs | Unit + browser | Planned |
| Public booking | `TreatmentPicker` | Keep | Required searchable treatment selection with no customer therapist choice | Browser | Planned |
| Public booking | `SlotPicker` | Keep | Required single-slot availability preview; the server remains authoritative | Unit + browser | Planned |
| Public booking policy | `BookingPolicyStrip` | Update | Keep consultation copy free of payment and therapist-assignment implications | Source scan + browser | Planned |
| Public consultation | `/book/consultation` | Update | Always free 30 min | Browser: direct confirmation | Planned |
| Public booking status | `/book/request/[id]` | Update | Replace request/approval steps with direct-flow labels | Unit + browser | Planned |
| Public treatment checkout | `/book/request/[id]/checkout` and `/book/request/[id]/pay` | Keep | Required payment hand-off for valid treatment holds | Payment + browser | Planned |
| Customer appointments | `/account/appointments` | Update | Use direct booking terminology throughout the list and next-appointment surfaces | Unit + browser | Planned |
| Customer | `AppointmentListCard` | Update | Remove Cal.com actions | Unit + browser | Planned |
| Customer | `NextAppointmentHero` | Update | Remove Cal.com actions and approval-era booking links | Unit + browser | Planned |
| Front desk navigation | `ConsoleShell` and `/console` layout | Update | Remove pending-request counters and approval destinations | Nav test + browser | Planned |
| Front desk overview | `/console` | Update | Prioritise unassigned paid treatments, today, confirmed, and payment holds | Unit + browser | Planned |
| Front desk | `/console?tab=new` | Remove | Online approval obsolete | Nav/browser | Planned |
| Front desk | `/console?tab=needs-therapist` | Keep | Screenshot-required backstop | Browser | Planned |
| Front desk | `/console?tab=today` and `/console?tab=confirmed` | Update | Preserve confirmed operations while blocking treatment check-in/start until therapist assignment | Unit + browser | Planned |
| Front desk today | `TodayBoard` | Update | Surface assignment clearly and pass assignment state into guarded visit actions | Unit + browser | Planned |
| Front desk visit actions | `CheckInButtons` and `src/lib/staff/actions.ts#setStatus` | Update | Enforce therapist assignment before treatment check-in or start in UI and server action | Unit + browser | Planned |
| Front desk | `/console?tab=awaiting` | Keep | Read-only visibility into active treatment holds | Browser | Planned |
| Front desk | `/console?tab=therapists` | Keep | Required therapist availability view | Browser | Planned |
| Front desk therapist status | `TherapistBoard` | Keep | Required same-day availability and busy-until backstop | Browser | Planned |
| Front desk manual booking | `/console/new` and `StaffNewBooking` | Keep | Phone and walk-in creation remains supported | Browser | Planned |
| Front desk schedule | `/console/schedule` and `ScheduleGrid` | Update | Keep schedule while making unassigned confirmed treatments prominent | Unit + browser | Planned |
| Front desk detail | `/console/[id]` | Update | Remove approval negotiation while retaining assignment and visit operations | Unit + browser | Planned |
| Staff booking actions | `AppointmentActions` | Update | Remove approve/reject actions for instant rows and enforce assignment workflow | Unit + browser | Planned |
| Staff group actions | `GroupApprovalActions` | Update | Remove approve/reject and time negotiation, preserve each customer-selected paid slot, and retain per-guest therapist assignment | Unit + browser + source scan | Planned |
| Staff booking list | `BookingQueue` | Update | Use confirmed-slot language while keeping legacy approval stamps readable | Unit + browser | Planned |
| Staff request contact | `MarkContactedButton` | Remove | Contacted-via-WhatsApp approval tracking is obsolete | Source scan + browser | Planned |
| Clinical clearance | `UnlockTreatment` | Update | Restrict clearance to eligible attended consultations and doctor/admin with an auditable linked outcome | Unit + role browser | Planned |
| Doctor navigation | `DoctorShell` and `/doctor` layout | Update | Remove request count and approval destination | Nav test + browser | Planned |
| Doctor overview | `/doctor` | Update | Show today's patients, needs therapist, to clear, and total patients | Unit + browser | Planned |
| Doctor | `/doctor/requests` | Remove | Doctor no longer approves online bookings | Redirect/nav test | Planned |
| Doctor | `/doctor/consultations` | Update | Eligible attended consultations only | Unit + browser | Planned |
| Doctor schedule | `/doctor/schedule` | Keep | Required today and upcoming patient lists | Browser | Planned |
| Doctor calendar | `/doctor/calendar` | Keep | Required doctor calendar view | Browser | Planned |
| Doctor patients | `/doctor/patients` | Keep | Required redacted patient directory | Browser + role test | Planned |
| Doctor detail | `/doctor/[id]` | Update | Retain notes, clearance, and assignment without online approval actions | Unit + browser | Planned |
| Admin overview | `/admin/dashboard` | Update | Show real clinic operations and avoid fetching hidden commerce data | Unit + browser | Planned |
| Admin | `/admin/appointments` | Update | Real confirmed operations, no mocks | Unit + browser | Planned |
| Admin appointments | `AppointmentsFilters` and `AppointmentsTable` | Update | Default to today and replace Requests with Needs therapist | Unit + browser | Planned |
| Admin appointment detail | `/admin/appointments/[id]` and `StatusDialog` | Update | Remove demo fallbacks, approval defaults, and Cal.com sync controls | Unit + browser | Planned |
| Admin appointment mocks | `src/lib/admin/appointments/mocks.ts` | Remove | Production appointment screens must not fall back to demo rows | Unit + source scan | Planned |
| Admin navigation | `src/lib/dashboard/admin-nav.ts` | Update | Make clinic and commerce destinations explicitly feature-aware | Nav test | Planned |
| Admin commerce | product/order/agent modules | Hide by feature | Future capability, disabled now | Nav test | Planned |
| Admin commerce routes | `/admin/products`, `/admin/inventory`, `/admin/orders`, `/admin/marketplace-orders`, `/admin/agent-submissions` | Hide by feature | Preserve implemented commerce capability without launch navigation | Nav test | Planned |
| Admin partner routes | `/admin/wholesale-orders`, `/admin/promos`, `/admin/partners`, `/admin/finance` | Hide by feature | Preserve wholesale, promotion, payout, and finance capability for later enablement | Nav test | Planned |
| Public/customer commerce | `Navbar`, `Footer`, `accountNav`, `/products`, `/cart`, `/account/orders` | Hide by feature | Shop, cart, product, and order navigation stays disabled for this launch | Nav/browser | Planned |
| Public partner acquisition | `/partners` | Hide by feature | Product-led agent recruitment is a future capability and disabled for this launch | Nav/browser | Planned |
| Agent commerce | `agentNav` and `/agent/*` commerce routes | Hide by feature | Agent marketplace and wholesale capability is retained but launch-disabled | Nav/browser | Planned |
| Active Cal.com integration | `/api/webhooks/calcom`, `src/lib/cal.ts`, and `src/lib/calcom/*` | Remove | Native booking is authoritative and active Cal.com behavior is obsolete | Unit + source scan | Planned |
| Admin activity | `src/lib/admin/activity.ts` | Update | Use neutral appointment-booked copy for real and legacy rows | Unit + source scan | Planned |
| Contact booking copy | `Directory` | Update | Remove visible Cal.com booking reference | Source scan + browser | Planned |
| Historical approval rows | `approved_at`, requested/alternate slot fields, and legacy status rendering | Historical compatibility | Read-only legacy data remains understandable outside the active workflow | Query + unit test | Planned |
| Historical Cal.com rows | DB columns | Historical compatibility | Read-only legacy data | Query test | Planned |
