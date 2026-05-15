import { NextResponse } from 'next/server'
import { uploadToCloudinary, cloudinaryConfigured } from '@/lib/cloudinary'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-wav', 'audio/wave']

// Size limits
// Note: Vercel free tier caps request body at ~4.5MB.
// Images/audio are safe under this limit.
// Videos >4MB may time out on Vercel Hobby — use Vercel Pro or direct Cloudinary upload for large videos.
const MAX_IMAGE_SIZE = 4 * 1024 * 1024   // 4MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024  // 50MB (requires Vercel Pro / direct upload for large)
const MAX_AUDIO_SIZE = 10 * 1024 * 1024  // 10MB

export async function POST(req: Request) {
  // Check Cloudinary config upfront
  if (!cloudinaryConfigured) {
    console.error('[upload] Cloudinary env vars missing')
    return NextResponse.json(
      {
        success: false,
        message: 'Máy chủ chưa cấu hình lưu trữ file. Vui lòng liên hệ admin.',
      },
      { status: 503 }
    )
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file || file.size === 0) {
      return NextResponse.json(
        { success: false, message: 'Không có file được gửi' },
        { status: 400 }
      )
    }

    const mimeType = file.type?.toLowerCase() ?? ''
    const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType)
    const isAudio = ALLOWED_AUDIO_TYPES.includes(mimeType)

    if (!isImage && !isVideo && !isAudio) {
      return NextResponse.json(
        {
          success: false,
          message: 'File không hợp lệ. Chỉ chấp nhận: JPG, PNG, WebP, GIF, MP4, WebM, MOV, MP3, WAV, OGG',
        },
        { status: 400 }
      )
    }

    const maxSize = isImage ? MAX_IMAGE_SIZE : isAudio ? MAX_AUDIO_SIZE : MAX_VIDEO_SIZE
    if (file.size > maxSize) {
      const limit = isImage ? '4MB' : isAudio ? '10MB' : '50MB'
      return NextResponse.json(
        { success: false, message: `File quá lớn. Tối đa ${limit} cho loại file này` },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Cloudinary resource_type:
    // - images → 'image'
    // - video/audio → 'video' (Cloudinary handles audio under video resource type)
    const cloudinaryResourceType = isImage ? 'image' : 'video'
    const folder = isAudio
      ? 'profile-whiskey/audio'
      : isImage
      ? 'profile-whiskey/images'
      : 'profile-whiskey/videos'

    console.log(`[upload] Uploading ${mimeType} (${(file.size / 1024).toFixed(1)}KB) to Cloudinary folder: ${folder}`)

    const result = await uploadToCloudinary(buffer, {
      folder,
      resource_type: cloudinaryResourceType,
    })

    console.log(`[upload] Success: ${result.public_id}`)

    return NextResponse.json({
      success: true,
      fileUrl: result.secure_url,      // backward compat alias
      secureUrl: result.secure_url,
      publicId: result.public_id,
      mimeType,
      fileSize: file.size,
      type: isImage ? 'image' : isAudio ? 'audio' : 'video',
      cloudinaryResourceType: result.resource_type,
      format: result.format,
      width: result.width ?? null,
      height: result.height ?? null,
      duration: result.duration ?? null,
    })
  } catch (error: any) {
    const msg = error?.message ?? String(error)
    console.error('[POST /api/media/upload]', msg)

    if (msg.includes('chưa được cấu hình')) {
      return NextResponse.json(
        { success: false, message: msg },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Không thể tải lên media. Vui lòng thử lại sau.' },
      { status: 500 }
    )
  }
}
