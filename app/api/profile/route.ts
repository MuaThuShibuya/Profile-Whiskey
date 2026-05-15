import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import Profile from '@/models/Profile'
import { DEFAULT_PROFILE } from '@/lib/default-config'
import { verifyAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await dbConnect()

    let profile = await Profile.findOne({ key: 'main' }).lean()

    if (!profile) {
      profile = await Profile.create(DEFAULT_PROFILE)
      profile = profile.toObject()
    }

    return NextResponse.json({ success: true, data: profile })
  } catch (error: any) {
    console.error('[GET /api/profile]', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi server' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    await verifyAuth(token)

    await dbConnect()
    const body = await req.json()

    // Validate constraints
    if (body.theme?.particleCount > 150) body.theme.particleCount = 150
    if (body.performance?.mobileParticleLimit > 50) body.performance.mobileParticleLimit = 50
    if (body.theme?.blurIntensity > 100) body.theme.blurIntensity = 100
    if (body.theme?.glowIntensity > 100) body.theme.glowIntensity = 100
    if (body.profile?.bio?.length > 300) {
      return NextResponse.json({ success: false, message: 'Bio tối đa 300 ký tự' }, { status: 400 })
    }
    if (body.profile?.quote?.length > 200) {
      return NextResponse.json({ success: false, message: 'Quote tối đa 200 ký tự' }, { status: 400 })
    }

    const updated = await Profile.findOneAndUpdate(
      { key: 'main' },
      { $set: body },
      { new: true, upsert: true, lean: true }
    )

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    console.error('[PUT /api/profile]', error)
    if (error.message === 'Your token has expired.') {
      return NextResponse.json({ success: false, message: 'Session hết hạn' }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi server' },
      { status: 500 }
    )
  }
}
