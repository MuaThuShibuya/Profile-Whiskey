import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import Profile from '@/models/Profile'
import { verifyAuth } from '@/lib/auth'
import { DEFAULT_PROFILE } from '@/lib/default-config'

export const dynamic = 'force-dynamic'

async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token) throw new Error('Unauthorized')
  await verifyAuth(token)
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    await requireAdmin()
    const { action } = await params
    await dbConnect()

    if (action === 'view-count') {
      await Profile.findOneAndUpdate(
        { key: 'main' },
        { $set: { 'profile.viewCount': 0 } }
      )
      return NextResponse.json({ success: true, message: 'Đã reset view count về 0' })
    }

    if (action === 'theme') {
      await Profile.findOneAndUpdate(
        { key: 'main' },
        { $set: { theme: DEFAULT_PROFILE.theme, effects: DEFAULT_PROFILE.effects, performance: DEFAULT_PROFILE.performance } }
      )
      return NextResponse.json({ success: true, message: 'Đã reset theme về mặc định' })
    }

    if (action === 'config') {
      await Profile.findOneAndUpdate(
        { key: 'main' },
        { $set: DEFAULT_PROFILE },
        { upsert: true }
      )
      return NextResponse.json({ success: true, message: 'Đã reset toàn bộ config về mặc định' })
    }

    return NextResponse.json({ success: false, message: 'Action không hợp lệ' }, { status: 400 })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
