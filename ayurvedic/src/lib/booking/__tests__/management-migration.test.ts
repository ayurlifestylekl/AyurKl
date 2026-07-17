import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const sql = readFileSync(resolve(process.cwd(), 'supabase/migrations/20260718_self_service_booking_management.sql'), 'utf8')

describe('self-service booking management migration', () => {
  it('creates private recovery, grant, audit, and refund records', () => {
    for (const table of ['booking_management_otps', 'booking_management_grants', 'booking_events', 'booking_refunds']) {
      expect(sql).toContain(`create table if not exists public.${table}`)
    }
    expect(sql).toContain('revoke all on public.booking_management_otps from anon, authenticated')
    expect(sql).toContain('unique (idempotency_key)')
  })

  it('supports safe group detachment', () => {
    expect(sql).toContain('group_management_active boolean not null default true')
  })
})
