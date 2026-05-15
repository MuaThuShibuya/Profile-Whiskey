import { v2 as cloudinary } from 'cloudinary'

const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

export const cloudinaryConfigured = !!(cloudName && apiKey && apiSecret)

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  })
}

export type CloudinaryUploadResult = {
  secure_url: string
  public_id: string
  resource_type: string
  format: string
  bytes: number
  width?: number
  height?: number
  duration?: number
}

export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder?: string
    resource_type?: 'image' | 'video' | 'raw' | 'auto'
  } = {}
): Promise<CloudinaryUploadResult> {
  if (!cloudinaryConfigured) {
    throw new Error(
      'Cloudinary chưa được cấu hình. Vui lòng thêm CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET vào biến môi trường.'
    )
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder ?? 'profile-whiskey',
        resource_type: options.resource_type ?? 'auto',
        unique_filename: true,
        use_filename: false,
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary upload error]', error.message)
          reject(new Error(`Cloudinary lỗi: ${error.message}`))
        } else if (!result) {
          reject(new Error('Cloudinary không trả về kết quả'))
        } else {
          resolve(result as CloudinaryUploadResult)
        }
      }
    )
    uploadStream.end(buffer)
  })
}

export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<void> {
  if (!cloudinaryConfigured || !publicId) return
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
  } catch (error: any) {
    // Non-fatal: log but don't throw
    console.error('[Cloudinary delete error]', publicId, error?.message)
  }
}

export { cloudinary }
