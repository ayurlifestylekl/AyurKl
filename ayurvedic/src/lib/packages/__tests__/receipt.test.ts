import { describe, it, expect } from 'vitest'
import { isCentrePaymentMethod, paymentMethodLabel, receiptTherapyName } from '@/lib/packages/receipt'

describe('receiptTherapyName', () => {
  it('keeps only the Ayurvedic name', () => {
    expect(receiptTherapyName('Abhyangam (Full Body Oil Massage)')).toBe('Abhyangam')
    expect(receiptTherapyName('Sirodhaara — Head, Neck & Foot Massage')).toBe('Sirodhaara')
    expect(receiptTherapyName('Abhyangam with Kizhi')).toBe('Abhyangam with Kizhi')
    expect(receiptTherapyName('Udwarthanam + Steam Bath')).toBe('Udwarthanam + Steam Bath')
  })
})

describe('paymentMethodLabel', () => {
  it('labels online and counter payments', () => {
    expect(paymentMethodLabel('billplz', 'website_self_checkout')).toBe('Online Banking (FPX) via Billplz')
    expect(paymentMethodLabel('tng_ewallet', 'whatsapp_manual')).toBe("Touch 'n Go eWallet")
    expect(paymentMethodLabel('duitnow_qr', 'whatsapp_manual')).toBe('DuitNow QR / Bank QR')
    // Sales logged before the payment-method picker existed.
    expect(paymentMethodLabel(null, 'whatsapp_manual')).toBe('Paid at centre')
  })

  it('only accepts known counter methods', () => {
    expect(isCentrePaymentMethod('cash')).toBe(true)
    expect(isCentrePaymentMethod('billplz')).toBe(false)
    expect(isCentrePaymentMethod('')).toBe(false)
  })
})
