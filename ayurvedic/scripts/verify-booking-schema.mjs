import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('environment: FAIL')
  process.exit(1)
}

const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
const checks = [
  ['instant claim RPC', () => sb.rpc('claim_instant_slots', { p_claims: [] })],
  ['payment confirm RPC', () => sb.rpc('confirm_appointment_payment', { p_bill_id: '__schema_probe__' })],
  ['appointment columns', () => sb.from('appointments').select('id,created_at,payment_expires_at,group_id,assigned_therapist_code,treatment_unlocked').limit(1)],
  ['schedule blocks', () => sb.from('schedule_blocks').select('id').limit(1)],
]

let failed = false
for (const [name, run] of checks) {
  try {
    const { error } = await run()
    const expectedEmptyClaim = name === 'instant claim RPC' && /non-empty json array/i.test(error?.message ?? '')
    const missingSchema = /could not find|does not exist|schema cache|column .* not found|function .* not found/i.test(error?.message ?? '')
    const ok = !missingSchema && (!error || expectedEmptyClaim || name === 'payment confirm RPC')
    console.log(`${name}: ${ok ? 'PASS' : 'FAIL'}`)
    failed ||= !ok
  } catch {
    console.log(`${name}: FAIL`)
    failed = true
  }
}
process.exitCode = failed ? 1 : 0
