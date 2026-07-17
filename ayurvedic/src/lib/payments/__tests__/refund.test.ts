import { createHmac } from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const stripeMocks = vi.hoisted(() => ({
  retrieveSession: vi.fn(),
  createRefund: vi.fn(),
  retrieveRefund: vi.fn(),
  constructEvent: vi.fn(),
}))

vi.mock('server-only', () => ({}))
vi.mock('stripe', () => ({
  default: class StripeMock {
    checkout = { sessions: { retrieve: stripeMocks.retrieveSession, create: vi.fn(), expire: vi.fn() } }
    refunds = { create: stripeMocks.createRefund, retrieve: stripeMocks.retrieveRefund }
    webhooks = { constructEvent: stripeMocks.constructEvent }
  },
}))

import { billplzProvider, buildBillplzChecksum, maskBankAccount } from '../billplz'
import {
  applyRefundCallback,
  reconcileRefund,
  requestProviderRefund,
  type RefundRecord,
  type RefundStore,
} from '../refund'
import { stripeProvider } from '../stripe'
import { stubProvider } from '../stub'
import type { PaymentProvider, RefundCallbackResult } from '../provider'

const RAW_ACCOUNT = '1234567890'
const REFUND_ARGS = {
  billId: 'bill_123',
  amountRm: 20,
  idempotencyKey: 'booking-refund:appointment-a:full',
  customerEmail: 'asha@example.com',
}

function responseJson(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function billplzCallback(
  values: Record<string, string>,
  secret = 'payment-order-signature',
): Request {
  const checksum = buildBillplzChecksum([
    values.id,
    values.bank_account_number,
    values.status,
    values.total,
    values.reference_id,
    values.epoch,
  ], secret)
  const body = new URLSearchParams({ ...values, checksum })
  return new Request('https://example.test/api/payments/billplz-refund-callback', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  })
}

function memoryStore(initial: RefundRecord) {
  let row = { ...initial }
  const store: RefundStore = {
    async findById(id) {
      return row.id === id ? { ...row } : null
    },
    async findByProviderRefundId(providerRefundId) {
      return row.providerRefundId === providerRefundId ? { ...row } : null
    },
    async transition(id, expectedStatus, patch) {
      if (row.id !== id || row.status !== expectedStatus) return false
      row = { ...row, ...patch }
      return true
    },
  }
  return { store, current: () => ({ ...row }) }
}

function refundProvider(overrides: Partial<PaymentProvider> = {}): PaymentProvider {
  return {
    name: 'stripe',
    createBill: vi.fn(),
    verifyCallback: vi.fn(),
    createRefund: vi.fn().mockResolvedValue({ providerRefundId: 're_123', status: 'pending' }),
    fetchRefundStatus: vi.fn().mockResolvedValue({ status: 'pending' }),
    ...overrides,
  }
}

beforeEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  stripeMocks.retrieveSession.mockReset()
  stripeMocks.createRefund.mockReset()
  stripeMocks.retrieveRefund.mockReset()
  stripeMocks.constructEvent.mockReset()
  process.env.STRIPE_SECRET_KEY = 'sk_test_not_real'
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_not_real'
  process.env.BILLPLZ_API_KEY = 'not-a-real-key'
  process.env.BILLPLZ_PAYMENT_ORDER_COLLECTION_ID = 'collection'
  process.env.BILLPLZ_PAYMENT_ORDER_SIGNATURE_KEY = 'payment-order-signature'
})

describe('refund provider contracts', () => {
  it('exposes refund operations on every provider', () => {
    expect(stripeProvider.createRefund).toBeTypeOf('function')
    expect(billplzProvider.createRefund).toBeTypeOf('function')
    expect(stubProvider.createRefund).toBeTypeOf('function')
    expect(stripeProvider.fetchRefundStatus).toBeTypeOf('function')
    expect(billplzProvider.fetchRefundStatus).toBeTypeOf('function')
  })

  it('builds the prescribed HMAC-SHA512 and masks every digit except the last four', () => {
    const secret = 'secret'
    expect(buildBillplzChecksum(['collection', RAW_ACCOUNT, '2000', '123'], secret))
      .toBe(createHmac('sha512', secret).update('collection12345678902000123').digest('hex'))
    expect(buildBillplzChecksum(['collection', RAW_ACCOUNT, '2000', '123'], secret))
      .toMatch(/^[a-f0-9]{128}$/)
    expect(maskBankAccount(RAW_ACCOUNT)).toBe('******7890')
    expect(maskBankAccount('1234')).toBe('****')
  })
})

