#!/usr/bin/env node
/**
 * Creates the dedicated Product Management account — separate from every
 * admin account, signs in only at /product-management/login.
 *
 * Requires the 20260903_product_manager_role.sql migration to already be
 * applied (adds 'product_manager' to the users.role CHECK constraint) —
 * otherwise the role-promotion step below fails with a constraint error.
 * Safe to re-run: if the auth user already exists, it just (re)promotes it.
 *
 * Run: node scripts/create-product-manager-account.mjs
 */
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local', override: true })

const EMAIL = 'product@keralaeverydaygymstore.com'
const PASSWORD = process.env.PRODUCT_MANAGER_PASSWORD || '2gYu85n*5cRzmee@e#UF'
const FULL_NAME = 'Product Manager'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const existing = await supabase.from('users').select('id, role').eq('email', EMAIL).maybeSingle()

let userId
if (existing.data) {
  userId = existing.data.id
  console.log(`ℹ️   Account already exists (${userId}). Re-promoting to product_manager…`)
} else {
  const created = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: FULL_NAME },
  })
  if (created.error || !created.data.user) {
    console.error('❌  Auth user create failed:', created.error?.message)
    process.exit(1)
  }
  userId = created.data.user.id
  console.log(`✅  Auth user created: ${userId}`)
  await new Promise((r) => setTimeout(r, 500)) // let handle_new_user trigger create the profile row
}

const updated = await supabase
  .from('users')
  .update({ role: 'product_manager', full_name: FULL_NAME, email: EMAIL })
  .eq('id', userId)
  .select('id, role, email')
  .maybeSingle()

if (updated.error || !updated.data) {
  console.error('❌  Role promotion failed:', updated.error?.message)
  console.error('    If this says a check constraint violation, the migration')
  console.error('    supabase/migrations/20260903_product_manager_role.sql has not')
  console.error('    been run yet — run it in the Supabase SQL Editor, then re-run this script.')
  process.exit(1)
}

console.log('')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('✅  Product Management account ready.')
console.log('    Sign in at /product-management/login:')
console.log('')
console.log(`    Email:    ${EMAIL}`)
if (!existing.data) console.log(`    Password: ${PASSWORD}`)
console.log('')
console.log('This account can ONLY access /product-management — no admin access.')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
