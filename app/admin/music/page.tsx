'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Music, Save, RotateCcw, Play, Pause,
  CheckCircle, AlertTriangle, Zap, Upload, Link as LinkIcon, X,
} from 'lucide-react'
import { useAdminProfile } from '@/hooks/use-admin-profile'

const inp = 'w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50 focus:border-[#8b5cf6] transition-all text-sm'
const lbl = 'text-xs font-medium text-muted-foreground uppercase tracking-wide'

export default function AdminMusicPage() {
  const { formData, setNested, handleSave, resetToSaved, isSaving, loading, error, toast } = useAdminProfile()
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [uploadMode, setUploadMode] = useState<'url' | 'upload'>('url')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    }
  }, [])

  const handlePreview = () => {
    const url = formData?.profile?.music
    if (!url) return
    if (isPlaying && audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
      return
    }
    setAudioError(false)
    if (!audioRef.current || audioRef.current.src !== url) {
      if (audioRef.current) audioRef.current.pause()
      const audio = new Audio(url)
      audio.onerror = () => { setAudioError(true); setIsPlaying(false) }
      audio.onended = () => setIsPlaying(false)
      audioRef.current = audio
    }
    audioRef.current.play()
      .then(() => setIsPlaying(true))
      .catch(() => { setAudioError(true); setIsPlaying(false) })
  }

  const handleFileUpload = async (file: File) => {
    setUploadError(null)
    setIsUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/media/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (json.success) {
        setNested('profile.music', json.secureUrl)
        setUploadMode('url')
      } else {
        setUploadError(json.message || 'Upload thất bại')
      }
    } catch {
      setUploadError('Lỗi kết nối server')
    } finally {
      setIsUploading(false)
    }
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <p className="text-muted-foreground">{error}</p>
      <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-xl bg-[#8b5cf6] text-white text-sm">Retry</button>
    </div>
  )

  if (!formData) return null

  const p = formData.profile ?? {}
  const effects = formData.effects ?? {}

  return (
    <div className="p-4 lg:p-8">
      <motion.div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#38bdf8]/20 border border-[#8b5cf6]/20">
            <Music className="w-5 h-5 text-[#8b5cf6]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-[#a78bfa] to-[#38bdf8] bg-clip-text text-transparent">Âm Nhạc</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Quản lý nhạc nền và music player</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={resetToSaved}
            className="px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Huỷ thay đổi
          </button>
          <button onClick={() => handleSave()} disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#38bdf8] text-white font-medium hover:shadow-lg hover:shadow-[#8b5cf6]/30 transition-all flex items-center gap-2 disabled:opacity-50 text-sm">
            {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Lưu
          </button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Music Info */}
        <motion.div className="glass rounded-2xl p-6 space-y-5"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-base font-semibold text-foreground">Thông tin track</h2>

          {/* Source: URL or Upload */}
          <div className="space-y-3">
            <label className={lbl}>Nguồn nhạc</label>
            <div className="flex gap-1 p-1 bg-secondary/30 rounded-xl">
              <button
                onClick={() => { setUploadMode('url'); setUploadError(null) }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${uploadMode === 'url' ? 'bg-[#8b5cf6] text-white' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <LinkIcon className="w-3.5 h-3.5" /> URL
              </button>
              <button
                onClick={() => { setUploadMode('upload'); setUploadError(null) }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${uploadMode === 'upload' ? 'bg-[#8b5cf6] text-white' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Upload className="w-3.5 h-3.5" /> Upload File
              </button>
            </div>

            {uploadMode === 'url' ? (
              <input
                type="url"
                value={p.music ?? ''}
                onChange={e => setNested('profile.music', e.target.value)}
                className={inp}
                placeholder="https://cdn.example.com/track.mp3"
              />
            ) : (
              <div className="space-y-3">
                <div
                  className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-[#8b5cf6]/50 hover:bg-[#8b5cf6]/5 transition-all"
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault()
                    const file = e.dataTransfer.files[0]
                    if (file && !isUploading) handleFileUpload(file)
                  }}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-[#a78bfa]">Đang upload lên Cloudinary...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-foreground font-medium">Kéo thả file audio vào đây</p>
                      <p className="text-xs text-muted-foreground mt-1">hoặc click để chọn file</p>
                      <p className="text-xs text-muted-foreground mt-2 opacity-70">MP3, WAV, OGG — tối đa 10MB</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/x-wav,audio/wave"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                    e.target.value = ''
                  }}
                />
                {uploadError && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                    <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-destructive font-medium">{uploadError}</p>
                      {uploadError.includes('chưa cấu hình') && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Cần thêm biến môi trường CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET vào Vercel Dashboard.
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {p.music && !isUploading && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-secondary/30 border border-border">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground truncate flex-1">URL hiện tại đã có</p>
                    <button
                      onClick={() => setNested('profile.music', '')}
                      className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors"
                      title="Xoá URL"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className={lbl}>Tên bài hát</label>
            <input type="text" value={p.musicTitle ?? ''} onChange={e => setNested('profile.musicTitle', e.target.value)} className={inp} placeholder="Whispers of the Abyss" />
          </div>
          <div className="space-y-1.5">
            <label className={lbl}>Tên nghệ sĩ</label>
            <input type="text" value={p.musicArtist ?? ''} onChange={e => setNested('profile.musicArtist', e.target.value)} className={inp} placeholder="Void Symphony" />
          </div>
          <div className="space-y-1.5">
            <label className={lbl}>Ảnh bìa (URL)</label>
            <input type="url" value={p.musicCover ?? ''} onChange={e => setNested('profile.musicCover', e.target.value)} className={inp} placeholder="https://cdn.example.com/cover.jpg" />
          </div>
        </motion.div>

        {/* Preview + Settings */}
        <div className="space-y-4">
          <motion.div className="glass rounded-2xl p-6"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-base font-semibold text-foreground mb-4">Nghe thử</h2>

            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6] to-[#38bdf8]" />
                {p.musicCover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.musicCover} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                )}
                {isPlaying && (
                  <div className="absolute inset-0 flex items-end justify-center gap-0.5 p-2 bg-black/30">
                    {[0,1,2,3].map(i => (
                      <motion.div key={i} className="w-1.5 bg-white rounded-full"
                        animate={{ height: ['20%','70%','40%','80%'] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse', delay: i * 0.1 }} />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{p.musicTitle || 'Tên bài hát'}</p>
                <p className="text-sm text-muted-foreground truncate">{p.musicArtist || 'Nghệ sĩ'}</p>
              </div>
            </div>

            {audioError && (
              <p className="text-xs text-destructive mb-3 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Không load được audio. Kiểm tra URL.
              </p>
            )}

            <button
              onClick={handlePreview}
              disabled={!p.music}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] text-white font-medium flex items-center justify-center gap-2 disabled:opacity-40 hover:shadow-lg hover:shadow-[#8b5cf6]/30 transition-all"
            >
              {isPlaying ? <><Pause className="w-4 h-4" /> Tạm dừng</> : <><Play className="w-4 h-4" /> Nghe thử</>}
            </button>
            {!p.music && <p className="text-xs text-muted-foreground text-center mt-2">Nhập URL hoặc upload file để test</p>}
          </motion.div>

          <motion.div className="glass rounded-2xl p-6"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#38bdf8]" /> Cài đặt Player
            </h2>
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
              <div>
                <p className="text-sm font-medium text-foreground">Hiển thị Music Player</p>
                <p className="text-xs text-muted-foreground">Hiển thị player ở trang chủ</p>
              </div>
              <button
                onClick={() => setNested('effects.enableMusicPlayer', !effects.enableMusicPlayer)}
                className={`relative w-12 h-6 rounded-full transition-colors ${effects.enableMusicPlayer ? 'bg-[#8b5cf6]' : 'bg-secondary'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${effects.enableMusicPlayer ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl glass-strong border border-border shadow-2xl max-w-xs">
            {toast.type === 'success'
              ? <div className="w-7 h-7 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center text-[#8b5cf6] flex-shrink-0"><CheckCircle className="w-4 h-4" /></div>
              : <div className="w-7 h-7 rounded-full bg-destructive/20 flex items-center justify-center text-destructive flex-shrink-0"><AlertTriangle className="w-4 h-4" /></div>}
            <p className="text-sm font-medium text-foreground">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
