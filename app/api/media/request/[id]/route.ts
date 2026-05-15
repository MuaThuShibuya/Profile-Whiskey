import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import MediaRequest from '@/models/MediaRequest'
import { verifyAuth } from '@/lib/auth'
import { deleteFromCloudinary } from '@/lib/cloudinary'

export const dynamic = 'force-dynamic'

async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token) throw new Error('Unauthorized')
  await verifyAuth(token)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const { status } = await req.json()

    if (!['pending', 'approved', 'rejected', 'archived'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Status không hợp lệ' },
        { status: 400 }
      )
    }

    await dbConnect()
    const updated = await MediaRequest.findByIdAndUpdate(
      id,
      { status, reviewedAt: new Date(), reviewedBy: 'admin' },
      { new: true }
    )
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy media request' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Your token has expired.') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    console.error('[PATCH /api/media/request/[id]]', error)
    return NextResponse.json({ success: false, message: error.message || 'Lỗi server' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    await dbConnect()
    const doc = await MediaRequest.findByIdAndDelete(id)
    if (!doc) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy media request' },
        { status: 404 }
      )
    }

    // Clean up Cloudinary asset if it was uploaded there
    if (doc.publicId) {
      const resType = doc.cloudinaryResourceType === 'video' ? 'video' : 'image'
      await deleteFromCloudinary(doc.publicId, resType)
    }

    return NextResponse.json({ success: true, message: 'Đã xóa' })
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Your token has expired.') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    console.error('[DELETE /api/media/request/[id]]', error)
    return NextResponse.json({ success: false, message: error.message || 'Lỗi server' }, { status: 500 })
  }
}
