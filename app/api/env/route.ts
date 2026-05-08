import { NextResponse } from 'next/server'

// This route has been disabled for security reasons.
// Never expose environment variables or API keys through a public endpoint.
export async function GET() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
