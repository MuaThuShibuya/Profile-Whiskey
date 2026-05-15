import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Bot from '@/models/Bot'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await dbConnect()
    const bots = await Bot.find({
      isPublic: true,
      status: { $ne: 'hidden' },
    })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean()
    return NextResponse.json({ success: true, data: bots })
  } catch (error: any) {
    console.error('[GET /api/bots]', error)
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 })
  }
}
