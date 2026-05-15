'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, Send, ImageIcon, Video, Bot, ExternalLink, Copy, Check,
  MapPin, Eye, ChevronLeft, X, Upload, AlertTriangle, CheckCircle,
  Github, Youtube, Tag, Wrench, Sparkles, ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { AuroraBackground } from '@/components/abyss/aurora-background'
import { ParticleBackground } from '@/components/abyss/particle-background'
import { MusicPlayer } from '@/components/player/music-player'
import { StatusBadge } from '@/components/profile/status-badge'

/* ─── Social icon map ─── */
function SocialIcon({ platform }: { platform: string }) {
  switch (platform) {
    case 'discord':   return <span className="text-base">💬</span>
    case 'facebook':  return <span className="text-base">📘</span>
    case 'tiktok':    return <span className="text-base">🎵</span>
    case 'youtube':   return <Youtube className="w-4 h-4" />
    case 'github':    return <Github className="w-4 h-4" />
    case 'instagram': return <span className="text-base">📸</span>
    case 'spotify':   return <span className="text-base">🎧</span>
    default:          return <ExternalLink className="w-4 h-4" />
  }
}

const PLATFORM_LABELS: Record<string, string> = {
  discord: 'Discord', facebook: 'Facebook', tiktok: 'TikTok',
  youtube: 'YouTube', github: 'GitHub', instagram: 'Instagram', spotify: 'Spotify',
}

/* ─── Bot types & status ─── */
interface BotDemoMedia { url: string; type: 'image' | 'video'; caption: string }
interface BotData {
  _id: string; name: string; slug: string; avatarUrl: string
  shortDescription: string; longDescription: string; inviteUrl: string
  status: 'active' | 'maintenance' | 'beta' | 'hidden'
  tags: string[]; demoMedia: BotDemoMedia[]; isPublic: boolean; sortOrder: number
}

