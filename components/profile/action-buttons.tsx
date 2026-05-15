'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, Send, ImageIcon, Video, MessageCircle,
  Bot, Camera, X, CheckCircle, AlertTriangle, ExternalLink, Upload,
  Tag, Wrench, Sparkles,
} from 'lucide-react'
import Link from 'next/link'

const variantStyles = {
  primary:   'bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] text-white hover:shadow-[#8b5cf6]/40 hover:shadow-xl',
  secondary: 'bg-secondary/80 text-foreground hover:bg-secondary hover:shadow-[#8b5cf6]/20 hover:shadow-lg',
  accent:    'bg-gradient-to-r from-[#38bdf8] to-[#22d3ee] text-white hover:shadow-[#38bdf8]/40 hover:shadow-xl',
}

type ModalType = 'Send Video' | 'Send Image' | 'Request Photo' | 'Contact' | 'Bot List' | null

interface ActionButtonsProps {
  botInvite?: string
}

/* ─── Bot types ─── */
interface BotData {
  _id: string
  name: string
  avatarUrl: string
  shortDescription: string
  inviteUrl: string
  status: 'active' | 'maintenance' | 'beta' | 'hidden'
  tags: string[]
}

const BOT_STATUS: Record<string, { label: string; color: string }> = {
  active:      { label: 'Hoạt động', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  maintenance: { label: 'Bảo trì',   color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  beta:        { label: 'Beta',       color: 'text-sky-400 bg-sky-400/10 border-sky-400/20' },
}

/* ─── Bot list modal ─── */
function BotListModal({ onClose }: { onClose: () => void }) {
  const [bots, setBots] = useState<BotData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/bots')
      .then(r => r.json())
      .then(json => { if (json.success) setBots(json.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        className="w-full max-w-md glass-strong rounded-2xl relative border border-border overflow-hidden"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-bold bg-gradient-to-r from-white to-[#a78bfa] bg-clip-text text-transparent flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#8b5cf6]" />
            Discord Bot
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 animate-pulse">
                  <div className="w-12 h-12 rounded-xl bg-white/5 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/5 rounded w-2/3" />
                    <div className="h-3 bg-white/5 rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : bots.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-2xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center mx-auto mb-3">
                <Bot className="w-7 h-7 text-[#8b5cf6]/50" />
              </div>
              <p className="text-muted-foreground text-sm">Chưa có bot nào.</p>
            </div>
          ) : (
            bots.map(bot => {
              const st = BOT_STATUS[bot.status] ?? BOT_STATUS.active
              const StatusIcon = bot.status === 'maintenance' ? Wrench : bot.status === 'beta' ? Sparkles : null
              const canInvite = bot.inviteUrl && bot.status !== 'maintenance'
              return (
                <div key={bot._id} className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50 hover:border-[#8b5cf6]/25 transition-colors">
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
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${st.color}`}>
                        {StatusIcon && <StatusIcon className="w-2.5 h-2.5" />}
                        {st.label}
                      </span>
                    </div>
                    {bot.shortDescription && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-2">{bot.shortDescription}</p>
                    )}
                    {bot.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2.5">
                        {bot.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] bg-[#8b5cf6]/10 text-[#a78bfa] border border-[#8b5cf6]/15">
                            <Tag className="w-2 h-2" />{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {canInvite ? (
                      <a
                        href={bot.inviteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5865F2]/20 text-[#818cf8] hover:bg-[#5865F2]/30 border border-[#5865F2]/25 text-xs font-medium transition-all"
                      >
                        <ExternalLink className="w-3 h-3" /> Mời vào server
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/10 text-amber-400/60 border border-amber-400/15 text-xs">
                        <Wrench className="w-3 h-3" /> Đang bảo trì
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border flex justify-between items-center">
          <Link href="/bots" onClick={onClose} className="text-xs text-[#a78bfa] hover:text-white transition-colors">
            Xem trang đầy đủ →
          </Link>
          <button onClick={onClose} className="px-4 py-1.5 rounded-lg text-xs glass border border-border text-muted-foreground hover:text-white transition-colors">
            Đóng
          </button>
        </div>
      </motion.div>
    </div>
  )
}

/* ─── Main component ─── */
export function ActionButtons({ botInvite: _botInvite }: ActionButtonsProps) {
  const [modalType, setModalType] = useState<ModalType>(null)
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [senderName, setSenderName] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleFormSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      if (modalType === 'Contact') {
        if (!contactName.trim() || !contactEmail.trim() || !message.trim()) {
          showToast('Vui lòng điền đầy đủ thông tin', 'error')
          return
        }
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: contactName, email: contactEmail, message }),
        })
        const data = await res.json()
        if (data.success) {
          showToast('Tin nhắn đã gửi thành công! 💌')
          closeModal()
        } else {
          showToast(data.message || 'Có lỗi xảy ra', 'error')
        }

      } else if (modalType === 'Send Video' || modalType === 'Send Image') {
        if (!file) { showToast('Vui lòng chọn file', 'error'); return }
        if (file.size > 100 * 1024 * 1024) { showToast('File quá lớn. Tối đa 100MB', 'error'); return }

        const fd = new FormData()
        fd.append('file', file)
        const uploadRes = await fetch('/api/media/upload', { method: 'POST', body: fd })
        const uploadData = await uploadRes.json()
        if (!uploadData.success) { showToast(uploadData.message || 'Lỗi upload file', 'error'); return }

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
        if (saveData.success) { showToast('Đã gửi! Admin sẽ duyệt sớm 🌌'); closeModal() }
        else showToast(saveData.message || 'Có lỗi xảy ra', 'error')

      } else if (modalType === 'Request Photo') {
        const res = await fetch('/api/media/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'photo_request', message, senderName }),
        })
        const data = await res.json()
        if (data.success) { showToast('Đã gửi yêu cầu! Admin sẽ duyệt sớm 🌌'); closeModal() }
        else showToast(data.message || 'Có lỗi xảy ra', 'error')
      }
    } catch {
      showToast('Lỗi kết nối server', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeModal = () => {
    setModalType(null)
    setFile(null)
    setMessage('')
    setSenderName('')
    setContactName('')
    setContactEmail('')
  }

  const MODAL_TITLE: Record<string, string> = {
    'Send Video':    'Gửi Video',
    'Send Image':    'Gửi Ảnh',
    'Request Photo': 'Yêu cầu Ảnh',
    'Contact':       'Liên hệ',
  }

  return (
    <motion.div
      className="flex flex-wrap justify-center gap-3 max-w-lg mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.6 }}
    >
      {/* Xem Profile */}
      <ActionButton variant="primary" delay={1.0}>
        <Link href="/profile" className="flex items-center gap-2">
          <Heart className="w-4 h-4" /> Xem Profile
        </Link>
      </ActionButton>

      {/* Gửi Video */}
      <ActionButton variant="secondary" delay={1.08} onClick={() => setModalType('Send Video')}>
        <Video className="w-4 h-4" /> Gửi Video
      </ActionButton>

      {/* Gửi Ảnh */}
      <ActionButton variant="secondary" delay={1.16} onClick={() => setModalType('Send Image')}>
        <ImageIcon className="w-4 h-4" /> Gửi Ảnh
      </ActionButton>

      {/* Donate */}
      <ActionButton variant="accent" delay={1.24}>
        <Link href="/donate" className="flex items-center gap-2">
          <Send className="w-4 h-4" /> Donate
        </Link>
      </ActionButton>

      {/* Yêu cầu Ảnh */}
      <ActionButton variant="secondary" delay={1.32} onClick={() => setModalType('Request Photo')}>
        <Camera className="w-4 h-4" /> Yêu cầu Ảnh
      </ActionButton>

      {/* Liên hệ */}
      <ActionButton variant="secondary" delay={1.40} onClick={() => setModalType('Contact')}>
        <MessageCircle className="w-4 h-4" /> Liên hệ
      </ActionButton>

      {/* Mời Bot → mở modal danh sách */}
      <ActionButton variant="secondary" delay={1.48} onClick={() => setModalType('Bot List')}>
        <Bot className="w-4 h-4" /> Mời Bot
      </ActionButton>

      {/* Bot list modal */}
      <AnimatePresence>
        {modalType === 'Bot List' && <BotListModal onClose={closeModal} />}
      </AnimatePresence>

      {/* Form modals */}
      <AnimatePresence>
        {modalType && modalType !== 'Bot List' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              className="w-full max-w-md glass-strong rounded-2xl p-6 relative border border-border"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
              <button onClick={closeModal} className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold mb-5 bg-gradient-to-r from-white to-[#a78bfa] bg-clip-text text-transparent">
                {MODAL_TITLE[modalType] ?? modalType}
              </h3>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Tên người gửi (không phải Contact) */}
                {modalType !== 'Contact' && (
                  <div>
                    <label className="block text-sm mb-2 text-muted-foreground">Tên của bạn (tùy chọn)</label>
                    <input
                      type="text" value={senderName} onChange={e => setSenderName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-white focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-all text-sm"
                      placeholder="Nickname..."
                    />
                  </div>
                )}

                {modalType === 'Contact' ? (
                  <>
                    <div>
                      <label className="block text-sm mb-2 text-muted-foreground">Tên của bạn</label>
                      <input
                        type="text" required value={contactName} onChange={e => setContactName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-white focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-all"
                        placeholder="Tên hiển thị..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2 text-muted-foreground">Email</label>
                      <input
                        type="email" required value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-white focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-all"
                        placeholder="your@email.com"
                      />
                    </div>
                  </>
                ) : (
                  (modalType === 'Send Video' || modalType === 'Send Image') && (
                    <div>
                      <label className="block text-sm mb-2 text-muted-foreground">
                        Chọn file {modalType === 'Send Video' ? 'video' : 'ảnh'} *
                      </label>
                      <div className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                        file ? 'border-[#8b5cf6]/50 bg-[#8b5cf6]/5' : 'border-border hover:border-[#8b5cf6]/30'
                      }`}>
                        <input
                          type="file" required
                          accept={modalType === 'Send Video'
                            ? 'video/mp4,video/webm,video/quicktime'
                            : 'image/jpeg,image/png,image/webp,image/gif'}
                          onChange={e => setFile(e.target.files?.[0] || null)}
                          className="hidden"
                          id="file-input"
                        />
                        <label htmlFor="file-input" className="cursor-pointer block">
                          {file ? (
                            <div className="space-y-1">
                              <div className="flex items-center justify-center gap-2 text-[#a78bfa]">
                                {file.type.startsWith('video') ? <Video className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                                <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <Upload className="w-7 h-7 text-muted-foreground/40 mx-auto" />
                              <p className="text-sm text-muted-foreground">Click để chọn file</p>
                              <p className="text-xs text-muted-foreground/60">
                                {modalType === 'Send Video' ? 'MP4, WebM, MOV · Tối đa 100MB' : 'JPG, PNG, WebP, GIF · Tối đa 10MB'}
                              </p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  )
                )}

                <div>
                  <label className="block text-sm mb-2 text-muted-foreground">
                    {modalType === 'Contact' ? 'Tin nhắn' : 'Lời nhắn (tùy chọn)'}
                  </label>
                  <textarea
                    required={modalType === 'Contact'}
                    value={message} onChange={e => setMessage(e.target.value)}
                    className="w-full p-4 rounded-xl bg-secondary/50 border border-border text-white focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-all resize-none"
                    rows={3}
                    placeholder={modalType === 'Contact' ? 'Nội dung muốn nhắn...' : 'Viết gì đó...'}
                  />
                </div>

                <button
                  disabled={isSubmitting} type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] rounded-xl text-white font-medium hover:shadow-lg hover:shadow-[#8b5cf6]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting
                    ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    : <Send className="w-4 h-4" />}
                  {isSubmitting
                    ? (modalType === 'Send Video' || modalType === 'Send Image' ? 'Đang upload...' : 'Đang gửi...')
                    : (modalType === 'Contact' ? 'Gửi tin nhắn' : 'Gửi')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl glass-strong border border-border shadow-2xl max-w-xs"
          >
            {toast.type === 'success'
              ? <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 flex-shrink-0"><CheckCircle className="w-4 h-4" /></div>
              : <div className="w-7 h-7 rounded-full bg-destructive/20 flex items-center justify-center text-destructive flex-shrink-0"><AlertTriangle className="w-4 h-4" /></div>}
            <p className="text-sm font-medium text-foreground">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ActionButton({
  children, variant, delay, onClick,
}: {
  children: React.ReactNode
  variant: keyof typeof variantStyles
  delay: number
  onClick?: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 400 }}
    >
      <motion.button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${variantStyles[variant]}`}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        type="button"
      >
        {children}
      </motion.button>
    </motion.div>
  )
}
