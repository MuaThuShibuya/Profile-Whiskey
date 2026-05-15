'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, ExternalLink, Tag, Play, X, ChevronLeft, ChevronRight,
  Wrench, Sparkles, Eye, EyeOff, Lock,
} from 'lucide-react'
import Link from 'next/link'
import { AuroraBackground } from '@/components/abyss/aurora-background'
import { ParticleBackground } from '@/components/abyss/particle-background'

/* ─── Types ─── */
interface DemoMedia {
  url: string
  type: 'image' | 'video'
  caption: string
}

interface BotData {
  _id: string
  name: string
  slug: string
  avatarUrl: string
  shortDescription: string
  longDescription: string
  inviteUrl: string
  status: 'active' | 'maintenance' | 'beta' | 'hidden'
  tags: string[]
  demoMedia: DemoMedia[]
  isPublic: boolean
  sortOrder: number
}

/* ─── Status badge ─── */
const STATUS_CONFIG = {
  active:      { label: 'Hoạt động',  color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  maintenance: { label: 'Bảo trì',    color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  beta:        { label: 'Beta',        color: 'text-sky-400 bg-sky-400/10 border-sky-400/20' },
  hidden:      { label: 'Ẩn',          color: 'text-gray-400 bg-gray-400/10 border-gray-400/20' },
}

function StatusBadge({ status }: { status: BotData['status'] }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.active
  const Icon = status === 'maintenance' ? Wrench : status === 'beta' ? Sparkles : null
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {cfg.label}
    </span>
  )
}

/* ─── Demo media modal ─── */
function DemoModal({ bot, onClose }: { bot: BotData; onClose: () => void }) {
  const [index, setIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const media = bot.demoMedia

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setIndex(i => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setIndex(i => Math.min(media.length - 1, i + 1))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [media.length, onClose])

  useEffect(() => {
    // Pause video when navigating away
    if (videoRef.current) videoRef.current.pause()
  }, [index])

  const current = media[index]

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative glass-strong rounded-2xl overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              {bot.avatarUrl ? (
                <img src={bot.avatarUrl} alt={bot.name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[#8b5cf6]" />
                </div>
              )}
              <span className="font-semibold text-white">{bot.name} — Demo</span>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Media */}
          <div className="relative flex-1 min-h-0 bg-black/40 flex items-center justify-center">
            {current.type === 'video' ? (
              <video
                ref={videoRef}
                src={current.url}
                controls
                className="max-h-[55vh] max-w-full object-contain"
              />
            ) : (
              <img
                src={current.url}
                alt={current.caption || `Demo ${index + 1}`}
                className="max-h-[55vh] max-w-full object-contain"
                loading="lazy"
              />
            )}

            {/* Prev / Next */}
            {media.length > 1 && (
              <>
                <button
                  onClick={() => setIndex(i => Math.max(0, i - 1))}
                  disabled={index === 0}
                  className="absolute left-3 p-2 rounded-full glass border border-border text-white disabled:opacity-30 hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIndex(i => Math.min(media.length - 1, i + 1))}
                  disabled={index === media.length - 1}
                  className="absolute right-3 p-2 rounded-full glass border border-border text-white disabled:opacity-30 hover:bg-white/10 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Caption + counter */}
          <div className="px-5 py-3 border-t border-border flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground truncate">
              {current.caption || `Ảnh / Video ${index + 1}`}
            </p>
            <span className="text-xs text-muted-foreground shrink-0">
              {index + 1} / {media.length}
            </span>
          </div>

          {/* Thumbnail strip */}
          {media.length > 1 && (
            <div className="px-5 pb-4 flex gap-2 overflow-x-auto">
              {media.map((m, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`relative shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === index ? 'border-[#8b5cf6]' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  {m.type === 'video' ? (
                    <div className="w-full h-full bg-black/40 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <img src={m.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  )}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ─── Skeleton card ─── */
function BotCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-6 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-2xl bg-white/5 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-white/5 rounded w-2/3" />
          <div className="h-4 bg-white/5 rounded w-1/3" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-white/5 rounded" />
        <div className="h-3 bg-white/5 rounded w-5/6" />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-5 w-14 bg-white/5 rounded-full" />
        <div className="h-5 w-16 bg-white/5 rounded-full" />
      </div>
      <div className="flex gap-3">
        <div className="flex-1 h-9 bg-white/5 rounded-lg" />
        <div className="h-9 w-24 bg-white/5 rounded-lg" />
      </div>
    </div>
  )
}

/* ─── Bot card ─── */
function BotCard({ bot, onViewDemo }: { bot: BotData; onViewDemo: () => void }) {
  return (
    <motion.div
      className="glass rounded-2xl p-6 flex flex-col gap-4 hover:border-[#8b5cf6]/30 transition-colors group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        {bot.avatarUrl ? (
          <img
            src={bot.avatarUrl}
            alt={bot.name}
            className="w-16 h-16 rounded-2xl object-cover border border-border shrink-0"
            loading="lazy"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center shrink-0">
            <Bot className="w-8 h-8 text-[#8b5cf6]" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-lg leading-tight truncate group-hover:text-[#a78bfa] transition-colors">
            {bot.name}
          </h3>
          <div className="mt-1">
            <StatusBadge status={bot.status} />
          </div>
        </div>
      </div>

      {/* Description */}
      {bot.shortDescription && (
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {bot.shortDescription}
        </p>
      )}

      {/* Tags */}
      {bot.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {bot.tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[#8b5cf6]/10 text-[#a78bfa] border border-[#8b5cf6]/15">
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Demo media strip (first 3 thumbnails, lazy) */}
      {bot.demoMedia.length > 0 && (
        <div className="flex gap-2">
          {bot.demoMedia.slice(0, 3).map((m, i) => (
            <button
              key={i}
              onClick={onViewDemo}
              className="relative w-16 h-16 rounded-lg overflow-hidden border border-border hover:border-[#8b5cf6]/40 transition-colors group/thumb"
            >
              {m.type === 'video' ? (
                <div className="w-full h-full bg-black/40 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white/80 group-hover/thumb:text-white transition-colors" />
                </div>
              ) : (
                <img src={m.url} alt="" className="w-full h-full object-cover" loading="lazy" />
              )}
              {i === 2 && bot.demoMedia.length > 3 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-medium">
                  +{bot.demoMedia.length - 3}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-auto pt-1">
        {bot.inviteUrl ? (
          <a
            href={bot.inviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              bot.status === 'maintenance'
                ? 'bg-white/5 text-muted-foreground cursor-not-allowed'
                : 'bg-[#8b5cf6] hover:bg-[#7c3aed] text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]'
            }`}
            onClick={e => bot.status === 'maintenance' && e.preventDefault()}
          >
            {bot.status === 'maintenance' ? (
              <><Wrench className="w-4 h-4" /> Đang bảo trì</>
            ) : (
              <><ExternalLink className="w-4 h-4" /> Mời vào server</>
            )}
          </a>
        ) : (
          <button disabled className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white/5 text-muted-foreground cursor-not-allowed">
            <Lock className="w-4 h-4" /> Chưa có link
          </button>
        )}

        {bot.demoMedia.length > 0 && (
          <button
            onClick={onViewDemo}
            className="px-4 py-2 rounded-lg text-sm font-medium glass border border-border hover:border-[#8b5cf6]/40 text-muted-foreground hover:text-white transition-all"
          >
            Xem demo
          </button>
        )}
      </div>
    </motion.div>
  )
}

/* ─── Main page ─── */
export default function BotsPage() {
  const [bots, setBots] = useState<BotData[]>([])
  const [loading, setLoading] = useState(true)
  const [demoBot, setDemoBot] = useState<BotData | null>(null)

  useEffect(() => {
    fetch('/api/bots')
      .then(r => r.json())
      .then(json => {
        if (json.success) setBots(json.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AuroraBackground />
      <ParticleBackground />

      <div className="relative z-10 min-h-screen px-4 py-20">
        {/* Back link */}
        <div className="max-w-5xl mx-auto mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Quay về trang chủ
          </Link>
        </div>

        {/* Page header */}
        <motion.div
          className="max-w-5xl mx-auto mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-muted-foreground mb-6">
            <Bot className="w-4 h-4 text-[#8b5cf6]" />
            <span>Discord Bots</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Danh sách{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#38bdf8]">
              Discord Bot
            </span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Các bot Discord tôi phát triển — mời vào server của bạn hoặc xem demo để khám phá tính năng.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <BotCardSkeleton key={i} />)}
            </div>
          ) : bots.length === 0 ? (
            <motion.div
              className="text-center py-24"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-[#8b5cf6]/50" />
              </div>
              <p className="text-muted-foreground text-lg">Chưa có bot nào được công khai.</p>
              <p className="text-muted-foreground/60 text-sm mt-2">Hãy quay lại sau nhé!</p>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.08 }}
            >
              {bots.map(bot => (
                <BotCard
                  key={bot._id}
                  bot={bot}
                  onViewDemo={() => setDemoBot(bot)}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Demo modal */}
      {demoBot && demoBot.demoMedia.length > 0 && (
        <DemoModal bot={demoBot} onClose={() => setDemoBot(null)} />
      )}
    </main>
  )
}
