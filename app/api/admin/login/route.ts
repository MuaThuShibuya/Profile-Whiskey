import { NextResponse } from 'next/server'
import { signToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin đăng nhập' },
        { status: 400 }
      )
    }

    const validUsername = process.env.ADMIN_USERNAME
    const validPassword = process.env.ADMIN_PASSWORD

    if (!validUsername || !validPassword) {
      console.error('ADMIN_USERNAME or ADMIN_PASSWORD not set in env')
      return NextResponse.json(
        { success: false, message: 'Server chưa cấu hình admin credentials' },
        { status: 500 }
      )
    }

    if (username !== validUsername || password !== validPassword) {
      return NextResponse.json(
        { success: false, message: 'Sai tên đăng nhập hoặc mật khẩu' },
        { status: 401 }
      )
    }

    const token = await signToken({ role: 'admin' })

    const res = NextResponse.json({ success: true, message: 'Đăng nhập thành công' })
    res.cookies.set('admin_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24h
      path: '/',
    })

    return res
  } catch (error: any) {
    console.error('[POST /api/admin/login]', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi server' },
      { status: 500 }
    )
  }
}
