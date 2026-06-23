import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/email/client', () => ({
  sendMail: vi.fn(async () => {}),
  EMAIL_FROM: 'test@example.com',
}))

const mockSingle = vi.fn()
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({ select: () => ({ eq: () => ({ single: mockSingle }) }) }),
  }),
}))

import { sendEmail } from '../send'

beforeEach(() => { mockSingle.mockReset() })

describe('sendEmail opt-in respect', () => {
  it('sends transactional emails regardless of opt-in', async () => {
    const r = await sendEmail({ to: 'a@b.com', category: 'transactional', subject: 's', html: '', text: '' })
    expect(r.sent).toBe(true)
  })

  it('skips reminder emails when user opted out', async () => {
    mockSingle.mockResolvedValue({ data: { email_reminders_opt_in: false, marketing_opt_in: true } })
    const r = await sendEmail({ to: 'a@b.com', category: 'reminder', subject: 's', html: '', text: '', userId: 'u1' })
    expect(r).toEqual({ sent: false, reason: 'reminders_opt_out' })
  })

  it('skips marketing when user opted out', async () => {
    mockSingle.mockResolvedValue({ data: { email_reminders_opt_in: true, marketing_opt_in: false } })
    const r = await sendEmail({ to: 'a@b.com', category: 'marketing', subject: 's', html: '', text: '', userId: 'u1' })
    expect(r).toEqual({ sent: false, reason: 'marketing_opt_out' })
  })

  it('sends reminder when opted in', async () => {
    mockSingle.mockResolvedValue({ data: { email_reminders_opt_in: true, marketing_opt_in: false } })
    const r = await sendEmail({ to: 'a@b.com', category: 'reminder', subject: 's', html: '', text: '', userId: 'u1' })
    expect(r.sent).toBe(true)
  })
})
