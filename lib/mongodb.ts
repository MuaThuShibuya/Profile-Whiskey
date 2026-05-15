import mongoose from 'mongoose'

let cached = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI || ''
  const DB_NAME = process.env.DB_NAME || 'profile_whiskey'

  // Không throw error cấp độ module, log ra console để trả về 500 JSON
  if (!MONGODB_URI) console.error("CRITICAL: MONGODB_URI is missing in .env.local")

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = { 
      bufferCommands: false,
      dbName: DB_NAME // Thêm dbName vào config kết nối
    }
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }
  cached.conn = await cached.promise
  return cached.conn
}

export default dbConnect