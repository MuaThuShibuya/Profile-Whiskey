'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye, Heart, MessageSquare, TrendingUp, User, Settings,
  Save, AlertTriangle, CheckCircle, Clock, Trash2, X,
  BarChart3, Palette, Zap, Gauge, Image as ImageIcon,
  Mail, ShieldAlert, RefreshCw, Bot, Music, Link2,
} from 'lucide-react'

type Tab =
  | 'overview' | 'profile' | 'social' | 'bank'
  | 'theme' | 'effects' | 'performance'
  | 'media' | 'contact' | 'danger'

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'overview',     label: 'Tổng quan',      icon: BarChart3 },
  { id: 'profile',      label: 'Profile',         icon: User },
  { id: 'social',       label: 'Mạng xã hội',    icon: Link2 },
  { id: 'bank',         label: 'Donate',          icon: Heart },
  { id: 'theme',        label: 'Giao diện',       icon: Palette },
  { id: 'effects',      label: 'Hiệu ứng',        icon: Zap },
  { id: 'performance',  label: 'Hiệu suất',       icon: Gauge },
  { id: 'media',        label: 'Media nhận',      icon: ImageIcon },
  { id: 'contact',      label: 'Tin nhắn',        icon: Mail },
  { id: 'danger',       label: 'Vùng nguy hiểm',  icon: ShieldAlert },
]

