import { describe, it, expect, vi } from 'vitest'
import { createHmac } from 'node:crypto'

vi.mock('server-only', () => ({}))

import { verifyCalSignature } from '../webhook'

describe('verifyCalSignature', () => {
  const secret = 'whsec_test_secret'
  const body = JSON.stringify({ triggerEvent: 'BOOKING_CREATED', x: 1 })
  const goodSig = createHmac('sha256', secret).update(body).digest('hex')

  it('accepts a valid signature', () => {
    expect(verifyCalSignature(body, goodSig, secret)).toBe(true)
  })

  it('rejects a missing signature', () => {
    expect(verifyCalSignature(body, null, secret)).toBe(false)
  })

  it('rejects a tampered body', () => {
    expect(verifyCalSignature(body + 'x', goodSig, secret)).toBe(false)
  })

  it('rejects a wrong secret', () => {
    expect(verifyCalSignature(body, goodSig, 'other-secret')).toBe(false)
  })

  it('rejects a different-length signature without throwing', () => {
    expect(verifyCalSignature(body, 'short', secret)).toBe(false)
  })
})
