import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import MediaRequest from '@/models/MediaRequest'
import { verifyAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    await verifyAuth(token)

    await dbConnect()
    const requests = await MediaRequest.find().sort({ createdAt: -1 })
    return NextResponse.json({ success: true, data: requests })
  } catch (error: any) {
    if (error.message === 'Your token has expired.' || error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect()
    const body = await req.json()

    const { type, message, senderName, fileName, fileUrl, mimeType, fileSize } = body

    if (!type || !['video', 'image', 'message', 'photo_request'].includes(type)) {
      return NextResponse.json({ success: false, message: 'Type không hợp lệ' }, { status: 400 })
    }

    const newRequest = await MediaRequest.create({
      type,
      message: message ?? '',
      senderName: senderName ?? '',
      fileName: fileName ?? '',
      fileUrl: fileUrl ?? '',
      mimeType: mimeType ?? '',
      fileSize: fileSize ?? 0,
    })
    return NextResponse.json({ success: true, data: newRequest })
  } catch (error) {
    console.error('Error saving MediaRequest:', error)
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 })
  }
}
