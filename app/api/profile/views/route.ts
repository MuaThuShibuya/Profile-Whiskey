import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import Profile from '@/models/Profile'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const viewed = cookieStore.get('profile_viewed')?.value
    if (viewed === '1') {
      return NextResponse.json({ success: true, skipped: true })
    }

    await dbConnect()
    const updated = await Profile.findOneAndUpdate(
      { key: 'main' },
      { $inc: { 'profile.viewCount': 1 } },
      { new: true, lean: true }
    )

    const res = NextResponse.json({
      success: true,
      viewCount: updated?.profile?.viewCount ?? 0,
    })

    res.cookies.set('profile_viewed', '1', {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 6, // 6 giờ
      path: '/',
    })

    return res
  } catch (error: any) {
    console.error('[POST /api/profile/views]', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi server' },
      { status: 500 }
    )
  }
}
