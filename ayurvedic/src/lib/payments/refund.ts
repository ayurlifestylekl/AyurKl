import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { getProviderByName } from './index'
import type {
  PaymentProvider,
  ProviderRefundResult,
  RefundArgs,
  RefundCallbackResult,
  RefundStatusResult,
} from './provider'

export type RefundLifecycleStatus = 'claimed' | 'pending' | 'confirmed' | 'failed' | 'exception'

export interface RefundRecord {
  id: string
  provider: 'stripe' | 'billplz' | 'stub'
  providerRefundId: string | null
  status: RefundLifecycleStatus
  amountRm: number
  idempotencyKey: string
  bankCode: string | null
  bankAccountLast4: string | null
  failureReason?: string | null
  requestedAt?: string | null
  confirmedAt?: string | null
}

export interface RefundTransition {
  providerRefundId?: string
  status?: RefundLifecycleStatus
  bankCode?: string | null
  bankAccountLast4?: string | null
  failureReason?: string | null
  requestedAt?: string | null
  confirmedAt?: string | null
}

export interface RefundStore {
  findById(id: string): Promise<RefundRecord | null>
  findByProviderRefundId(providerRefundId: string): Promise<RefundRecord | null>
  transition(id: string, expectedStatus: RefundLifecycleStatus, patch: RefundTransition): Promise<boolean>
}

export interface RefundDependencies {
  store: RefundStore
  providerForName(name: string): PaymentProvider | null
}

export interface RequestProviderRefundArgs extends RefundArgs {
  refundId: string
}

function adminStore(): RefundStore {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )

  function record(row: Record<string, unknown> | null): RefundRecord | null {
    if (!row) return null
    return {
      id: String(row.id),
      provider: row.provider as RefundRecord['provider'],
      providerRefundId: typeof row.provider_refund_id === 'string' ? row.provider_refund_id : null,
      status: row.status as RefundLifecycleStatus,
      amountRm: Number(row.amount_rm),
      idempotencyKey: String(row.idempotency_key),
      bankCode: typeof row.bank_code === 'string' ? row.bank_code : null,
      bankAccountLast4: typeof row.bank_account_last4 === 'string' ? row.bank_account_last4 : null,
      failureReason: typeof row.failure_reason === 'string' ? row.failure_reason : null,
      requestedAt: typeof row.requested_at === 'string' ? row.requested_at : null,
      confirmedAt: typeof row.confirmed_at === 'string' ? row.confirmed_at : null,
    }
  }

  const columns = 'id, provider, provider_refund_id, status, amount_rm, idempotency_key, bank_code, bank_account_last4, failure_reason, requested_at, confirmed_at'
  return {
    async findById(id) {
      const { data, error } = await sb.from('booking_refunds').select(columns).eq('id', id).maybeSingle()
      if (error) throw new Error('Refund record lookup failed.')
      return record(data as Record<string, unknown> | null)
    },
    async findByProviderRefundId(providerRefundId) {
      const { data, error } = await sb
        .from('booking_refunds')
        .select(columns)
        .eq('provider_refund_id', providerRefundId)
        .maybeSingle()
      if (error) throw new Error('Refund record lookup failed.')
      return record(data as Record<string, unknown> | null)
    },
    async transition(id, expectedStatus, patch) {
      const update = {
        ...(patch.providerRefundId !== undefined ? { provider_refund_id: patch.providerRefundId } : {}),
        ...(patch.status !== undefined ? { status: patch.status } : {}),
        ...(patch.bankCode !== undefined ? { bank_code: patch.bankCode } : {}),
        ...(patch.bankAccountLast4 !== undefined ? { bank_account_last4: patch.bankAccountLast4 } : {}),
        ...(patch.failureReason !== undefined ? { failure_reason: patch.failureReason } : {}),
        ...(patch.requestedAt !== undefined ? { requested_at: patch.requestedAt } : {}),
        ...(patch.confirmedAt !== undefined ? { confirmed_at: patch.confirmedAt } : {}),
      }
      const { count, error } = await sb
        .from('booking_refunds')
        .update(update, { count: 'exact' })
        .eq('id', id)
        .eq('status', expectedStatus)
      if (error) throw new Error('Refund record update failed.')
      return count === 1
    },
  }
}

function runtimeDependencies(): RefundDependencies {
  return { store: adminStore(), providerForName: getProviderByName }
}