export default function AdminDashboard() {
  const [config, setConfig] = useState<any>(null)
  const [formData, setFormData] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [confirmReset, setConfirmReset] = useState<string | null>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchAll = useCallback(async () => {
    try {
      const [pRes, rRes, cRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/media/request'),
        fetch('/api/contact'),
      ])
      const [pJson, rJson, cJson] = await Promise.all([
        pRes.json(), rRes.json(), cRes.json(),
      ])
      if (pJson.success) { setConfig(pJson.data); setFormData(pJson.data) }
      if (rJson.success) setRequests(rJson.data)
      if (cJson.success) setContacts(cJson.data)
    } catch (e) {
      console.error('Lỗi tải admin data:', e)
    } finally {
      setMounted(true)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success) {
        showToast('Đã lưu thành công vào MongoDB! 🌌')
        setConfig(data.data)
        setFormData(data.data)
      } else {
        showToast(data.message || 'Lỗi khi lưu', 'error')
      }
    } catch {
      showToast('Lỗi kết nối server', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleMediaStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/media/request/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (data.success) {
        setRequests(prev => prev.map(r => r._id === id ? { ...r, status } : r))
        showToast(`Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} request`)
      }
    } catch { showToast('Lỗi cập nhật', 'error') }
  }

  const handleMediaDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/media/request/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setRequests(prev => prev.filter(r => r._id !== id))
        showToast('Đã xóa request')
      }
    } catch { showToast('Lỗi xóa', 'error') }
  }

  const handleDanger = async (action: string) => {
    if (confirmReset !== action) { setConfirmReset(action); return }
    setConfirmReset(null)
    try {
      if (action === 'resetViews') {
        const res = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 'profile.viewCount': 0 }),
        })
        const d = await res.json()
        if (d.success) { showToast('Đã reset view count'); fetchAll() }
      } else if (action === 'resetProfile') {
        const { DEFAULT_PROFILE } = await import('@/lib/default-config')
        const res = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(DEFAULT_PROFILE),
        })
        const d = await res.json()
        if (d.success) { showToast('Đã reset profile về mặc định'); fetchAll() }
      }
    } catch { showToast('Lỗi thực hiện action', 'error') }
  }

  const setNested = (path: string, value: any) => {
    const keys = path.split('.')
    setFormData((prev: any) => {
      const next = { ...prev }
      let cur = next
      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = { ...cur[keys[i]] }
        cur = cur[keys[i]]
      }
      cur[keys[keys.length - 1]] = value
      return next
    })
  }

  const inp = 'w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50 focus:border-[#8b5cf6] transition-all'
  const lbl = 'text-sm font-medium text-muted-foreground'

  const isEditorTab = !['overview', 'media', 'contact', 'danger'].includes(activeTab)

  if (!mounted || !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 relative">
      {/* Header */}
      <motion.div
        className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-[#a78bfa] to-[#38bdf8] bg-clip-text text-transparent">
            Abyss Control Center
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your dark domain</p>
        </div>
        {isEditorTab && (
          <motion.button
            onClick={handleSave} disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#38bdf8] text-white font-medium hover:shadow-lg hover:shadow-[#8b5cf6]/30 transition-all flex items-center gap-2 disabled:opacity-50"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          >
            {isSaving
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Save className="w-4 h-4" />}
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </motion.button>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1.5 mb-6 pb-2 scrollbar-hide">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-[#8b5cf6]/20 to-[#38bdf8]/20 text-white border border-[#8b5cf6]/40'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            {tab.id === 'media' && requests.filter(r => r.status === 'pending').length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px]">
                {requests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ===== OVERVIEW ===== */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Views', value: config?.profile?.viewCount?.toLocaleString() ?? '0', icon: Eye, color: 'from-[#8b5cf6] to-[#a78bfa]' },
              { label: 'Media Requests', value: requests.length.toString(), icon: ImageIcon, color: 'from-[#38bdf8] to-[#22d3ee]' },
              { label: 'Pending', value: requests.filter(r => r.status === 'pending').length.toString(), icon: Clock, color: 'from-[#f59e0b] to-[#fbbf24]' },
              { label: 'Messages', value: contacts.length.toString(), icon: Mail, color: 'from-[#ec4899] to-[#f472b6]' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="glass rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-xs">{s.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${s.color}`}>
                    <s.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#8b5cf6]" /> MongoDB Status
            </h2>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-muted-foreground">
                Connected · DB: <span className="text-foreground font-mono">{process.env.NEXT_PUBLIC_DB_NAME || 'profilewebsite'}</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Last updated: {config?.updatedAt ? new Date(config.updatedAt).toLocaleString('vi-VN') : 'N/A'}
            </p>
          </div>
        </motion.div>
      )}

      {/* ===== PROFILE ===== */}
      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><User className="w-5 h-5 text-[#8b5cf6]" /> Profile Info</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { label: 'Display Name', key: 'profile.displayName', type: 'text' },
                { label: 'Username', key: 'profile.username', type: 'text' },
                { label: 'Location', key: 'profile.location', type: 'text' },
                { label: 'Status', key: 'profile.status', type: 'select', options: ['online','idle','dnd','offline'] },
              ].map(f => (
                <div key={f.key} className="space-y-2">
                  <label className={lbl}>{f.label}</label>
                  {f.type === 'select' ? (
                    <select value={formData.profile?.[f.key.split('.')[1]] ?? ''} onChange={e => setNested(f.key, e.target.value)} className={inp}>
                      {f.options!.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type="text" value={formData.profile?.[f.key.split('.')[1]] ?? ''} onChange={e => setNested(f.key, e.target.value)} className={inp} />
                  )}
                </div>
              ))}
              <div className="md:col-span-2 space-y-2">
                <label className={lbl}>Bio <span className="text-xs">({(formData.profile?.bio?.length ?? 0)}/300)</span></label>
                <textarea value={formData.profile?.bio ?? ''} onChange={e => setNested('profile.bio', e.target.value)} className={inp + ' resize-none'} rows={3} maxLength={300} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className={lbl}>Quote <span className="text-xs">({(formData.profile?.quote?.length ?? 0)}/200)</span></label>
                <input type="text" value={formData.profile?.quote ?? ''} onChange={e => setNested('profile.quote', e.target.value)} className={inp} maxLength={200} />
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><Music className="w-5 h-5 text-[#38bdf8]" /> Media URLs</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { label: 'Avatar URL', key: 'profile.avatar', placeholder: 'https://cdn.example.com/avatar.png' },
                { label: 'Background URL (ảnh hoặc video)', key: 'profile.background', placeholder: 'https://cdn.example.com/bg.mp4' },
                { label: 'Music URL (.mp3 / .ogg / .wav)', key: 'profile.music', placeholder: 'https://cdn.example.com/track.mp3' },
                { label: 'Tên bài hát', key: 'profile.musicTitle', placeholder: 'Tên track...' },
                { label: 'Nghệ sĩ', key: 'profile.musicArtist', placeholder: 'Tên nghệ sĩ...' },
              ].map(f => (
                <div key={f.key} className="space-y-2">
                  <label className={lbl}>{f.label}</label>
                  <input type="url" value={formData.profile?.[f.key.split('.')[1]] ?? ''} onChange={e => setNested(f.key, e.target.value)} className={inp} placeholder={f.placeholder} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== SOCIAL ===== */}
      {activeTab === 'social' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><Link2 className="w-5 h-5 text-[#8b5cf6]" /> Social Links</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {['discord','tiktok','facebook','github','youtube','instagram','spotify'].map(platform => (
                <div key={platform} className="space-y-2">
                  <label className={lbl + ' capitalize'}>{platform}</label>
                  <input type="url" value={formData.social?.[platform] ?? ''} onChange={e => setNested(`social.${platform}`, e.target.value)} className={inp} placeholder={`https://${platform}.com/...`} />
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><Bot className="w-5 h-5 text-[#38bdf8]" /> Discord Bot</h2>
            <div className="space-y-2">
              <label className={lbl}>Bot Invite URL</label>
              <input type="url" value={formData.botInvite ?? ''} onChange={e => setNested('botInvite', e.target.value)} className={inp} placeholder="https://discord.com/api/oauth2/authorize?..." />
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== BANK / DONATION ===== */}
      {activeTab === 'bank' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><Heart className="w-5 h-5 text-red-400" /> Donation Info</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { label: 'Tên ngân hàng', key: 'bank.bankName' },
                { label: 'Số tài khoản', key: 'bank.accountNumber' },
                { label: 'Tên chủ tài khoản', key: 'bank.accountName' },
                { label: 'Nội dung chuyển khoản', key: 'bank.transferContent' },
                { label: 'QR Code URL', key: 'bank.qrCode' },
              ].map(f => (
                <div key={f.key} className="space-y-2">
                  <label className={lbl}>{f.label}</label>
                  <input type="text" value={formData.bank?.[f.key.split('.')[1]] ?? ''} onChange={e => setNested(f.key, e.target.value)} className={inp} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== THEME ===== */}
      {activeTab === 'theme' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><Palette className="w-5 h-5 text-[#8b5cf6]" /> Colors</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { label: 'Primary Color', key: 'theme.primaryColor' },
                { label: 'Accent Color', key: 'theme.accentColor' },
              ].map(f => (
                <div key={f.key} className="space-y-2">
                  <label className={lbl}>{f.label}</label>
                  <div className="flex gap-3">
                    <input type="color" value={formData.theme?.[f.key.split('.')[1]] ?? '#8b5cf6'} onChange={e => setNested(f.key, e.target.value)} className="w-12 h-12 rounded-xl border border-border bg-transparent cursor-pointer" />
                    <input type="text" value={formData.theme?.[f.key.split('.')[1]] ?? ''} onChange={e => setNested(f.key, e.target.value)} className={inp + ' font-mono'} placeholder="#8b5cf6" />
                  </div>
                </div>
              ))}
              <div className="space-y-2">
                <label className={lbl}>Font Family</label>
                <select value={formData.theme?.fontFamily ?? 'Inter'} onChange={e => setNested('theme.fontFamily', e.target.value)} className={inp}>
                  {['Inter','Geist','Poppins','Raleway','Space Grotesk','JetBrains Mono'].map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            {/* useAvatarAsBackground toggle */}
            <div className="mt-4 flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
              <div>
                <p className="text-sm font-medium text-foreground">Dùng avatar làm background</p>
                <p className="text-xs text-muted-foreground">Khi bật và không có background URL, avatar sẽ được dùng làm ảnh nền mờ</p>
              </div>
              <button
                onClick={() => setNested('theme.useAvatarAsBackground', !(formData.theme?.useAvatarAsBackground ?? false))}
                className={`relative w-12 h-6 rounded-full transition-colors ${(formData.theme?.useAvatarAsBackground ?? false) ? 'bg-[#8b5cf6]' : 'bg-secondary'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${(formData.theme?.useAvatarAsBackground ?? false) ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">Sliders</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { label: 'Glow Intensity', key: 'theme.glowIntensity', max: 100 },
                { label: 'Blur Intensity', key: 'theme.blurIntensity', max: 100 },
                { label: 'Particle Count', key: 'theme.particleCount', max: 150 },
                { label: 'Particle Speed', key: 'theme.particleSpeed', max: 100 },
                { label: 'Card Radius', key: 'theme.cardRadius', max: 40 },
                { label: 'Card Opacity', key: 'theme.cardOpacity', max: 100 },
                { label: 'Avatar Size', key: 'theme.avatarSize', max: 200 },
                { label: 'Avatar Border Width', key: 'theme.avatarBorderWidth', max: 8 },
                { label: 'Avatar Glow', key: 'theme.avatarGlow', max: 100 },
                { label: 'Background Blur', key: 'theme.backgroundBlur', max: 100 },
                { label: 'Background Brightness', key: 'theme.backgroundBrightness', max: 200 },
                { label: 'Background Scale', key: 'theme.backgroundScale', max: 150 },
                { label: 'Profile Card Width', key: 'theme.profileCardWidth', max: 600 },
                { label: 'Button Radius', key: 'theme.buttonRadius', max: 30 },
                { label: 'Button Glow', key: 'theme.buttonGlow', max: 100 },
              ].map(f => {
                const fieldKey = f.key.split('.')[1]
                const val = formData.theme?.[fieldKey] ?? 50
                return (
                  <div key={f.key} className="space-y-2">
                    <div className="flex justify-between">
                      <label className={lbl}>{f.label}</label>
                      <span className="text-xs text-[#8b5cf6] font-mono">{val}</span>
                    </div>
                    <input type="range" min={0} max={f.max} value={val}
                      onChange={e => setNested(f.key, Number(e.target.value))}
                      className="w-full h-1.5 accent-[#8b5cf6] cursor-pointer" />
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== EFFECTS ===== */}
      {activeTab === 'effects' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><Zap className="w-5 h-5 text-[#38bdf8]" /> Visual Effects</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: 'Particles', key: 'effects.enableParticles', desc: 'Animated particle background' },
                { label: 'Glow', key: 'effects.enableGlow', desc: 'Neon glow on elements' },
                { label: 'Noise Overlay', key: 'effects.enableNoiseOverlay', desc: 'Film grain noise texture' },
                { label: 'Gradient Border', key: 'effects.enableGradientBorder', desc: 'Animated gradient card borders' },
                { label: 'Floating Animation', key: 'effects.enableFloatingAnimation', desc: 'Floating decorative dots' },
                { label: 'Music Player', key: 'effects.enableMusicPlayer', desc: 'Bottom music player bar' },
                { label: 'View Counter', key: 'effects.enableViewCounter', desc: 'Real-time view counter' },
              ].map(f => {
                const fieldKey = f.key.split('.')[1]
                const val = formData.effects?.[fieldKey] ?? false
                return (
                  <div key={f.key} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
                    <div>
                      <p className="text-sm font-medium text-foreground">{f.label}</p>
                      <p className="text-xs text-muted-foreground">{f.desc}</p>
                    </div>
                    <button
                      onClick={() => setNested(f.key, !val)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${val ? 'bg-[#8b5cf6]' : 'bg-secondary'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${val ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== PERFORMANCE ===== */}
      {activeTab === 'performance' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><Gauge className="w-5 h-5 text-[#a78bfa]" /> Performance Settings</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className={lbl}>Performance Mode</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'high', label: '🔥 High', desc: 'All effects' },
                    { value: 'balanced', label: '⚡ Balanced', desc: 'Recommended' },
                    { value: 'low', label: '🧊 Low', desc: 'Minimal effects' },
                    { value: 'auto', label: '🤖 Auto', desc: 'Device-based' },
                  ].map(m => (
                    <button key={m.value} onClick={() => setNested('performance.mode', m.value)}
                      className={`p-3 rounded-xl border transition-all text-sm ${
                        formData.performance?.mode === m.value
                          ? 'border-[#8b5cf6] bg-[#8b5cf6]/20 text-white'
                          : 'border-border bg-secondary/30 text-muted-foreground hover:text-foreground'
                      }`}>
                      <div className="font-medium">{m.label}</div>
                      <div className="text-xs opacity-70">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {[
                  { label: 'Mobile Particle Limit', key: 'performance.mobileParticleLimit', max: 50 },
                  { label: 'Max Blur', key: 'performance.maxBlur', max: 100 },
                  { label: 'Max Glow', key: 'performance.maxGlow', max: 100 },
                ].map(f => {
                  const fieldKey = f.key.split('.')[1]
                  const val = formData.performance?.[fieldKey] ?? 30
                  return (
                    <div key={f.key} className="space-y-2">
                      <div className="flex justify-between">
                        <label className={lbl}>{f.label}</label>
                        <span className="text-xs text-[#8b5cf6] font-mono">{val}</span>
                      </div>
                      <input type="range" min={0} max={f.max} value={val}
                        onChange={e => setNested(f.key, Number(e.target.value))}
                        className="w-full h-1.5 accent-[#8b5cf6] cursor-pointer" />
                    </div>
                  )
                })}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: 'Reduce Motion', key: 'performance.reduceMotion', desc: 'Respects prefers-reduced-motion' },
                  { label: 'Heavy Animations', key: 'performance.enableHeavyAnimations', desc: 'Complex particle/glow animations' },
                ].map(f => {
                  const fieldKey = f.key.split('.')[1]
                  const val = formData.performance?.[fieldKey] ?? false
                  return (
                    <div key={f.key} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
                      <div>
                        <p className="text-sm font-medium text-foreground">{f.label}</p>
                        <p className="text-xs text-muted-foreground">{f.desc}</p>
                      </div>
                      <button onClick={() => setNested(f.key, !val)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${val ? 'bg-[#8b5cf6]' : 'bg-secondary'}`}>
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${val ? 'translate-x-7' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== MEDIA REQUESTS ===== */}
      {activeTab === 'media' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#38bdf8]" /> Media Requests ({requests.length})
              </h2>
              <button onClick={fetchAll} className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {requests.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">Chưa có media request nào.</p>
            ) : (
              <div className="space-y-3">
                {requests.map(r => (
                  <div key={r._id} className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            r.type === 'video' ? 'bg-blue-500/20 text-blue-400' :
                            r.type === 'image' ? 'bg-green-500/20 text-green-400' :
                            'bg-purple-500/20 text-purple-400'
                          }`}>{r.type}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            r.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            r.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>{r.status}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{r.message}</p>
                        {r.fileName && <p className="text-xs text-muted-foreground/60 mt-1 font-mono">{r.fileName}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {r.status === 'pending' && (
                          <>
                            <button onClick={() => handleMediaStatus(r._id, 'approved')}
                              className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors" title="Approve">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleMediaStatus(r._id, 'rejected')}
                              className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors" title="Reject">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button onClick={() => handleMediaDelete(r._id)}
                          className="p-2 rounded-lg bg-secondary text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ===== CONTACT MESSAGES ===== */}
      {activeTab === 'contact' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#ec4899]" /> Contact Messages ({contacts.length})
              </h2>
              <button onClick={fetchAll} className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {contacts.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">Chưa có tin nhắn nào.</p>
            ) : (
              <div className="space-y-3">
                {contacts.map(c => (
                  <div key={c._id} className={`p-4 rounded-xl border transition-colors ${
                    c.isRead ? 'bg-secondary/20 border-border/30' : 'bg-secondary/40 border-[#ec4899]/30'
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">{c.name}</span>
                          {!c.isRead && <span className="w-1.5 h-1.5 rounded-full bg-[#ec4899]" />}
                          <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{c.email}</p>
                        <p className="text-sm text-muted-foreground">{c.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ===== DANGER ZONE ===== */}
      {activeTab === 'danger' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="glass rounded-2xl p-6 border border-red-500/20">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-red-400">
              <ShieldAlert className="w-5 h-5" /> Danger Zone
            </h2>
            <div className="space-y-4">
              {[
                {
                  id: 'resetViews',
                  label: 'Reset View Count',
                  desc: 'Đặt lại viewCount về 0 trong MongoDB',
                  color: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-400',
                },
                {
                  id: 'resetProfile',
                  label: 'Reset Profile to Default',
                  desc: 'Đặt lại toàn bộ profile về cấu hình seed mặc định. KHÔNG THỂ HOÀN TÁC!',
                  color: 'from-red-500/20 to-red-800/20 border-red-500/30 text-red-400',
                },
              ].map(action => (
                <div key={action.id} className={`p-5 rounded-xl bg-gradient-to-r border ${action.color}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{action.label}</p>
                      <p className="text-xs opacity-70 mt-1">{action.desc}</p>
                    </div>
                    <button
                      onClick={() => handleDanger(action.id)}
                      className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        confirmReset === action.id
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-secondary/50 hover:bg-destructive/30 text-foreground'
                      }`}
                    >
                      {confirmReset === action.id ? '⚠ Confirm?' : 'Execute'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {confirmReset && (
              <p className="text-xs text-red-400 mt-4 text-center animate-pulse">
                Nhấn lại để xác nhận. Nhấn tab khác để hủy.
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl glass-strong border border-border shadow-2xl"
          >
            {toast.type === 'success'
              ? <div className="w-7 h-7 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center text-[#8b5cf6]"><CheckCircle className="w-4 h-4" /></div>
              : <div className="w-7 h-7 rounded-full bg-destructive/20 flex items-center justify-center text-destructive"><AlertTriangle className="w-4 h-4" /></div>}
            <p className="text-sm font-medium text-foreground">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
