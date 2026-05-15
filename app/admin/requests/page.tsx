'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, CheckCircle, X, Trash2, RefreshCw, AlertTriangle, Search, Filter } from 'lucide-react'

type Status = 'all' | 'pending' | 'approved' | 'rejected'

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Status>('all')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/media/request')
      const json = await res.json()
      if (json.success) setRequests(json.data)
    } catch { showToast('Lỗi tải dữ liệu', 'error') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  const handleStatus = async (id: string, status: string) => {
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
      } else { showToast(data.message || 'Lỗi', 'error') }
    } catch { showToast('Lỗi kết nối', 'error') }
  }

  const handleDelete = async (id: string) => {
    if (confirmDelete !== id) { setConfirmDelete(id); return }
    setConfirmDelete(null)
    try {
      const res = await fetch(`/api/media/request/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setRequests(prev => prev.filter(r => r._id !== id))
        showToast('Đã xóa request')
      } else { showToast(data.message || 'Lỗi', 'error') }
    } catch { showToast('Lỗi kết nối', 'error') }
  }

  const filtered = requests.filter(r => {
    const matchFilter = filter === 'all' || r.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q || r.message?.toLowerCase().includes(q) || r.type?.toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  }

  const statusColor = (s: string) =>
    s === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
    s === 'approved' ? 'bg-green-500/20 text-green-400' :
    'bg-red-500/20 text-red-400'

  const typeColor = (t: string) =>
    t === 'video' ? 'bg-blue-500/20 text-blue-400' :
    t === 'image' ? 'bg-emerald-500/20 text-emerald-400' :
    'bg-purple-500/20 text-purple-400'

  return (
    <div className="p-4 lg:p-8">
      <motion.div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#38bdf8]/20 to-[#22d3ee]/20 border border-[#38bdf8]/20">
            <MessageSquare className="w-5 h-5 text-[#38bdf8]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-[#a78bfa] to-[#38bdf8] bg-clip-text text-transparent">Media Requests</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{requests.length} requests · {counts.pending} pending</p>
          </div>
        </div>
        <button onClick={fetchRequests}
          className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </motion.div>

      {/* Filter + Search */}
      <motion.div className="flex flex-col sm:flex-row gap-3 mb-5"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <div className="flex gap-1.5 p-1 glass rounded-xl flex-wrap">
          {(['all','pending','approved','rejected'] as Status[]).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                filter === s ? 'bg-gradient-to-r from-[#8b5cf6] to-[#38bdf8] text-white' : 'text-muted-foreground hover:text-foreground'
              }`}>
              {s} {counts[s] > 0 && <span className="ml-1 opacity-70">({counts[s]})</span>}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo message, type..."
            className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/40 transition-all" />
        </div>
      </motion.div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Filter className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Không có request nào{search ? ` cho "${search}"` : filter !== 'all' ? ` trạng thái ${filter}` : ''}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r, i) => (
            <motion.div key={r._id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="glass rounded-2xl p-4 border border-border/50">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColor(r.type)}`}>{r.type}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(r.status)}`}>{r.status}</span>
                    <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString('vi-VN')} · {new Date(r.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-2">"{r.message}"</p>
                  {r.fileName && <p className="text-xs text-muted-foreground/60 font-mono truncate">📁 {r.fileName}</p>}
                  {r.fileUrl && (
                    <div className="mt-2">
                      {r.type === 'image' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.fileUrl} alt="preview" className="h-20 rounded-lg object-cover" />
                      ) : r.type === 'video' ? (
                        <video src={r.fileUrl} className="h-20 rounded-lg" controls />
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {r.status === 'pending' && (
                    <>
                      <button onClick={() => handleStatus(r._id, 'approved')}
                        className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors" title="Approve">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleStatus(r._id, 'rejected')}
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors" title="Reject">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button onClick={() => handleDelete(r._id)}
                    className={`p-2 rounded-lg transition-colors ${
                      confirmDelete === r._id ? 'bg-red-500 text-white animate-pulse' : 'bg-secondary text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                    }`} title={confirmDelete === r._id ? 'Nhấn lại để xác nhận' : 'Delete'}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

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
