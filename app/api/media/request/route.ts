import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import MediaRequest from '@/models/MediaRequest'
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
    const requests = await MediaRequest.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json({ success: true, data: requests })
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Your token has expired.') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    console.error('[GET /api/media/request]', error)
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect()
    const body = await req.json()

    const {
      type,
      message,
      senderName,
      fileName,
      fileUrl,
      secureUrl,
      publicId,
      cloudinaryResourceType,
      mimeType,
      fileSize,
      format,
      width,
      height,
      duration,
    } = body

    const validTypes = ['video', 'image', 'audio', 'message', 'photo_request']
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, message: 'Loại media không hợp lệ' },
        { status: 400 }
      )
    }

    // secureUrl takes priority; fall back to fileUrl for legacy clients
    const resolvedUrl = secureUrl || fileUrl || ''

    const newRequest = await MediaRequest.create({
      type,
      message:    message ?? '',
      senderName: senderName ?? '',
      fileName:   fileName ?? '',
      fileUrl:    resolvedUrl,
      secureUrl:  resolvedUrl,
      publicId:   publicId ?? '',
      cloudinaryResourceType: cloudinaryResourceType ?? '',
      mimeType:   mimeType ?? '',
      fileSize:   fileSize ?? 0,
      format:     format ?? '',
      width:      width ?? undefined,
      height:     height ?? undefined,
      duration:   duration ?? undefined,
      status:     'pending',
      isPublic:   false,
    })

    return NextResponse.json({ success: true, data: newRequest }, { status: 201 })
  } catch (error: any) {
    console.error('[POST /api/media/request]', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi server khi lưu yêu cầu' },
      { status: 500 }
    )
  }
}
