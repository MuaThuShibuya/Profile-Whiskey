import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Contact from '@/models/Contact'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await dbConnect()
    const contacts = await Contact.find().sort({ createdAt: -1 })
    return NextResponse.json({ success: true, data: contacts })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect()
    const body = await req.json()
    const newContact = await Contact.create(body)
    return NextResponse.json({ success: true, data: newContact })
  } catch (error) {
    console.error('Error saving Contact:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}