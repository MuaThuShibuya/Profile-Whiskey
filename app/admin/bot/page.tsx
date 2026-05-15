'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, Save, RotateCcw, Plus, Trash2, Eye, EyeOff,
  CheckCircle, AlertTriangle, ImageIcon, Video, Upload, X,
} from 'lucide-react'
import { useAdminProfile } from '@/hooks/use-admin-profile'

const inp = 'w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50 focus:border-[#8b5cf6] transition-all text-sm'
const lbl = 'text-xs font-medium text-muted-foreground uppercase tracking-wide'

export default function AdminBotPage() {
  const { formData, setNested, setFormData, handleSave, resetToSaved, isSaving, loading, error, toast } = useAdminProfile()
  const [newFeature, setNewFeature] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const bot = formData?.bot ?? { description: '', features: [] }
  const botGallery: any[] = formData?.botGallery ?? []

  const addFeature = () => {
    const trimmed = newFeature.trim()
    if (!trimmed) return
    const features = [...(bot.features ?? []), trimmed]
    setNested('bot.features', features)
    setNewFeature('')
  }

  const removeFeature = (idx: number) => {
    const features = (bot.features ?? []).filter((_: any, i: number) => i !== idx)
    setNested('bot.features', features)
  }

  const handleGalleryUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/media/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!data.success) { setUploadError(data.message || 'Lỗi upload'); return }
      const newItem = { url: data.fileUrl, type: data.type, caption: '', enabled: true }
      setFormData((prev: any) => ({
        ...prev,
        botGallery: [...(prev.botGallery ?? []), newItem],
      }))
    } catch { setUploadError('Lỗi kết nối') }
    finally { setUploading(false); e.target.value = '' }
  }, [setFormData])

  const updateGalleryItem = (idx: number, field: string, value: any) => {
    setFormData((prev: any) => {
      const gallery = [...(prev.botGallery ?? [])]
      gallery[idx] = { ...gallery[idx], [field]: value }
      return { ...prev, botGallery: gallery }
    })
  }

  const removeGalleryItem = (idx: number) => {
    setFormData((prev: any) => ({
      ...prev,
      botGallery: (prev.botGallery ?? []).filter((_: any, i: number) => i !== idx),
    }))
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

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#38bdf8]/20 to-[#8b5cf6]/20 border border-[#38bdf8]/20">
            <Bot className="w-5 h-5 text-[#38bdf8]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-[#a78bfa] to-[#38bdf8] bg-clip-text text-transparent">
              Discord Bot
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">Quản lý thông tin và gallery demo bot</p>
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
            Lưu vào MongoDB
          </button>
        </div>
      </motion.div>

      {/* Bot Info */}
      <motion.div className="glass rounded-2xl p-6 space-y-5"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Bot className="w-4 h-4 text-[#38bdf8]" /> Thông tin Bot
        </h2>

        <div className="space-y-1.5">
          <label className={lbl}>Link mời bot (Bot Invite URL)</label>
          <input type="url" value={formData.botInvite ?? ''}
            onChange={e => setNested('botInvite', e.target.value)}
            className={inp} placeholder="https://discord.com/api/oauth2/authorize?..." />
        </div>

        <div className="space-y-1.5">
          <label className={lbl}>Mô tả bot <span className="text-[10px] normal-case">({(bot.description?.length ?? 0)}/500)</span></label>
          <textarea value={bot.description ?? ''}
            onChange={e => setNested('bot.description', e.target.value)}
            className={inp + ' resize-none'} rows={4} maxLength={500}
            placeholder="Mô tả về bot Discord của bạn..." />
        </div>

        {/* Features */}
        <div className="space-y-3">
          <label className={lbl}>Tính năng nổi bật</label>
          <div className="flex gap-2">
            <input type="text" value={newFeature} onChange={e => setNewFeature(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              className={inp} placeholder="Thêm tính năng... (Enter để thêm)" />
            <button onClick={addFeature}
              className="px-4 py-3 rounded-xl bg-[#8b5cf6]/20 text-[#a78bfa] hover:bg-[#8b5cf6]/30 transition-colors flex-shrink-0">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {(bot.features ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(bot.features as string[]).map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8b5cf6]/20 text-[#a78bfa] text-sm border border-[#8b5cf6]/20">
                  {f}
                  <button onClick={() => removeFeature(i)} className="text-[#a78bfa]/60 hover:text-[#a78bfa] transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Bot Gallery */}
      <motion.div className="glass rounded-2xl p-6 space-y-5"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#8b5cf6]" /> Gallery Demo Bot
            <span className="text-xs text-muted-foreground font-normal">({botGallery.length} items)</span>
          </h2>
          <label className="px-4 py-2 rounded-xl bg-[#8b5cf6]/20 text-[#a78bfa] hover:bg-[#8b5cf6]/30 transition-colors text-sm cursor-pointer flex items-center gap-2">
            {uploading
              ? <div className="w-4 h-4 border-2 border-[#a78bfa]/30 border-t-[#a78bfa] rounded-full animate-spin" />
              : <Upload className="w-4 h-4" />}
            {uploading ? 'Đang upload...' : 'Upload ảnh/video'}
            <input type="file" className="hidden"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
              onChange={handleGalleryUpload} disabled={uploading} />
          </label>
        </div>

        {uploadError && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-2">{uploadError}</p>
        )}

        {botGallery.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-xl p-10 text-center">
            <ImageIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Chưa có ảnh/video demo. Upload để bắt đầu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {botGallery.map((item: any, idx: number) => (
              <div key={idx} className={`group relative rounded-xl overflow-hidden border transition-colors ${
                item.enabled ? 'border-border/50' : 'border-border/20 opacity-50'
              }`}>
                {/* Preview */}
                <div className="relative aspect-square bg-secondary/50">
                  {item.type === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt={item.caption || 'gallery'} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                      <Video className="w-8 h-8 text-muted-foreground/40" />
                      <p className="text-[10px] text-muted-foreground/60">Video</p>
                    </div>
                  )}
                  {/* Controls overlay */}
                  <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => updateGalleryItem(idx, 'enabled', !item.enabled)}
                      className="p-1 rounded bg-black/60 text-white hover:bg-black/80 transition-colors" title={item.enabled ? 'Ẩn' : 'Hiện'}>
                      {item.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </button>
                    <button onClick={() => removeGalleryItem(idx)}
                      className="p-1 rounded bg-red-500/60 text-white hover:bg-red-500/80 transition-colors" title="Xóa">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  {!item.enabled && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <EyeOff className="w-6 h-6 text-white/40" />
                    </div>
                  )}
                </div>
                {/* Caption */}
                <div className="p-2">
                  <input type="text" value={item.caption ?? ''}
                    onChange={e => updateGalleryItem(idx, 'caption', e.target.value)}
                    className="w-full text-xs bg-transparent text-muted-foreground focus:text-foreground focus:outline-none placeholder:text-muted-foreground/40"
                    placeholder="Caption (tùy chọn)" />
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          * Click icon mắt để ẩn/hiện item. Ảnh ẩn sẽ không xuất hiện trên profile public.
        </p>
      </motion.div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
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