describe('Stripe refunds', () => {
  it('resolves the Checkout Session payment intent and forwards exact sen plus idempotency key', async () => {
    stripeMocks.retrieveSession.mockResolvedValue({ payment_intent: 'pi_123' })
    stripeMocks.createRefund.mockResolvedValue({ id: 're_123', status: 'succeeded' })

    await expect(stripeProvider.createRefund!(REFUND_ARGS)).resolves.toEqual({
      providerRefundId: 're_123',
      status: 'confirmed',
    })
    expect(stripeMocks.retrieveSession).toHaveBeenCalledWith('bill_123')
    expect(stripeMocks.createRefund).toHaveBeenCalledWith(
      { payment_intent: 'pi_123', amount: 2000 },
      { idempotencyKey: 'booking-refund:appointment-a:full' },
    )
  })

  it.each([
    ['pending', 'pending'],
    ['succeeded', 'confirmed'],
  ] as const)('maps Stripe %s to %s', async (providerStatus, status) => {
    stripeMocks.retrieveRefund.mockResolvedValue({ id: 're_123', status: providerStatus })
    await expect(stripeProvider.fetchRefundStatus!('re_123')).resolves.toEqual({ status })
  })

  it.each(['failed', 'canceled'] as const)('throws a redacted error for Stripe %s', async (status) => {
    stripeMocks.retrieveSession.mockResolvedValue({ payment_intent: 'pi_123' })
    stripeMocks.createRefund.mockResolvedValue({ id: 're_123', status, failure_reason: RAW_ACCOUNT })
    const error = await stripeProvider.createRefund!(REFUND_ARGS).catch((value) => value)
    expect(error).toBeInstanceOf(Error)
    expect(JSON.stringify(error)).not.toContain(RAW_ACCOUNT)
  })

  it('verifies and redacts refund.updated on the existing signed webhook seam', async () => {
    stripeMocks.constructEvent.mockReturnValue({
      type: 'refund.updated',
      data: { object: { id: 're_123', status: 'failed', failure_reason: RAW_ACCOUNT } },
    })
    const request = new Request('https://example.test/api/payments/stripe-webhook', {
      method: 'POST',
      headers: { 'stripe-signature': 'signed' },
      body: 'raw signed payload',
    })
    const result = await stripeProvider.verifyRefundCallback!(request)
    expect(result).toEqual({ providerRefundId: 're_123', status: 'exception' })
    expect(JSON.stringify(result)).not.toContain(RAW_ACCOUNT)
    expect(stripeMocks.constructEvent).toHaveBeenCalledWith(
      'raw signed payload', 'signed', 'whsec_not_real',
    )
  })
})

describe('Billplz Payment Order refunds', () => {
  it('reuses the idempotency key as reference_id and returns only bank code plus last4', async () => {
    const fetchMock = vi.fn().mockResolvedValue(responseJson({
      id: 'po_123',
      status: 'processing',
      bank_code: 'MBBEMYKL',
      bank_account_number: RAW_ACCOUNT,
      name: 'Asha Nair',
    }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await billplzProvider.createRefund!({
      ...REFUND_ARGS,
      bank: { bankCode: 'MBBEMYKL', accountNumber: RAW_ACCOUNT, accountHolderName: 'Asha Nair' },
    })
    expect(result).toEqual({
      providerRefundId: 'po_123',
      status: 'pending',
      bankCode: 'MBBEMYKL',
      bankAccountLast4: '7890',
    })
    expect(JSON.stringify(result)).not.toContain(RAW_ACCOUNT)

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    const body = init.body as URLSearchParams
    expect(body.get('payment_order_collection_id')).toBe('collection')
    expect(body.get('total')).toBe('2000')
    expect(body.get('reference_id')).toBe(REFUND_ARGS.idempotencyKey)
    expect(body.get('recipient_notification')).toBe('true')
    expect(body.get('checksum')).toBe(buildBillplzChecksum([
      'collection', RAW_ACCOUNT, '2000', body.get('epoch')!,
    ], 'payment-order-signature'))
  })

  it('never exposes a provider response that echoes bank or account-holder data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      `failure for ${RAW_ACCOUNT} Asha Nair`,
      { status: 422 },
    )))
    const error = await billplzProvider.createRefund!({
      ...REFUND_ARGS,
      bank: { bankCode: 'MBBEMYKL', accountNumber: RAW_ACCOUNT, accountHolderName: 'Asha Nair' },
    }).catch((value) => value)
    expect(error).toBeInstanceOf(Error)
    expect(JSON.stringify(error)).not.toContain(RAW_ACCOUNT)
    expect(JSON.stringify(error)).not.toContain('Asha Nair')
  })

  it('verifies the callback checksum before returning a redacted status', async () => {
    const values = {
      id: 'po_123',
      bank_account_number: RAW_ACCOUNT,
      status: 'completed',
      total: '2000',
      reference_id: REFUND_ARGS.idempotencyKey,
      epoch: '123',
    }
    const verified = await billplzProvider.verifyRefundCallback!(billplzCallback(values))
    expect(verified).toEqual({ providerRefundId: 'po_123', status: 'confirmed' })
    expect(JSON.stringify(verified)).not.toContain(RAW_ACCOUNT)

    const tampered = billplzCallback(values)
    const body = new URLSearchParams(await tampered.text())
    body.set('status', 'cancelled')
    await expect(billplzProvider.verifyRefundCallback!(new Request(tampered.url, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    }))).resolves.toBeNull()
  })

  it.each([
    ['processing', 'pending'],
    ['completed', 'confirmed'],
    ['refunded', 'exception'],
    ['cancelled', 'exception'],
  ] as const)('maps Payment Order %s to %s', async (providerStatus, status) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(responseJson({ id: 'po_123', status: providerStatus })))
    await expect(billplzProvider.fetchRefundStatus!('po_123')).resolves.toEqual({ status })
  })
})

