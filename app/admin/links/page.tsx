'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Link2, Save, RotateCcw, ExternalLink, Copy, Bot, CheckCircle, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { useAdminProfile } from '@/hooks/use-admin-profile'

const inp = 'flex-1 px-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50 focus:border-[#8b5cf6] transition-all text-sm'

const PLATFORMS = [
  { key: 'discord',   label: 'Discord',   icon: '💬', placeholder: 'https://discord.gg/...' },
  { key: 'tiktok',    label: 'TikTok',    icon: '🎵', placeholder: 'https://tiktok.com/@...' },
  { key: 'facebook',  label: 'Facebook',  icon: '📘', placeholder: 'https://facebook.com/...' },
  { key: 'github',    label: 'GitHub',    icon: '🐙', placeholder: 'https://github.com/...' },
  { key: 'youtube',   label: 'YouTube',   icon: '▶️', placeholder: 'https://youtube.com/@...' },
  { key: 'instagram', label: 'Instagram', icon: '📸', placeholder: 'https://instagram.com/...' },
  { key: 'spotify',   label: 'Spotify',   icon: '🎧', placeholder: 'https://open.spotify.com/...' },
]

export default function AdminLinksPage() {
  const { formData, setNested, handleSave, resetToSaved, isSaving, loading, error, toast } = useAdminProfile()
  const [copied, setCopied] = useState<string | null>(null)

  const copyLink = (text: string, key: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const isValidUrl = (url: string) => {
    try { new URL(url); return true } catch { return false }
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

  const social = formData.social ?? {}
  const botInvite = formData.botInvite ?? ''

  return (
    <div className="p-4 lg:p-8">
      <motion.div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#38bdf8]/20 border border-[#8b5cf6]/20">
            <Link2 className="w-5 h-5 text-[#8b5cf6]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-[#a78bfa] to-[#38bdf8] bg-clip-text text-transparent">Social Links</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Quản lý link mạng xã hội và bot invite</p>
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
        {/* Social platforms */}
        <motion.div className="glass rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-base font-semibold text-foreground mb-5">Mạng xã hội</h2>
          <div className="space-y-3">
            {PLATFORMS.map(platform => {
              const val = social[platform.key] ?? ''
              const valid = val && isValidUrl(val)
              return (
                <div key={platform.key}>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">
                    {platform.icon} {platform.label}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={val}
                      onChange={e => setNested(`social.${platform.key}`, e.target.value)}
                      className={inp}
                      placeholder={platform.placeholder}
                    />
                    <button
                      onClick={() => copyLink(val, platform.key)}
                      disabled={!val}
                      className="p-3 rounded-xl bg-secondary/50 border border-border hover:bg-secondary disabled:opacity-40 transition-colors"
                      title="Copy"
                    >
                      {copied === platform.key ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                    </button>
                    <button
                      onClick={() => valid && window.open(val, '_blank', 'noopener,noreferrer')}
                      disabled={!valid}
                      className="p-3 rounded-xl bg-secondary/50 border border-border hover:bg-secondary disabled:opacity-40 transition-colors"
                      title="Open link"
                    >
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Bot invite */}
        <motion.div className="space-y-4"
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <div className="glass rounded-2xl p-6">
            <h2 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#38bdf8]" /> Discord Bot Invite
            </h2>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={botInvite}
                  onChange={e => setNested('botInvite', e.target.value)}
                  className={inp}
                  placeholder="https://discord.com/api/oauth2/authorize?..."
                />
                <button
                  onClick={() => copyLink(botInvite, 'bot')}
                  disabled={!botInvite}
                  className="p-3 rounded-xl bg-secondary/50 border border-border hover:bg-secondary disabled:opacity-40 transition-colors">
                  {copied === 'bot' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                </button>
                <button
                  onClick={() => botInvite && isValidUrl(botInvite) && window.open(botInvite, '_blank')}
                  disabled={!botInvite || !isValidUrl(botInvite)}
                  className="p-3 rounded-xl bg-secondary/50 border border-border hover:bg-secondary disabled:opacity-40 transition-colors">
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Nếu để trống, nút Invite Bot sẽ hiện toast lỗi thay vì link chết.
              </p>
            </div>
          </div>

          {/* Quick status */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Trạng thái link</h2>
            <div className="space-y-2">
              {PLATFORMS.map(p => {
                const val = social[p.key] ?? ''
                return (
                  <div key={p.key} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{p.icon} {p.label}</span>
                    <span className={`px-2 py-0.5 rounded-full ${val && isValidUrl(val) ? 'bg-green-500/20 text-green-400' : 'bg-secondary text-muted-foreground'}`}>
                      {val && isValidUrl(val) ? 'Đang dùng' : 'Chưa cài'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
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
