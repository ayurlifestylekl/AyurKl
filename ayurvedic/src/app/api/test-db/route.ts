import { NextResponse } from 'next/server'
import { testDatabaseConnection } from '@/actions/db-test'

export async function GET() {
  const result = await testDatabaseConnection()
  return NextResponse.json(result, { status: result.success ? 200 : 500 })
}
