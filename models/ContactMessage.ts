import mongoose from 'mongoose'

const ContactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 },
  email: { type: String, required: true, maxlength: 200 },
  message: { type: String, required: true, maxlength: 2000 },
  isRead: { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.models.ContactMessage || mongoose.model('ContactMessage', ContactMessageSchema)
