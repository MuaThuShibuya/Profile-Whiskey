'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ImageIcon, Video, CheckCircle, X, Trash2, RefreshCw, AlertTriangle,
  Search, Download, Eye, Archive, ChevronLeft, ChevronRight, Play,
} from 'lucide-react'
type Status = 'all' | 'pending' | 'approved' | 'rejected' | 'archived'
type MediaType = 'all' | 'image' | 'video' | 'message' | 'photo_request'

interface MediaItem {
  _id: string
  type: string
  message: string
  senderName: string
  fileName: string
  fileUrl: string
  mimeType: string
  fileSize: number
  status: string
  reviewedAt?: string
  reviewedBy?: string
  createdAt: string
}

const PAGE_SIZE = 12

function formatBytes(bytes: number) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<Status>('all')
  const [typeFilter, setTypeFilter] = useState<MediaType>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [modal, setModal] = useState<MediaItem | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/media/request')
      const json = await res.json()
      if (json.success) setItems(json.data)
      else showToast('Lỗi tải dữ liệu', 'error')
    } catch { showToast('Lỗi kết nối', 'error') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const handleStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/media/request/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (data.success) {
        setItems(prev => prev.map(r => r._id === id ? { ...r, status, reviewedAt: new Date().toISOString() } : r))
        if (modal?._id === id) setModal(prev => prev ? { ...prev, status } : null)
        const labels: Record<string, string> = { approved: 'Đã duyệt', rejected: 'Đã từ chối', archived: 'Đã lưu trữ', pending: 'Đặt lại pending' }
        showToast(labels[status] ?? 'Đã cập nhật')
      } else showToast(data.message || 'Lỗi', 'error')
    } catch { showToast('Lỗi kết nối', 'error') }
  }

  const handleDelete = async (id: string) => {
    if (confirmDelete !== id) { setConfirmDelete(id); return }
    setConfirmDelete(null)
    try {
      const res = await fetch(`/api/media/request/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setItems(prev => prev.filter(r => r._id !== id))
        if (modal?._id === id) setModal(null)
        showToast('Đã xóa')
      } else showToast(data.message || 'Lỗi', 'error')
    } catch { showToast('Lỗi kết nối', 'error') }
  }

  const filtered = items.filter(r => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    const matchType = typeFilter === 'all' || r.type === typeFilter
    const q = search.toLowerCase()
    const matchSearch = !q ||
      r.message?.toLowerCase().includes(q) ||
      r.senderName?.toLowerCase().includes(q) ||
      r.fileName?.toLowerCase().includes(q)
    return matchStatus && matchType && matchSearch
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const counts = {
    all: items.length,
    pending: items.filter(r => r.status === 'pending').length,
    approved: items.filter(r => r.status === 'approved').length,
    rejected: items.filter(r => r.status === 'rejected').length,
    archived: items.filter(r => r.status === 'archived').length,
  }

  const statusColor = (s: string) =>
    s === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
    s === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
    s === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
    'bg-secondary text-muted-foreground border-border'

  const typeIcon = (t: string) =>
    t === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />

  const typeColor = (t: string) =>
    t === 'video' ? 'bg-blue-500/20 text-blue-400' :
    t === 'image' ? 'bg-emerald-500/20 text-emerald-400' :
    'bg-purple-500/20 text-purple-400'

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <motion.div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#38bdf8]/20 border border-[#8b5cf6]/20">
            <ImageIcon className="w-5 h-5 text-[#8b5cf6]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-[#a78bfa] to-[#38bdf8] bg-clip-text text-transparent">
              Media Nhận Được
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {items.length} items · {counts.pending} chờ duyệt
            </p>
          </div>
        </div>
        <button onClick={fetchItems}
          className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div className="space-y-3 mb-5"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        {/* Status filter */}
        <div className="flex flex-wrap gap-1.5 p-1 glass rounded-xl">
          {(['all', 'pending', 'approved', 'rejected', 'archived'] as Status[]).map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                statusFilter === s
                  ? 'bg-gradient-to-r from-[#8b5cf6] to-[#38bdf8] text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}>
              {s} {counts[s as keyof typeof counts] > 0 && (
                <span className="ml-1 opacity-70">({counts[s as keyof typeof counts]})</span>
              )}
            </button>
          ))}
        </div>

        {/* Type filter + Search */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-1.5 p-1 glass rounded-xl">
            {(['all', 'image', 'video', 'message', 'photo_request'] as MediaType[]).map(t => (
              <button key={t} onClick={() => { setTypeFilter(t); setPage(1) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  typeFilter === t
                    ? 'bg-[#8b5cf6]/30 text-[#a78bfa] border border-[#8b5cf6]/40'
                    : 'text-muted-foreground hover:text-foreground'
                }`}>
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Tìm theo tên, tin nhắn, file..."
              className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/40 transition-all" />
          </div>
        </div>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : paginated.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-muted-foreground">Không có media nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {paginated.map((item, i) => (
            <motion.div key={item._id}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="group relative glass rounded-xl overflow-hidden cursor-pointer border border-border/50 hover:border-[#8b5cf6]/40 transition-colors"
              onClick={() => setModal(item)}
            >
              {/* Media preview */}
              <div className="relative aspect-square bg-secondary/50">
                {item.fileUrl && item.type === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.fileUrl} alt={item.fileName || 'media'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : item.fileUrl && item.type === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center bg-secondary/80">
                    <Play className="w-8 h-8 text-white/60" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${statusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${typeColor(item.type)}`}>
                    {typeIcon(item.type)}
                  </span>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Info */}
              <div className="p-2">
                {item.senderName && (
                  <p className="text-xs font-medium text-foreground truncate">{item.senderName}</p>
                )}
                {item.message && (
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">"{item.message}"</p>
                )}
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                  {new Date(item.createdAt).toLocaleDateString('vi-VN')} · {formatBytes(item.fileSize)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mb-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-2 rounded-lg bg-secondary disabled:opacity-40 hover:bg-secondary/80 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages} ({filtered.length} items)
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-2 rounded-lg bg-secondary disabled:opacity-40 hover:bg-secondary/80 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setModal(null)}>
            <motion.div className="w-full max-w-2xl glass-strong rounded-2xl overflow-hidden border border-border"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}>

              {/* Media */}
              <div className="relative bg-black/50 max-h-96 flex items-center justify-center">
                {modal.fileUrl && modal.type === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={modal.fileUrl} alt={modal.fileName || 'media'}
                    className="max-h-96 max-w-full object-contain" />
                ) : modal.fileUrl && modal.type === 'video' ? (
                  <video ref={videoRef} src={modal.fileUrl} controls
                    className="max-h-96 max-w-full"
                    preload="metadata" />
                ) : (
                  <div className="h-40 flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-16 h-16 opacity-30" />
                  </div>
                )}
                <button onClick={() => setModal(null)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Info & Actions */}
              <div className="p-5 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor(modal.status)}`}>
                    {modal.status}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColor(modal.type)}`}>
                    {modal.type}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-secondary text-muted-foreground">
                    {formatBytes(modal.fileSize)}
                  </span>
                </div>

                {modal.senderName && (
                  <div>
                    <p className="text-xs text-muted-foreground">Người gửi</p>
                    <p className="font-medium">{modal.senderName}</p>
                  </div>
                )}
                {modal.message && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Lời nhắn</p>
                    <p className="text-sm bg-secondary/30 rounded-xl p-3 text-foreground/80">"{modal.message}"</p>
                  </div>
                )}
                {modal.fileName && (
                  <p className="text-xs text-muted-foreground font-mono">📁 {modal.fileName}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Gửi lúc: {new Date(modal.createdAt).toLocaleString('vi-VN')}
                  {modal.reviewedAt && ` · Duyệt lúc: ${new Date(modal.reviewedAt).toLocaleString('vi-VN')}`}
                </p>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                  {modal.status !== 'approved' && (
                    <button onClick={() => handleStatus(modal._id, 'approved')}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors text-sm">
                      <CheckCircle className="w-4 h-4" /> Duyệt
                    </button>
                  )}
                  {modal.status !== 'rejected' && (
                    <button onClick={() => handleStatus(modal._id, 'rejected')}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm">
                      <X className="w-4 h-4" /> Từ chối
                    </button>
                  )}
                  {modal.status !== 'archived' && (
                    <button onClick={() => handleStatus(modal._id, 'archived')}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors text-sm">
                      <Archive className="w-4 h-4" /> Lưu trữ
                    </button>
                  )}
                  {modal.fileUrl && (
                    <a href={modal.fileUrl} download target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#8b5cf6]/20 text-[#a78bfa] hover:bg-[#8b5cf6]/30 transition-colors text-sm">
                      <Download className="w-4 h-4" /> Tải xuống
                    </a>
                  )}
                  <button onClick={() => handleDelete(modal._id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors text-sm ml-auto ${
                      confirmDelete === modal._id
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-secondary text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                    }`}>
                    <Trash2 className="w-4 h-4" />
                    {confirmDelete === modal._id ? 'Xác nhận?' : 'Xóa'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
