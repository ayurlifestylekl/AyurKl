'use server'

import { createClient } from '@/lib/supabase/server'

export async function testDatabaseConnection() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('id, name, sku, price_rm, stock_qty')
    .limit(5)

  if (error) {
    console.error('[DB Test] Connection failed:', error.message)
    return { success: false, error: error.message, data: null }
  }

  console.log('[DB Test] Connection successful. Products found:', data?.length ?? 0)
  return { success: true, error: null, data }
}