const BOT_STATUS: Record<string, { label: string; color: string }> = {
  active:      { label: 'Hoạt động', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  maintenance: { label: 'Bảo trì',   color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  beta:        { label: 'Beta',       color: 'text-sky-400 bg-sky-400/10 border-sky-400/20' },
  hidden:      { label: 'Ẩn',         color: 'text-gray-400 bg-gray-400/10 border-gray-400/20' },
}

/* ─── Bot demo media modal ─── */
function BotDemoModal({ bot, onClose }: { bot: BotData; onClose: () => void }) {
  const [idx, setIdx] = useState(0)
  const media = bot.demoMedia
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setIdx(i => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setIdx(i => Math.min(media.length - 1, i + 1))
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [media.length, onClose])
  const cur = media[idx]
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div className="relative w-full max-w-2xl glass-strong rounded-2xl overflow-hidden"
        initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            {bot.avatarUrl
              ? <img src={bot.avatarUrl} alt={bot.name} className="w-7 h-7 rounded-full object-cover" />
              : <div className="w-7 h-7 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center"><Bot className="w-3.5 h-3.5 text-[#8b5cf6]" /></div>}
            <span className="font-semibold text-white text-sm">{bot.name} — Demo</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="relative flex items-center justify-center bg-black/30 min-h-[200px] max-h-[55vh]">
          {cur.type === 'video'
            ? <video src={cur.url} controls className="max-h-[55vh] max-w-full object-contain" />
            : <img src={cur.url} alt={cur.caption} className="max-h-[55vh] max-w-full object-contain" loading="lazy" />}
          {media.length > 1 && <>
            <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}
              className="absolute left-2 p-2 rounded-full glass text-white disabled:opacity-30 hover:bg-white/10"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setIdx(i => Math.min(media.length - 1, i + 1))} disabled={idx === media.length - 1}
              className="absolute right-2 p-2 rounded-full glass text-white disabled:opacity-30 hover:bg-white/10"><ChevronLeft className="w-4 h-4 rotate-180" /></button>
          </>}
        </div>
        <div className="px-5 py-3 flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground truncate">{cur.caption || `Media ${idx + 1}`}</p>
          <span className="text-xs text-muted-foreground shrink-0">{idx + 1}/{media.length}</span>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─── Upload form modal ─── */
function UploadModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [senderName, setSenderName] = useState('')
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { setError('Vui lòng chọn file'); return }
    if (file.size > 100 * 1024 * 1024) { setError('File quá lớn (tối đa 100MB)'); return }

    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const uploadRes = await fetch('/api/media/upload', { method: 'POST', body: fd })
      const uploadData = await uploadRes.json()
      if (!uploadData.success) { setError(uploadData.message || 'Lỗi upload'); return }

      const saveRes = await fetch('/api/media/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: uploadData.type,
          message,
          senderName,
          fileName: file.name,
          fileUrl: uploadData.fileUrl,
          mimeType: uploadData.mimeType,
          fileSize: uploadData.fileSize,
        }),
      })
      const saveData = await saveRes.json()
      if (saveData.success) { setDone(true) }
      else setError(saveData.message || 'Lỗi lưu request')
    } catch { setError('Lỗi kết nối') }
    finally { setUploading(false) }
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div className="w-full max-w-md glass-strong rounded-2xl p-6 border border-border"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold bg-gradient-to-r from-white to-[#a78bfa] bg-clip-text text-transparent">
            Gửi ảnh / video cho tôi
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7 text-green-400" />
            </div>
            <p className="font-medium text-foreground">Đã gửi thành công!</p>
            <p className="text-sm text-muted-foreground">Admin sẽ duyệt sớm nhé. Cảm ơn bạn 💜</p>
            <button onClick={onClose} className="mt-2 px-5 py-2.5 rounded-xl bg-[#8b5cf6] text-white text-sm hover:bg-[#7c3aed] transition-colors">
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">Tên của bạn (tùy chọn)</label>
              <input type="text" value={senderName} onChange={e => setSenderName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-all"
                placeholder="Nickname hoặc tên..." />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">Chọn ảnh hoặc video *</label>
              <div
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                  file ? 'border-[#8b5cf6]/50 bg-[#8b5cf6]/5' : 'border-border hover:border-[#8b5cf6]/30'
                }`}
                onClick={() => inputRef.current?.click()}
              >
                <input ref={inputRef} type="file" className="hidden"
                  accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                  onChange={e => { setFile(e.target.files?.[0] || null); setError('') }} />
                {file ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2 text-[#a78bfa]">
                      {file.type.startsWith('video') ? <Video className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                      <span className="text-sm font-medium">{file.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                    <p className="text-sm text-muted-foreground">Click để chọn file</p>
                    <p className="text-xs text-muted-foreground/60">JPG, PNG, WebP, GIF, MP4, WebM · Tối đa 100MB</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">Lời nhắn (tùy chọn)</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-all resize-none"
                rows={3} placeholder="Viết gì đó..." />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-2.5">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button type="submit" disabled={uploading || !file}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] text-white font-medium hover:shadow-lg hover:shadow-[#8b5cf6]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm">
              {uploading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Send className="w-4 h-4" />}
              {uploading ? 'Đang gửi...' : 'Gửi cho admin'}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  )
}


/* ─── Main page ─── */
export default function ProfilePage() {
  const [config, setConfig] = useState<any>(null)
  const [bots, setBots] = useState<BotData[]>([])
  const [mounted, setMounted] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [demoBot, setDemoBot] = useState<BotData | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/profile').then(r => r.json()),
      fetch('/api/bots').then(r => r.json()),
    ]).then(([profile, botsJson]) => {
      if (profile.success) setConfig(profile.data)
      if (botsJson.success) setBots(botsJson.data)
    }).finally(() => setMounted(true))
  }, [])

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!mounted) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a15]">
      <div className="w-8 h-8 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!config) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a15] text-white">
      <p className="text-muted-foreground">Không tải được dữ liệu profile.</p>
    </div>
  )

  const { profile, social, bank } = config
  const activeSocials = social ? Object.entries(social as Record<string, string>).filter(([, v]) => v?.trim()) : []
  const hasDonate = bank?.bankName || bank?.accountNumber || bank?.qrCode

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AuroraBackground />
      <ParticleBackground />

      <div className="relative z-10 min-h-screen px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Back */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Link href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
              <ChevronLeft className="w-4 h-4" />
              Trang chủ
            </Link>
          </motion.div>

          {/* ── Profile Header ── */}
          <motion.div className="glass-strong rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#8b5cf6] via-[#38bdf8] to-[#a78bfa] rounded-full opacity-60 blur-md" />
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#1a1a2e]">
                  {profile.avatar ? (
                    <Image src={profile.avatar} alt={profile.displayName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#8b5cf6] to-[#38bdf8] flex items-center justify-center text-3xl font-bold text-white">
                      {profile.displayName?.[0]?.toUpperCase() ?? '?'}
                    </div>
                  )}
                </div>
                <StatusBadge status={profile.status ?? 'online'} />
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-[#a78bfa] to-[#38bdf8] bg-clip-text text-transparent">
                  {profile.displayName}
                </h1>
                {profile.username && (
                  <p className="text-muted-foreground text-sm font-mono mt-0.5">@{profile.username}</p>
                )}
                {profile.bio && (
                  <p className="text-foreground/80 text-sm mt-2 leading-relaxed">{profile.bio}</p>
                )}
                {profile.quote && (
                  <p className="text-[#a78bfa] text-xs italic mt-1.5">"{profile.quote}"</p>
                )}
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-muted-foreground">
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {profile.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {(profile.viewCount ?? 0).toLocaleString()} lượt xem
                  </span>
                </div>
              </div>
            </div>

            {/* Send media button */}
            <div className="mt-5 pt-5 border-t border-border/50 flex justify-center">
              <motion.button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] text-white font-medium text-sm hover:shadow-lg hover:shadow-[#8b5cf6]/30 transition-all"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Upload className="w-4 h-4" />
                Gửi ảnh / video cho tôi
              </motion.button>
            </div>
          </motion.div>

          {/* ── Social Links ── */}
          {activeSocials.length > 0 && (
            <motion.div className="glass-strong rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Mạng xã hội</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {activeSocials.map(([platform, url]) => (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-secondary/50 border border-border hover:border-[#8b5cf6]/40 hover:bg-secondary transition-all text-sm group">
                    <span className="text-foreground/70 group-hover:text-foreground transition-colors">
                      <SocialIcon platform={platform} />
                    </span>
                    <span className="font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                      {PLATFORM_LABELS[platform] ?? platform}
                    </span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground/40 ml-auto" />
                  </a>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Donate ── */}
          {hasDonate && (
            <motion.div className="glass-strong rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400" /> Donate / Ủng hộ
              </h2>

              <div className="flex flex-col sm:flex-row gap-5 items-start">
                {bank.qrCode && (
                  <div className="flex-shrink-0">
                    <div className="w-36 h-36 bg-white rounded-xl p-2 shadow-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={bank.qrCode} alt="QR Donate" className="w-full h-full object-contain rounded-lg" />
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-2">Quét QR để donate</p>
                  </div>
                )}

                <div className="flex-1 space-y-2.5">
                  {bank.bankName && (
                    <div className="flex justify-between items-center p-3 rounded-xl bg-secondary/40 border border-border/50">
                      <span className="text-xs text-muted-foreground">Ngân hàng</span>
                      <span className="font-medium text-sm">{bank.bankName}</span>
                    </div>
                  )}
                  {bank.accountNumber && (
                    <div className="flex justify-between items-center p-3 rounded-xl bg-secondary/40 border border-border/50">
                      <span className="text-xs text-muted-foreground">Số TK</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-sm">{bank.accountNumber}</span>
                        <button onClick={() => copy(bank.accountNumber, 'acc')}
                          className="p-1 rounded-lg hover:bg-secondary transition-colors">
                          {copied === 'acc' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                        </button>
                      </div>
                    </div>
                  )}
                  {bank.accountName && (
                    <div className="flex justify-between items-center p-3 rounded-xl bg-secondary/40 border border-border/50">
                      <span className="text-xs text-muted-foreground">Chủ TK</span>
                      <span className="font-medium text-sm">{bank.accountName}</span>
                    </div>
                  )}
                  {bank.transferContent && (
                    <div className="flex justify-between items-center p-3 rounded-xl bg-secondary/40 border border-border/50">
                      <span className="text-xs text-muted-foreground">Nội dung</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#a78bfa]">{bank.transferContent}</span>
                        <button onClick={() => copy(bank.transferContent, 'msg')}
                          className="p-1 rounded-lg hover:bg-secondary transition-colors">
                          {copied === 'msg' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                        </button>
                      </div>
                    </div>
                  )}
                  <Link href="/donate"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#ef4444]/20 to-[#f87171]/20 text-red-400 hover:from-[#ef4444]/30 hover:to-[#f87171]/30 border border-red-500/20 text-sm font-medium transition-all">
                    <Heart className="w-4 h-4" /> Xem trang Donate đầy đủ
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Discord Bots ── */}
          {bots.length > 0 && (
            <motion.div className="glass-strong rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#38bdf8]" /> Discord Bot
                </h2>
                <a href="/bots" className="inline-flex items-center gap-1 text-xs text-[#a78bfa] hover:text-white transition-colors group">
                  Xem tất cả <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>

              <div className="space-y-4">
                {bots.map(bot => {
                  const st = BOT_STATUS[bot.status] ?? BOT_STATUS.active
                  const StatusIcon = bot.status === 'maintenance' ? Wrench : bot.status === 'beta' ? Sparkles : null
                  return (
                    <div key={bot._id} className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50 hover:border-[#8b5cf6]/30 transition-colors">
                      {bot.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={bot.avatarUrl} alt={bot.name} className="w-12 h-12 rounded-xl object-cover border border-border shrink-0" loading="lazy" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center shrink-0">
                          <Bot className="w-6 h-6 text-[#8b5cf6]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-white text-sm">{bot.name}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${st.color}`}>
                            {StatusIcon && <StatusIcon className="w-2.5 h-2.5" />}
                            {st.label}
                          </span>
                        </div>
                        {bot.shortDescription && (
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-2">{bot.shortDescription}</p>
                        )}
                        {bot.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {bot.tags.slice(0, 4).map(tag => (
                              <span key={tag} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] bg-[#8b5cf6]/10 text-[#a78bfa] border border-[#8b5cf6]/15">
                                <Tag className="w-2 h-2" />{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          {bot.inviteUrl && bot.status !== 'maintenance' ? (
                            <a href={bot.inviteUrl} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5865F2]/20 text-[#818cf8] hover:bg-[#5865F2]/30 border border-[#5865F2]/25 text-xs font-medium transition-all">
                              <ExternalLink className="w-3 h-3" /> Mời vào server
                            </a>
                          ) : bot.status === 'maintenance' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/10 text-amber-400/60 border border-amber-400/15 text-xs">
                              <Wrench className="w-3 h-3" /> Đang bảo trì
                            </span>
                          ) : null}
                          {bot.demoMedia.length > 0 && (
                            <button onClick={() => setDemoBot(bot)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border border-border hover:border-[#8b5cf6]/30 text-muted-foreground hover:text-white text-xs transition-all">
                              <ImageIcon className="w-3 h-3" /> Demo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {demoBot && demoBot.demoMedia.length > 0 && (
          <BotDemoModal bot={demoBot} onClose={() => setDemoBot(null)} />
        )}
      </AnimatePresence>

      <MusicPlayer src={config.profile?.music} />
    </main>
  )
}