function safeResult(result: ProviderRefundResult): ProviderRefundResult {
  if (!result.providerRefundId || !['pending', 'confirmed'].includes(result.status)) {
    throw new Error('Invalid refund provider response.')
  }
  const bankCode = result.bankCode && /^[A-Za-z0-9_-]{2,20}$/.test(result.bankCode)
    ? result.bankCode
    : undefined
  const bankAccountLast4 = result.bankAccountLast4 && /^\d{4}$/.test(result.bankAccountLast4)
    ? result.bankAccountLast4
    : undefined
  return {
    providerRefundId: result.providerRefundId,
    status: result.status,
    ...(bankCode ? { bankCode } : {}),
    ...(bankAccountLast4 ? { bankAccountLast4 } : {}),
  }
}

function resultFromRecord(row: RefundRecord): ProviderRefundResult | null {
  if (!row.providerRefundId || !['pending', 'confirmed'].includes(row.status)) return null
  return {
    providerRefundId: row.providerRefundId,
    status: row.status as ProviderRefundResult['status'],
    ...(row.bankCode ? { bankCode: row.bankCode } : {}),
    ...(row.bankAccountLast4 ? { bankAccountLast4: row.bankAccountLast4 } : {}),
  }
}

export async function requestProviderRefund(
  args: RequestProviderRefundArgs,
  dependencies: RefundDependencies = runtimeDependencies(),
): Promise<ProviderRefundResult> {
  const existing = await dependencies.store.findById(args.refundId)
  if (!existing) throw new Error('Refund request could not be processed.')
  const existingResult = resultFromRecord(existing)
  if (existingResult) return existingResult
  if (existing.status !== 'claimed') throw new Error('Refund request could not be processed.')

  const provider = dependencies.providerForName(existing.provider)
  if (!provider) throw new Error('Refund request could not be processed.')
  const requestedAt = new Date().toISOString()
  const claimed = await dependencies.store.transition(existing.id, 'claimed', {
    status: 'pending',
    requestedAt,
  })
  if (!claimed) {
    const raced = await dependencies.store.findById(existing.id)
    const racedResult = raced ? resultFromRecord(raced) : null
    if (racedResult) return racedResult
    throw new Error('Refund request could not be processed.')
  }

  let result: ProviderRefundResult
  try {
    result = safeResult(await provider.createRefund({
      billId: args.billId,
      amountRm: existing.amountRm,
      idempotencyKey: existing.idempotencyKey,
      customerEmail: args.customerEmail,
      bank: args.bank,
    }))
  } catch {
    await dependencies.store.transition(existing.id, 'pending', {
      status: 'exception',
      failureReason: 'Provider refund request failed.',
    }).catch(() => false)
    throw new Error('Refund request could not be processed.')
  }

  const now = new Date().toISOString()
  const persisted = await dependencies.store.transition(existing.id, 'pending', {
    providerRefundId: result.providerRefundId,
    status: result.status,
    bankCode: result.bankCode ?? null,
    bankAccountLast4: result.bankAccountLast4 ?? null,
    failureReason: null,
    confirmedAt: result.status === 'confirmed' ? now : null,
  })
  if (persisted) return result

  const raced = await dependencies.store.findById(existing.id)
  const racedResult = raced ? resultFromRecord(raced) : null
  if (racedResult) return racedResult
  throw new Error('Refund request could not be processed.')
}

async function applyStatus(
  row: RefundRecord,
  status: RefundStatusResult['status'],
  dependencies: RefundDependencies,
): Promise<RefundRecord> {
  if (row.status !== 'pending' || status === 'pending') return row
  const now = new Date().toISOString()
  await dependencies.store.transition(row.id, 'pending', {
    status,
    failureReason: status === 'exception' ? 'Provider reported a refund exception.' : null,
    confirmedAt: status === 'confirmed' ? now : null,
  })
  return (await dependencies.store.findById(row.id)) ?? row
}

export async function reconcileRefund(
  id: string,
  dependencies: RefundDependencies = runtimeDependencies(),
): Promise<RefundRecord | null> {
  const row = await dependencies.store.findById(id)
  if (!row || row.status !== 'pending' || !row.providerRefundId) return row
  const provider = dependencies.providerForName(row.provider)
  if (!provider) return row
  const status = await provider.fetchRefundStatus(row.providerRefundId)
  if (!status) return row
  return applyStatus(row, status.status, dependencies)
}

export async function applyRefundCallback(
  callback: RefundCallbackResult,
  dependencies: RefundDependencies = runtimeDependencies(),
): Promise<RefundRecord | null> {
  const row = await dependencies.store.findByProviderRefundId(callback.providerRefundId)
  if (!row || row.status !== 'pending') return row
  return applyStatus(row, callback.status, dependencies)
}
