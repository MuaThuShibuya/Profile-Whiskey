'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, Plus, Save, Trash2, Eye, EyeOff, Edit2, X, Upload,
  CheckCircle, AlertTriangle, RefreshCw, ImageIcon, Video,
  GripVertical, ChevronDown, ChevronUp, ExternalLink,
} from 'lucide-react'

const STATUS_MAP = {
  active:      { label: 'Hoạt động',    color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  beta:        { label: 'Thử nghiệm',   color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  maintenance: { label: 'Bảo trì',      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  hidden:      { label: 'Ẩn',           color: 'bg-secondary text-muted-foreground border-border' },
}

const inp = 'w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50 focus:border-[#8b5cf6] transition-all placeholder:text-muted-foreground/50'
const lbl = 'block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5'

type BotItem = {
  _id?: string
  name: string
  slug: string
  avatarUrl: string
  shortDescription: string
  longDescription: string
  inviteUrl: string
  status: 'active' | 'beta' | 'maintenance' | 'hidden'
  tags: string[]
  demoMedia: { url: string; type: 'image' | 'video'; caption: string }[]
  isPublic: boolean
  sortOrder: number
}

const emptyBot = (): BotItem => ({
  name: '', slug: '', avatarUrl: '', shortDescription: '', longDescription: '',
  inviteUrl: '', status: 'active', tags: [], demoMedia: [], isPublic: true, sortOrder: 0,
})

export default function AdminBotsPage() {
  const [bots, setBots] = useState<BotItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [editData, setEditData] = useState<BotItem>(emptyBot())
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [newTag, setNewTag] = useState('')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchBots = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/bots')
      const json = await res.json()
      if (json.success) setBots(json.data)
      else showToast('Lỗi tải danh sách bot', 'error')
    } catch { showToast('Lỗi kết nối', 'error') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchBots() }, [fetchBots])

  const startCreate = () => {
    setEditingId('new')
    setEditData(emptyBot())
  }

  const startEdit = (bot: BotItem) => {
    setEditingId(bot._id!)
    setEditData({ ...bot })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditData(emptyBot())
    setNewTag('')
  }

  const setField = (key: keyof BotItem, val: any) => setEditData(p => ({ ...p, [key]: val }))

  const autoSlug = (name: string) => name.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

  const handleSave = async () => {
    if (!editData.name.trim()) { showToast('Tên bot không được để trống', 'error'); return }
    setSaving(true)
    try {
      const isNew = editingId === 'new'
      const url = isNew ? '/api/admin/bots' : `/api/admin/bots/${editingId}`
      const method = isNew ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })
      const data = await res.json()
      if (data.success) {
        showToast(isNew ? 'Đã thêm bot mới!' : 'Đã lưu thay đổi!')
        cancelEdit()
        fetchBots()
      } else showToast(data.message || 'Lỗi lưu', 'error')
    } catch { showToast('Lỗi kết nối', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (confirmDelete !== id) { setConfirmDelete(id); return }
    setConfirmDelete(null)
    try {
      const res = await fetch(`/api/admin/bots/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) { showToast('Đã xóa bot'); fetchBots() }
      else showToast(data.message || 'Lỗi xóa', 'error')
    } catch { showToast('Lỗi kết nối', 'error') }
  }

  const handleTogglePublic = async (bot: BotItem) => {
    try {
      const res = await fetch(`/api/admin/bots/${bot._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !bot.isPublic }),
      })
      const data = await res.json()
      if (data.success) {
        setBots(prev => prev.map(b => b._id === bot._id ? { ...b, isPublic: !b.isPublic } : b))
        showToast(bot.isPublic ? 'Đã ẩn bot' : 'Đã hiện bot public')
      }
    } catch { showToast('Lỗi cập nhật', 'error') }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/media/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) setField('avatarUrl', data.fileUrl)
      else showToast(data.message || 'Lỗi upload avatar', 'error')
    } catch { showToast('Lỗi kết nối', 'error') }
    finally { setUploading(false); e.target.value = '' }
  }

  const handleDemoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/media/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) {
        setField('demoMedia', [...editData.demoMedia, { url: data.fileUrl, type: data.type, caption: '' }])
      } else showToast(data.message || 'Lỗi upload', 'error')
    } catch { showToast('Lỗi kết nối', 'error') }
    finally { setUploading(false); e.target.value = '' }
  }

  const removeDemo = (idx: number) =>
    setField('demoMedia', editData.demoMedia.filter((_, i) => i !== idx))

  const updateDemoCaption = (idx: number, caption: string) =>
    setField('demoMedia', editData.demoMedia.map((m, i) => i === idx ? { ...m, caption } : m))

  const addTag = () => {
    const t = newTag.trim()
    if (!t || editData.tags.includes(t)) return
    setField('tags', [...editData.tags, t])
    setNewTag('')
  }

  const removeTag = (t: string) => setField('tags', editData.tags.filter(x => x !== t))

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#38bdf8]/20 to-[#8b5cf6]/20 border border-[#38bdf8]/20">
            <Bot className="w-5 h-5 text-[#38bdf8]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-[#a78bfa] to-[#38bdf8] bg-clip-text text-transparent">
              Quản lý Bot Discord
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">{bots.length} bot · {bots.filter(b => b.isPublic).length} public</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchBots} className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {editingId !== 'new' && (
            <button onClick={startCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#38bdf8] text-white text-sm font-medium hover:shadow-lg hover:shadow-[#8b5cf6]/30 transition-all">
              <Plus className="w-4 h-4" /> Thêm bot mới
            </button>
          )}
        </div>
      </motion.div>

      {/* Create form */}
      <AnimatePresence>
        {editingId === 'new' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="glass-strong rounded-2xl p-6 border border-[#8b5cf6]/30">
            <BotForm
              data={editData} setField={setField} newTag={newTag} setNewTag={setNewTag}
              addTag={addTag} removeTag={removeTag} handleAvatarUpload={handleAvatarUpload}
              handleDemoUpload={handleDemoUpload} removeDemo={removeDemo} updateDemoCaption={updateDemoCaption}
              autoSlug={autoSlug} uploading={uploading} inp={inp} lbl={lbl}
            />
            <div className="flex gap-2 mt-5 pt-5 border-t border-border">
              <button onClick={cancelEdit} className="px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm hover:bg-secondary/80 transition-colors flex items-center gap-2">
                <X className="w-4 h-4" /> Hủy
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#38bdf8] text-white text-sm font-medium hover:shadow-lg hover:shadow-[#8b5cf6]/30 transition-all flex items-center gap-2 disabled:opacity-50">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                Tạo bot
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bot list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : bots.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <Bot className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">Chưa có bot nào. Thêm bot đầu tiên!</p>
          <button onClick={startCreate}
            className="px-5 py-2.5 rounded-xl bg-[#8b5cf6]/20 text-[#a78bfa] hover:bg-[#8b5cf6]/30 transition-colors text-sm">
            <Plus className="w-4 h-4 inline mr-1.5" /> Thêm bot
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {bots.map((bot, i) => (
            <motion.div key={bot._id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`glass rounded-2xl overflow-hidden border transition-colors ${
                editingId === bot._id ? 'border-[#8b5cf6]/40' : 'border-border/50'
              }`}>
              {/* Card header */}
              <div className="flex items-center gap-4 p-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-secondary/50 border border-border/50">
                  {bot.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={bot.avatarUrl} alt={bot.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Bot className="w-6 h-6 text-muted-foreground/40" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className="font-semibold text-foreground">{bot.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">/{bot.slug}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_MAP[bot.status].color}`}>
                      {STATUS_MAP[bot.status].label}
                    </span>
                    {!bot.isPublic && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-secondary text-muted-foreground">Ẩn</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{bot.shortDescription || 'Chưa có mô tả'}</p>
                  {bot.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {bot.tags.slice(0, 4).map(t => (
                        <span key={t} className="px-1.5 py-0.5 rounded text-[9px] bg-[#8b5cf6]/10 text-[#a78bfa] border border-[#8b5cf6]/20">{t}</span>
                      ))}
                      {bot.tags.length > 4 && <span className="text-[9px] text-muted-foreground">+{bot.tags.length - 4}</span>}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => handleTogglePublic(bot)} title={bot.isPublic ? 'Ẩn' : 'Hiện public'}
                    className="p-2 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                    {bot.isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => editingId === bot._id ? cancelEdit() : startEdit(bot)}
                    className={`p-2 rounded-lg transition-colors ${editingId === bot._id ? 'bg-[#8b5cf6]/20 text-[#a78bfa]' : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'}`}>
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(bot._id!)}
                    className={`p-2 rounded-lg transition-colors ${confirmDelete === bot._id ? 'bg-red-500 text-white animate-pulse' : 'bg-secondary/50 text-muted-foreground hover:text-destructive hover:bg-destructive/10'}`}
                    title={confirmDelete === bot._id ? 'Nhấn lại để xác nhận' : 'Xóa'}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setExpandedId(expandedId === bot._id ? null : bot._id!)}
                    className="p-2 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                    {expandedId === bot._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Demo media preview (expanded) */}
              <AnimatePresence>
                {expandedId === bot._id && !editingId && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                    className="overflow-hidden border-t border-border/30">
                    <div className="p-4 space-y-2">
                      {bot.inviteUrl && (
                        <a href={bot.inviteUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-[#38bdf8] hover:underline">
                          <ExternalLink className="w-3 h-3" /> Link mời bot
                        </a>
                      )}
                      {bot.demoMedia.length > 0 ? (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {bot.demoMedia.map((m, i) => (
                            <div key={i} className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-secondary/50 relative">
                              {m.type === 'image' ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={m.url} alt={m.caption} className="w-full h-full object-cover" loading="lazy" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Video className="w-6 h-6 text-muted-foreground/40" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground/50">Chưa có media demo</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Edit form */}
              <AnimatePresence>
                {editingId === bot._id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                    className="overflow-hidden border-t border-[#8b5cf6]/20">
                    <div className="p-5 space-y-4">
                      <BotForm
                        data={editData} setField={setField} newTag={newTag} setNewTag={setNewTag}
                        addTag={addTag} removeTag={removeTag} handleAvatarUpload={handleAvatarUpload}
                        handleDemoUpload={handleDemoUpload} removeDemo={removeDemo} updateDemoCaption={updateDemoCaption}
                        autoSlug={autoSlug} uploading={uploading} inp={inp} lbl={lbl}
                      />
                      <div className="flex gap-2 pt-4 border-t border-border">
                        <button onClick={cancelEdit} className="px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm hover:bg-secondary/80 transition-colors flex items-center gap-2">
                          <X className="w-4 h-4" /> Hủy
                        </button>
                        <button onClick={handleSave} disabled={saving}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#38bdf8] text-white text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50">
                          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                          Lưu thay đổi
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl glass-strong border border-border shadow-2xl max-w-xs">
            {toast.type === 'success'
              ? <div className="w-7 h-7 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center text-[#8b5cf6] flex-shrink-0"><CheckCircle className="w-4 h-4" /></div>
              : <div className="w-7 h-7 rounded-full bg-destructive/20 flex items-center justify-center text-destructive flex-shrink-0"><AlertTriangle className="w-4 h-4" /></div>}
            <p className="text-sm font-medium text-foreground">{toast.msg}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Bot form component (reused for create + edit) ─── */
function BotForm({
  data, setField, newTag, setNewTag, addTag, removeTag,
  handleAvatarUpload, handleDemoUpload, removeDemo, updateDemoCaption,
  autoSlug, uploading, inp, lbl,
}: any) {
  return (
    <div className="space-y-5">
      {/* Row 1: Avatar + Basic info */}
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <label className={lbl}>Ảnh bot</label>
          <label className="cursor-pointer block">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-secondary/50 border-2 border-dashed border-border hover:border-[#8b5cf6]/40 transition-colors flex items-center justify-center relative">
              {data.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <Upload className={`w-6 h-6 ${uploading ? 'text-[#8b5cf6] animate-pulse' : 'text-muted-foreground/40'}`} />
              )}
            </div>
            <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarUpload} disabled={uploading} />
          </label>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-3">
          <div>
            <label className={lbl}>Tên bot *</label>
            <input type="text" value={data.name} className={inp} placeholder="Tên bot"
              onChange={e => { setField('name', e.target.value); if (!data.slug) setField('slug', autoSlug(e.target.value)) }} />
          </div>
          <div>
            <label className={lbl}>Slug</label>
            <input type="text" value={data.slug} className={inp + ' font-mono'} placeholder="ten-bot"
              onChange={e => setField('slug', autoSlug(e.target.value))} />
          </div>
          <div>
            <label className={lbl}>Trạng thái</label>
            <select value={data.status} onChange={e => setField('status', e.target.value)} className={inp}>
              <option value="active">Hoạt động</option>
              <option value="beta">Thử nghiệm</option>
              <option value="maintenance">Bảo trì</option>
              <option value="hidden">Ẩn</option>
            </select>
          </div>
          <div>
            <label className={lbl}>Thứ tự</label>
            <input type="number" value={data.sortOrder} className={inp}
              onChange={e => setField('sortOrder', Number(e.target.value))} />
          </div>
        </div>
      </div>

      {/* Invite URL */}
      <div>
        <label className={lbl}>Link mời bot</label>
        <input type="url" value={data.inviteUrl} className={inp} placeholder="https://discord.com/api/oauth2/authorize?..."
          onChange={e => setField('inviteUrl', e.target.value)} />
      </div>

      {/* Descriptions */}
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className={lbl}>Mô tả ngắn <span className="normal-case text-[10px]">({(data.shortDescription?.length ?? 0)}/200)</span></label>
          <textarea value={data.shortDescription} maxLength={200} rows={3}
            className={inp + ' resize-none'}
            placeholder="Mô tả ngắn gọn về bot..."
            onChange={e => setField('shortDescription', e.target.value)} />
        </div>
        <div>
          <label className={lbl}>Mô tả đầy đủ</label>
          <textarea value={data.longDescription} rows={3}
            className={inp + ' resize-none'}
            placeholder="Mô tả chi tiết..."
            onChange={e => setField('longDescription', e.target.value)} />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className={lbl}>Tags tính năng</label>
        <div className="flex gap-2 mb-2">
          <input type="text" value={newTag} className={inp + ' flex-1'} placeholder="Thêm tag..."
            onChange={e => setNewTag(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} />
          <button onClick={addTag} className="px-4 py-3 rounded-xl bg-[#8b5cf6]/20 text-[#a78bfa] hover:bg-[#8b5cf6]/30 transition-colors flex-shrink-0">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {data.tags.map((t: string) => (
              <span key={t} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#8b5cf6]/15 text-[#a78bfa] text-xs border border-[#8b5cf6]/20">
                {t}
                <button onClick={() => removeTag(t)} className="text-[#a78bfa]/60 hover:text-[#a78bfa]"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Demo media */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={lbl + ' !mb-0'}>Ảnh/video demo</label>
          <label className="px-3 py-1.5 rounded-xl bg-[#8b5cf6]/20 text-[#a78bfa] text-xs cursor-pointer hover:bg-[#8b5cf6]/30 transition-colors flex items-center gap-1.5">
            {uploading ? <div className="w-3 h-3 border border-[#a78bfa]/30 border-t-[#a78bfa] rounded-full animate-spin" /> : <Upload className="w-3 h-3" />}
            Tải lên
            <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={handleDemoUpload} disabled={uploading} />
          </label>
        </div>
        {data.demoMedia.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {data.demoMedia.map((m: any, i: number) => (
              <div key={i} className="group relative rounded-xl overflow-hidden bg-secondary/50 border border-border/50">
                <div className="aspect-square">
                  {m.type === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-6 h-6 text-muted-foreground/40" />
                    </div>
                  )}
                  <button onClick={() => removeDemo(i)}
                    className="absolute top-1 right-1 p-1 rounded bg-red-500/70 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <input type="text" value={m.caption} onChange={e => updateDemoCaption(i, e.target.value)}
                  className="w-full text-[10px] px-2 py-1 bg-transparent text-muted-foreground focus:text-foreground focus:outline-none"
                  placeholder="Caption..." />
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center text-xs text-muted-foreground/50">
            Chưa có media demo. Upload ảnh/video để thêm.
          </div>
        )}
      </div>

      {/* Public toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
        <div>
          <p className="text-sm font-medium text-foreground">Hiển thị public</p>
          <p className="text-xs text-muted-foreground">Cho phép xem trên trang profile</p>
        </div>
        <button onClick={() => setField('isPublic', !data.isPublic)}
          className={`relative w-12 h-6 rounded-full transition-colors ${data.isPublic ? 'bg-[#8b5cf6]' : 'bg-secondary'}`}>
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${data.isPublic ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
      </div>
    </div>
  )
}
