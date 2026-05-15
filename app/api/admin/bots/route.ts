import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import Bot from '@/models/Bot'
import { verifyAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token) throw new Error('Unauthorized')
  await verifyAuth(token)
}

export async function GET() {
  try {
    await requireAdmin()
    await dbConnect()
    const bots = await Bot.find().sort({ sortOrder: 1, createdAt: 1 }).lean()
    return NextResponse.json({ success: true, data: bots })
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Your token has expired.') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin()
    await dbConnect()
    const body = await req.json()

    if (!body.name?.trim()) {
      return NextResponse.json({ success: false, message: 'Tên bot không được để trống' }, { status: 400 })
    }

    // Auto-generate slug if not provided
    if (!body.slug) {
      body.slug = body.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
    }

    const existing = await Bot.findOne({ slug: body.slug })
    if (existing) {
      body.slug = `${body.slug}-${Date.now()}`
    }

    const bot = await Bot.create(body)
    return NextResponse.json({ success: true, data: bot }, { status: 201 })
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Your token has expired.') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    if (error.code === 11000) {
      return NextResponse.json({ success: false, message: 'Slug đã tồn tại' }, { status: 409 })
    }
    console.error('[POST /api/admin/bots]', error)
    return NextResponse.json({ success: false, message: error.message || 'Lỗi server' }, { status: 500 })
  }
}