describe('shared refund persistence', () => {
  const claimed: RefundRecord = {
    id: 'refund-a',
    provider: 'stripe',
    providerRefundId: null,
    status: 'claimed',
    amountRm: 20,
    idempotencyKey: REFUND_ARGS.idempotencyKey,
    bankCode: null,
    bankAccountLast4: null,
  }

  it('persists only safe provider fields and does not call a provider twice after transition', async () => {
    const memory = memoryStore(claimed)
    const provider = refundProvider({
      createRefund: vi.fn().mockResolvedValue({
        providerRefundId: 'po_123', status: 'pending', bankCode: 'MBBEMYKL', bankAccountLast4: '7890',
      }),
    })
    const deps = { store: memory.store, providerForName: () => provider }
    const args = { refundId: claimed.id, ...REFUND_ARGS, bank: {
      bankCode: 'MBBEMYKL', accountNumber: RAW_ACCOUNT, accountHolderName: 'Asha Nair',
    } }

    await expect(requestProviderRefund(args, deps)).resolves.toMatchObject({ status: 'pending' })
    await expect(requestProviderRefund(args, deps)).resolves.toMatchObject({ status: 'pending' })
    expect(provider.createRefund).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(memory.current())).not.toContain(RAW_ACCOUNT)
    expect(JSON.stringify(memory.current())).not.toContain('Asha Nair')
  })

  it('claims the database row before the provider call so concurrent requests cannot double-submit', async () => {
    const memory = memoryStore(claimed)
    let finish!: (result: { providerRefundId: string; status: 'pending' }) => void
    const createRefund = vi.fn().mockImplementation(() => new Promise((resolve) => { finish = resolve }))
    const provider = refundProvider({ createRefund })
    const deps = { store: memory.store, providerForName: () => provider }
    const args = { refundId: claimed.id, ...REFUND_ARGS }

    const first = requestProviderRefund(args, deps)
    await vi.waitFor(() => expect(createRefund).toHaveBeenCalledTimes(1))
    await expect(requestProviderRefund(args, deps)).rejects.toThrow('Refund request could not be processed.')
    expect(createRefund).toHaveBeenCalledTimes(1)
    finish({ providerRefundId: 're_123', status: 'pending' })
    await expect(first).resolves.toMatchObject({ providerRefundId: 're_123', status: 'pending' })
  })

  it('reconciles only pending rows and leaves duplicate terminal callbacks as no-ops', async () => {
    const memory = memoryStore({ ...claimed, status: 'pending', providerRefundId: 'po_123' })
    const provider = refundProvider({ fetchRefundStatus: vi.fn().mockResolvedValue({ status: 'confirmed' }) })
    const deps = { store: memory.store, providerForName: () => provider }

    await expect(reconcileRefund(claimed.id, deps)).resolves.toMatchObject({ status: 'confirmed' })
    await expect(reconcileRefund(claimed.id, deps)).resolves.toMatchObject({ status: 'confirmed' })
    expect(provider.fetchRefundStatus).toHaveBeenCalledTimes(1)

    const callback: RefundCallbackResult = { providerRefundId: 'po_123', status: 'exception' }
    await expect(applyRefundCallback(callback, deps)).resolves.toMatchObject({ status: 'confirmed' })
    expect(memory.current().status).toBe('confirmed')
  })
})
