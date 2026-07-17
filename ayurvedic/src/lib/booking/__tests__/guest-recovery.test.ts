import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { generateOtp, hashManagementValue, normalizeBookingEmail, verifyOtpHash } from '../guest-recovery'

describe('guest recovery primitives', () => {
  it('normalizes email without exposing it in a lookup key', () => {
    expect(normalizeBookingEmail(' Guest@Example.COM ')).toBe('guest@example.com')
    expect(hashManagementValue('guest@example.com')).toMatch(/^[a-f0-9]{64}$/)
  })

  it('creates a six-digit code and verifies only its hash', () => {
    const code = generateOtp()
    expect(code).toMatch(/^\d{6}$/)
    expect(verifyOtpHash(code, hashManagementValue(code))).toBe(true)
    expect(verifyOtpHash('000000', hashManagementValue(code))).toBe(code === '000000')
  })
})

describe('guest recovery security contract', () => {
  it('scopes both request and verification lookups to explicit guest rows', () => {
    const source = readFileSync(path.resolve(process.cwd(), 'src/lib/booking/management-actions.ts'), 'utf8')
    expect(source.match(/\.eq\('is_guest', true\)/g)).toHaveLength(2)
  })

  it('never falls back to an older unconsumed code', () => {
    const source = readFileSync(path.resolve(process.cwd(), 'src/lib/booking/management-actions.ts'), 'utf8')
    const latestOtpLookup = source.slice(source.indexOf(".select('id, code_hash"), source.indexOf('const unauthorized'))
    expect(latestOtpLookup).toContain('consumed_at')
    expect(latestOtpLookup).not.toContain(".is('consumed_at', null)")
  })

  it('keeps same-booking legacy HMAC target access stateless', () => {
    const source = readFileSync(path.resolve(process.cwd(), 'src/lib/booking/management-access.ts'), 'utf8')
    const targetAccess = source.slice(source.indexOf('export async function canManageBookingTarget'))
    expect(targetAccess.indexOf('verifyBookingToken(anchorId, token)')).toBeLessThan(
      targetAccess.indexOf('grantContains(targetId, token)'),
    )
  })
})
