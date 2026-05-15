'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { User, Save, RotateCcw, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react'
import { useAdminProfile } from '@/hooks/use-admin-profile'

const inp = 'w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50 focus:border-[#8b5cf6] transition-all text-sm'
const lbl = 'text-xs font-medium text-muted-foreground uppercase tracking-wide'

export default function AdminProfilePage() {
  const { formData, setNested, handleSave, resetToSaved, isSaving, loading, error, toast } = useAdminProfile()

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

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <motion.div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#38bdf8]/20 border border-[#8b5cf6]/20">
            <User className="w-5 h-5 text-[#8b5cf6]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-[#a78bfa] to-[#38bdf8] bg-clip-text text-transparent">Profile Editor</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Chỉnh thông tin cá nhân và media URLs</p>
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <motion.div className="glass rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-base font-semibold text-foreground mb-5">Basic Info</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={lbl}>Display Name</label>
                <input type="text" value={p.displayName ?? ''} onChange={e => setNested('profile.displayName', e.target.value)} className={inp} placeholder="Whiskey" />
              </div>
              <div className="space-y-1.5">
                <label className={lbl}>Username</label>
                <input type="text" value={p.username ?? ''} onChange={e => setNested('profile.username', e.target.value)} className={inp} placeholder="whiskey" />
              </div>
              <div className="space-y-1.5">
                <label className={lbl}>Location</label>
                <input type="text" value={p.location ?? ''} onChange={e => setNested('profile.location', e.target.value)} className={inp} placeholder="Vietnam" />
              </div>
              <div className="space-y-1.5">
                <label className={lbl}>Status</label>
                <select value={p.status ?? 'online'} onChange={e => setNested('profile.status', e.target.value)} className={inp}>
                  {['online','idle','dnd','offline'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className={lbl}>Bio <span className="text-xs normal-case font-normal">({(p.bio?.length ?? 0)}/300)</span></label>
                <textarea value={p.bio ?? ''} onChange={e => setNested('profile.bio', e.target.value)} className={inp + ' resize-none'} rows={3} maxLength={300} placeholder="Lost somewhere between code and chaos..." />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className={lbl}>Quote / Mood <span className="text-xs normal-case font-normal">({(p.quote?.length ?? 0)}/200)</span></label>
                <input type="text" value={p.quote ?? ''} onChange={e => setNested('profile.quote', e.target.value)} className={inp} maxLength={200} placeholder="Silence speaks volumes in the void." />
              </div>
            </div>
          </motion.div>

          {/* Media URLs */}
          <motion.div className="glass rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-base font-semibold text-foreground mb-5">Media URLs</h2>
            <div className="space-y-4">
              {[
                { label: 'Avatar URL', key: 'profile.avatar', placeholder: 'https://cdn.example.com/avatar.png' },
                { label: 'Background URL (image/video)', key: 'profile.background', placeholder: 'https://cdn.example.com/bg.mp4' },
              ].map(f => (
                <div key={f.key} className="space-y-1.5">
                  <label className={lbl}>{f.label}</label>
                  <input type="url" value={formData.profile?.[f.key.split('.')[1]] ?? ''} onChange={e => setNested(f.key, e.target.value)} className={inp} placeholder={f.placeholder} />
                </div>
              ))}
              {/* Avatar preview */}
              {p.avatar && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.avatar} alt="Avatar preview" className="w-12 h-12 rounded-full object-cover border-2 border-[#8b5cf6]/30" />
                  <span className="text-xs text-muted-foreground truncate">{p.avatar}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right: Live preview */}
        <motion.div className="space-y-4"
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <div className="glass rounded-2xl p-5 sticky top-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Live Preview
            </h3>
            {/* Mini profile card */}
            <div className="relative">
              <div className="absolute -inset-[1px] bg-gradient-to-r from-[#8b5cf6] via-[#38bdf8] to-[#a78bfa] rounded-2xl opacity-40 blur-sm" />
              <div className="relative glass-strong rounded-2xl p-5 space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#8b5cf6] to-[#38bdf8] rounded-full" />
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#1a1a2e]">
                      {p.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#8b5cf6] to-[#38bdf8] flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-white/80" />
                        </div>
                      )}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[#0a0a15] ${
                      p.status === 'online' ? 'bg-green-500' : p.status === 'idle' ? 'bg-yellow-500' : p.status === 'dnd' ? 'bg-red-500' : 'bg-gray-500'
                    }`} />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <p className="font-bold text-base bg-gradient-to-r from-white to-[#a78bfa] bg-clip-text text-transparent">
                    {p.displayName || 'Display Name'}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">@{p.username || 'username'}</p>
                  <p className="text-xs text-foreground/70 leading-relaxed line-clamp-2">{p.bio || 'Bio will appear here...'}</p>
                  {p.quote && <p className="text-xs text-[#a78bfa] italic">"{p.quote}"</p>}
                  {p.location && <p className="text-xs text-muted-foreground">📍 {p.location}</p>}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Toast */}
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
