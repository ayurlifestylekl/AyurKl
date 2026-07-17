import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(process.cwd(), 'src')
const source = (sub: string) => readFileSync(join(root, sub), 'utf8')

describe('Task 9: Management Copy and Queries', () => {
  it('includes Manage booking link in customer emails', () => {
    const active = [
      source('lib/booking/notify.ts'),
      source('lib/email/templates/appointmentConfirmation.ts'),
    ].join('\n')
    
    expect(active).toContain('Manage booking')
    expect(active).not.toMatch(/WhatsApp.*reschedul|Cal\.com|Once approved|Some guests are still being approved|Cancellations within 12 hours|48 hours' notice required to cancel/i)
  })

  it('exposes pending/exception refunds in staff query', () => {
    const staffQuery = source('lib/staff/appointments.ts')
    expect(staffQuery).toContain(".in('status', ['pending', 'exception'])")
  })

  it('claims management_reminder_sent_at in the 72-73h window cron', () => {
    const reminders = source('app/api/cron/appointment-reminders/route.ts')
    expect(reminders).toContain('management_reminder_sent_at')
    expect(reminders).toContain('72 * 60 * 60 * 1000')
    expect(reminders).toContain('73 * 60 * 60 * 1000')
  })
})
