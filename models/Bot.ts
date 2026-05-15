import mongoose from 'mongoose'

const BotDemoMediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ['image', 'video'], default: 'image' },
  caption: { type: String, default: '' },
}, { _id: false })

const BotSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  avatarUrl: { type: String, default: '' },
  shortDescription: { type: String, default: '', maxlength: 200 },
  longDescription: { type: String, default: '' },
  inviteUrl: { type: String, default: '' },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'beta', 'hidden'],
    default: 'active',
  },
  tags: [{ type: String, trim: true }],
  demoMedia: [BotDemoMediaSchema],
  isPublic: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true })

BotSchema.index({ slug: 1 })
BotSchema.index({ isPublic: 1, status: 1, sortOrder: 1 })

export default mongoose.models.Bot || mongoose.model('Bot', BotSchema)
