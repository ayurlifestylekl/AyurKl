#!/usr/bin/env node
/**
 * Adds ONE new admin account without touching any existing data or users.
 * Unlike reset-and-create-admin.mjs, this never deletes anything.
 *
 * Usage:
 *   node scripts/add-admin.mjs --email "x@y.com" --password "Pass123!" --name "Full Name"
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local', override: true })

const args = process.argv.slice(2)
const getArg = (flag) => {
  const i = args.indexOf(flag)
  return i !== -1 ? args[i + 1] : undefined
}
const EMAIL = getArg('--email')
const PASSWORD = getArg('--password')
const NAME = getArg('--name') || 'Admin'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey || serviceKey.startsWith('your-')) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}
if (!EMAIL || !PASSWORD) {
  console.error('--email and --password are required.')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

async function main() {
  const existing = await supabase.from('users').select('id, role').eq('email', EMAIL).maybeSingle()
  if (existing.data) {
    console.error(`A user with email ${EMAIL} already exists (role: ${existing.data.role}). Not creating a duplicate.`)
    process.exit(1)
  }

  const created = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: NAME },
  })
  if (created.error || !created.data.user) {
    console.error('Auth user create failed:', created.error?.message)
    process.exit(1)
  }
  const userId = created.data.user.id
  console.log(`✓ auth user created: ${userId}`)

  // wait for the handle_new_user trigger to insert the public.users row
  await new Promise((r) => setTimeout(r, 700))

  const promoted = await supabase
    .from('users')
    .update({ role: 'admin', full_name: NAME })
    .eq('id', userId)
    .select('id, role, email, full_name')
    .maybeSingle()

  if (promoted.error || !promoted.data) {
    console.error('Role promotion failed:', promoted.error?.message)
    console.error('Run this SQL in Supabase to fix manually:')
    console.error(`  UPDATE public.users SET role='admin', full_name='${NAME}' WHERE id='${userId}';`)
    process.exit(1)
  }

  console.log('\n✅ New admin created')
  console.log(`   Email:    ${promoted.data.email}`)
  console.log(`   Name:     ${promoted.data.full_name}`)
  console.log(`   Role:     ${promoted.data.role}`)
  console.log('   Sign in at /admin/login')
}

main().catch((e) => {
  console.error('Failed:', e.message)
  process.exit(1)
})
