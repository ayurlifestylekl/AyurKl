import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { buildRescheduleClaim, prepareReschedule } from '../reschedule'

const migrationPath = resolve(
  process.cwd(),
  'supabase/migrations/20260718b_atomic_booking_reschedule.sql',
)

describe('reschedule validation', () => {
  it('keeps a treatment appointment persisted duration and resource semantics', () => {
    expect(buildRescheduleClaim({
      bookingKind: 'treatment',
      requestedDurationMins: 90,
      genderRequirement: 'ladies_only',
    })).toMatchObject({
      durationMins: 90,
      resourceType: 'gender',
      resourceKey: 'ladies_only',
    })
  })

  it('canonicalizes consultation moves to 30 minutes', () => {
    expect(buildRescheduleClaim({ bookingKind: 'consultation', requestedDurationMins: 90 }))
      .toMatchObject({ durationMins: 30, resourceType: 'consultation', resourceKey: 'vaidya' })
  })

  it('rejects a move inside the 24-hour cutoff before calling the RPC', async () => {
    const result = await prepareReschedule({
      appointmentAt: '2026-07-20T09:30:00+08:00',
      newStart: '2026-07-21T09:30:00+08:00',
      nowMs: Date.parse('2026-07-19T10:00:00+08:00'),
    })
    expect(result).toEqual({ error: 'The online rescheduling window has closed.' })
  })

  it('allows the exact 24-hour cutoff and rejects a new start at server time', async () => {
    const nowMs = Date.parse('2026-07-19T09:30:00+08:00')
    await expect(prepareReschedule({
      appointmentAt: '2026-07-20T09:30:00+08:00',
      newStart: '2026-07-21T09:30:00+08:00',
      nowMs,
    })).resolves.toEqual({ ok: true, newStart: '2026-07-21T01:30:00.000Z' })
    await expect(prepareReschedule({
      appointmentAt: '2026-07-20T09:30:00+08:00',
      newStart: new Date(nowMs).toISOString(),
      nowMs,
    })).resolves.toEqual({ error: 'Please choose a future appointment time.' })
  })
})

describe('atomic reschedule migration', () => {
  it('validates before clearing assignment and preserves confirmed/payment state', () => {
    const sql = readFileSync(migrationPath, 'utf8')
    const firstUpdate = sql.indexOf('update public.appointments')
    expect(sql.indexOf("raise exception 'SLOT_FULL'")).toBeLessThan(firstUpdate)
    expect(sql.indexOf("raise exception 'SLOT_FULL'")).toBeLessThan(
      sql.indexOf('assigned_therapist_code = null'),
    )
    expect(sql).toContain("status = 'confirmed'")
    expect(sql).not.toMatch(/payment_status\s*=/)
    expect(sql).toContain('pg_advisory_xact_lock')
  })

  it('locks and validates the whole batch before updating any appointment', () => {
    const sql = readFileSync(migrationPath, 'utf8')
    const firstUpdate = sql.indexOf('update public.appointments')
    expect(sql).toMatch(/order by a\.id[\s\S]*for update/)
    expect(sql.indexOf("interval '24 hours'")).toBeLessThan(firstUpdate)
    expect(sql.indexOf('v_new_start <= p_now')).toBeLessThan(firstUpdate)
    expect(sql.indexOf('old_start')).toBeLessThan(firstUpdate)
  })

  it('orders resource locks and excludes all moving rows from persisted occupancy', () => {
    const sql = readFileSync(migrationPath, 'utf8')
    expect(sql).toMatch(/array_agg\(distinct key order by key\)/i)
    expect(sql).toContain('pg_advisory_xact_lock(hashtextextended(v_resource_key, 0))')
    expect(sql).not.toContain("hashtextextended('booking-reschedule|'")
    expect(sql).toMatch(/not\s*\(a\.id\s*=\s*any\s*\(v_appointment_ids\)\)/i)
    expect(sql).toContain('public.appt_occupied_range')
    expect(sql).toContain("interval '30 minutes'")
    expect(sql).toContain('v_batch_count')
  })

  it('detaches only requested members and writes audit events transactionally', () => {
    const sql = readFileSync(migrationPath, 'utf8')
    expect(sql).toContain("'rescheduled'")
    expect(sql).toContain("'group_detached'")
    expect(sql).toContain('group_management_active = false')
    expect(sql).toContain('group_detached_at = p_now')
    expect(sql).toMatch(/if v_detach_from_group then[\s\S]*group_management_active = false/i)
  })

  it('exposes the fixed-search-path RPC to service role only', () => {
    const sql = readFileSync(migrationPath, 'utf8')
    expect(sql).toMatch(/security definer[\s\S]*set search_path = public, pg_temp/i)
    expect(sql).toContain('revoke all on function public.reschedule_bookings(jsonb, text, timestamptz) from public, anon, authenticated')
    expect(sql).toContain('grant execute on function public.reschedule_bookings(jsonb, text, timestamptz) to service_role')
  })
})
