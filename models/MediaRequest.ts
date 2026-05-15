import mongoose from 'mongoose'

const MediaRequestSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['video', 'image', 'message', 'photo_request'] },
  message: { type: String, default: '' },
  senderName: { type: String, default: '' },
  fileName: { type: String, default: '' },
  fileUrl: { type: String, default: '' },
  mimeType: { type: String, default: '' },
  fileSize: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'archived'], default: 'pending' },
  reviewedAt: { type: Date },
  reviewedBy: { type: String, default: '' },
}, { timestamps: true })

export default mongoose.models.MediaRequest || mongoose.model('MediaRequest', MediaRequestSchema)
