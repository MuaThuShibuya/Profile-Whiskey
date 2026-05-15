import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
    }

    const payload = await verifyAuth(token)
    return NextResponse.json({ success: true, data: { role: payload.role } })
  } catch {
    return NextResponse.json({ success: false, message: 'Token không hợp lệ' }, { status: 401 })
  }
}
