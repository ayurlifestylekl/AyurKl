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
  return process.env.PAYMENTS_PROVIDER === 'billplz' ? billplzProvider : stubProvider
}

export type { PaymentProvider } from './provider'
