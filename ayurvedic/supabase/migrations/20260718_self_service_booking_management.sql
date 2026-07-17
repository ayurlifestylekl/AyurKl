create table if not exists public.booking_management_otps (
  id uuid primary key default gen_random_uuid(),
  email_hash text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0 check (attempts between 0 and 6),
  send_count integer not null default 1 check (send_count between 1 and 5),
  request_ip_hash text,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists booking_management_otps_lookup_idx
  on public.booking_management_otps(email_hash, created_at desc);

create table if not exists public.booking_management_grants (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  email_hash text not null,
  appointment_ids uuid[] not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.booking_events (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  event_type text not null check (event_type in ('rescheduled','cancelled','group_detached','refund_requested','refund_confirmed','refund_failed','management_link_recovered')),
  actor_type text not null check (actor_type in ('customer','guest','staff','system','provider')),
  old_data jsonb not null default '{}'::jsonb,
  new_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists booking_events_appointment_idx on public.booking_events(appointment_id, created_at desc);

create table if not exists public.booking_refunds (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete restrict,
  provider text not null check (provider in ('stripe','billplz','stub')),
  provider_refund_id text,
  amount_rm numeric(10,2) not null check (amount_rm > 0),
  status text not null check (status in ('claimed','pending','confirmed','failed','exception')),
  eligibility_reason text not null check (eligibility_reason in ('mistake_window','advance_window')),
  idempotency_key text not null,
  bank_code text,
  bank_account_last4 text,
  failure_reason text,
  requested_at timestamptz,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (idempotency_key)
);
alter table public.booking_refunds enable row level security;

alter table public.appointments
  add column if not exists group_management_active boolean not null default true,
  add column if not exists group_detached_at timestamptz,
  add column if not exists management_reminder_sent_at timestamptz;

revoke all on public.booking_management_otps from anon, authenticated;
revoke all on public.booking_management_grants from anon, authenticated;
revoke all on public.booking_events from anon, authenticated;
revoke all on public.booking_refunds from anon, authenticated;
