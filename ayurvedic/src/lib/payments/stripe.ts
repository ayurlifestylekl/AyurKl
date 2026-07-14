import Stripe from 'stripe'
import type { CallbackResult, CreateBillArgs, CreateBillResult, PaymentProvider } from './provider'

/**
 * Stripe (card) provider — for customers without a Malaysian bank account,
 * who can't use FPX. Billplz stays the default for local FPX payments; this
 * is the "Card" option shown alongside it once Stripe is configured.
 *
 * To go live: set in the environment
 *   STRIPE_SECRET_KEY     — secret key (sk_live_… / sk_test_…)
 *   STRIPE_WEBHOOK_SECRET — signing secret for the webhook endpoint below
 *
 * In the Stripe Dashboard → Developers → Webhooks, add an endpoint at
 *   https://<your-domain>/api/payments/stripe-webhook
 * listening for the `checkout.session.completed` event.
 *
 * Uses hosted Stripe Checkout (redirect flow) — same shape as Billplz's
 * hosted bill page, so no client-side Stripe.js or PCI scope is needed.
 */

let cached: Stripe | null = null
function client(): Stripe {
  if (cached) return cached
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured.')
  cached = new Stripe(key)
  return cached
}

export const stripeProvider: PaymentProvider = {
  name: 'stripe',

  async createBill(args: CreateBillArgs): Promise<CreateBillResult> {
    const session = await client().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: args.email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'myr',
            product_data: { name: args.description.slice(0, 200) },
            unit_amount: Math.round(args.amountRm * 100), // sen
          },
          quantity: 1,
        },
      ],
      success_url: args.redirectUrl,
      cancel_url: args.redirectUrl,
      metadata: { appointmentId: args.appointmentId },
    })
    if (!session.url) throw new Error('Stripe did not return a Checkout URL.')
    return { billId: session.id, url: session.url }
  },

  async fetchBillStatus(billId: string): Promise<{ paid: boolean } | null> {
    if (!billId) return null
    try {
      const session = await client().checkout.sessions.retrieve(billId)
      return { paid: session.payment_status === 'paid' }
    } catch {
      return null
    }
  },

  async deleteBill(billId: string): Promise<void> {
    if (!billId) return
    try {
      await client().checkout.sessions.expire(billId)
    } catch (e) {
      // Already expired/completed is fine — either way it can't be paid again.
      const msg = e instanceof Error ? e.message : String(e)
      if (/already expired|already completed|no longer accepting/i.test(msg)) return
      throw e
    }
  },

  /**
   * Verifies a Stripe webhook. Requires the RAW request body — the caller
   * (the /api/payments/stripe-webhook route) must not have parsed it first.
   */
  async verifyCallback(req: Request): Promise<CallbackResult> {
    const secret = process.env.STRIPE_WEBHOOK_SECRET
    const sig = req.headers.get('stripe-signature')
    const raw = await req.text()
    if (!secret || !sig) return { billId: '', paid: false }

    let event: Stripe.Event
    try {
      event = client().webhooks.constructEvent(raw, sig, secret)
    } catch (e) {
      console.error('[stripe] webhook signature verification failed:', e)
      return { billId: '', paid: false }
    }

    if (event.type !== 'checkout.session.completed') return { billId: '', paid: false }
    const session = event.data.object as Stripe.Checkout.Session
    return { billId: session.id, paid: session.payment_status === 'paid' }
  },
}
