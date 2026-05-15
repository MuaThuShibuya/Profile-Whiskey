'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Music, Save, RotateCcw, Play, Pause, CheckCircle, AlertTriangle, Zap } from 'lucide-react'
import { useAdminProfile } from '@/hooks/use-admin-profile'

const inp = 'w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50 focus:border-[#8b5cf6] transition-all text-sm'
const lbl = 'text-xs font-medium text-muted-foreground uppercase tracking-wide'

export default function AdminMusicPage() {
  const { formData, setNested, handleSave, resetToSaved, isSaving, loading, error, toast } = useAdminProfile()
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    }
  }, [])

  const handlePreview = () => {
    const url = formData?.profile?.music || previewUrl
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-[#a78bfa] to-[#38bdf8] bg-clip-text text-transparent">Music Manager</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Quản lý nhạc nền và music player</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={resetToSaved}
            className="px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Discard
          </button>
          <button onClick={() => handleSave()} disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#38bdf8] text-white font-medium hover:shadow-lg hover:shadow-[#8b5cf6]/30 transition-all flex items-center gap-2 disabled:opacity-50 text-sm">
            {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Save to MongoDB
          </button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Music Info */}
        <motion.div className="glass rounded-2xl p-6 space-y-5"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-base font-semibold text-foreground">Track Info</h2>

          <div className="space-y-1.5">
            <label className={lbl}>Music URL (.mp3 / .ogg / .wav)</label>
            <input type="url" value={p.music ?? ''} onChange={e => setNested('profile.music', e.target.value)} className={inp} placeholder="https://cdn.example.com/track.mp3" />
          </div>
          <div className="space-y-1.5">
            <label className={lbl}>Track Title</label>
            <input type="text" value={p.musicTitle ?? ''} onChange={e => setNested('profile.musicTitle', e.target.value)} className={inp} placeholder="Whispers of the Abyss" />
          </div>
          <div className="space-y-1.5">
            <label className={lbl}>Artist Name</label>
            <input type="text" value={p.musicArtist ?? ''} onChange={e => setNested('profile.musicArtist', e.target.value)} className={inp} placeholder="Void Symphony" />
          </div>
          <div className="space-y-1.5">
            <label className={lbl}>Cover Image URL</label>
            <input type="url" value={p.musicCover ?? ''} onChange={e => setNested('profile.musicCover', e.target.value)} className={inp} placeholder="https://cdn.example.com/cover.jpg" />
          </div>
        </motion.div>

        {/* Preview + Toggle */}
        <div className="space-y-4">
          {/* Audio preview player */}
          <motion.div className="glass rounded-2xl p-6"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-base font-semibold text-foreground mb-4">Test Playback</h2>

            {/* Album art preview */}
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
                <p className="font-medium text-foreground truncate">{p.musicTitle || 'Track Title'}</p>
                <p className="text-sm text-muted-foreground truncate">{p.musicArtist || 'Artist Name'}</p>
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
              {isPlaying ? <><Pause className="w-4 h-4" /> Pause Preview</> : <><Play className="w-4 h-4" /> Test Play</>}
            </button>
            {!p.music && <p className="text-xs text-muted-foreground text-center mt-2">Nhập Music URL để test</p>}
          </motion.div>

          {/* Music player toggle */}
          <motion.div className="glass rounded-2xl p-6"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#38bdf8]" /> Player Settings
            </h2>
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
              <div>
                <p className="text-sm font-medium text-foreground">Show Music Player</p>
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
