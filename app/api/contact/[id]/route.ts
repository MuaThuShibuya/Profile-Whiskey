import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import ContactMessage from '@/models/ContactMessage'
import { verifyAuth } from '@/lib/auth'

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
    const body = await req.json()

    await dbConnect()
    const updated = await ContactMessage.findByIdAndUpdate(id, body, { new: true })
    if (!updated) return NextResponse.json({ success: false, message: 'Không tìm thấy' }, { status: 404 })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
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
    const deleted = await ContactMessage.findByIdAndDelete(id)
    if (!deleted) return NextResponse.json({ success: false, message: 'Không tìm thấy' }, { status: 404 })

    return NextResponse.json({ success: true, message: 'Đã xóa' })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
