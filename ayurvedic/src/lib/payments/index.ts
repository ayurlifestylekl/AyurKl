import type { PaymentProvider } from './provider'
import { stubProvider } from './stub'
import { billplzProvider } from './billplz'

/**
 * Selects the live provider. Stub (test mode) is the default so the flow
 * works end-to-end with no real money. Day 2: implement billplz.ts and set
 * PAYMENTS_PROVIDER=billplz to switch over. (We gate on an explicit flag,
 * not the mere presence of BILLPLZ_API_KEY — that key already exists for the
 * product shop and must not silently route appointment payments live.)
 */
export function getPaymentProvider(): PaymentProvider {
  if (process.env.PAYMENTS_PROVIDER === 'billplz') return billplzProvider
  // The stub trusts `paid=true` straight from the callback URL — it exists only
  // for local end-to-end testing. It must NEVER be selectable in production,
  // where it would let anyone confirm a booking for free. Fail closed.
  const allowStub = process.env.PAYMENTS_ALLOW_STUB === 'true'
  if (process.env.NODE_ENV === 'production' && !allowStub) {
    throw new Error(
      'Payment provider misconfigured: set PAYMENTS_PROVIDER=billplz in production. Refusing to fall back to the insecure test stub.',
    )
  }
  return stubProvider
}

export type { PaymentProvider } from './provider'
