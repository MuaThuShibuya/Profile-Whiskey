import mongoose from 'mongoose'

const MediaRequestSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['video', 'image', 'audio', 'message', 'photo_request'],
  },
  message:    { type: String, default: '' },
  senderName: { type: String, default: '' },
  fileName:   { type: String, default: '' },

  // URL — secureUrl is the canonical Cloudinary URL; fileUrl kept for backward compat
  fileUrl:    { type: String, default: '' },
  secureUrl:  { type: String, default: '' },

  // Cloudinary metadata (populated after successful upload)
  publicId:                { type: String, default: '' },
  cloudinaryResourceType:  { type: String, default: '' }, // 'image' | 'video' | 'raw'
  format:   { type: String, default: '' },
  width:    { type: Number },
  height:   { type: Number },
  duration: { type: Number }, // seconds, for video/audio

  mimeType: { type: String, default: '' },
  fileSize: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'archived'],
    default: 'pending',
  },
  isPublic: { type: Boolean, default: false },

  reviewedAt: { type: Date },
  reviewedBy: { type: String, default: '' },
}, { timestamps: true })

MediaRequestSchema.index({ status: 1, createdAt: -1 })
MediaRequestSchema.index({ type: 1 })

export default mongoose.models.MediaRequest ||
  mongoose.model('MediaRequest', MediaRequestSchema)
