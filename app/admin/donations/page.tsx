'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Save, RotateCcw, Copy, Check, CheckCircle, AlertTriangle } from 'lucide-react'
import { useAdminProfile } from '@/hooks/use-admin-profile'

const inp = 'w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#ef4444]/40 focus:border-[#ef4444]/60 transition-all text-sm'
const lbl = 'text-xs font-medium text-muted-foreground uppercase tracking-wide'

export default function AdminDonationsPage() {
  const { formData, setNested, handleSave, resetToSaved, isSaving, loading, error, toast } = useAdminProfile()
  const [copied, setCopied] = useState<string | null>(null)

  const copy = (text: string, key: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
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

  const bank = formData.bank ?? {}

  return (
    <div className="p-4 lg:p-8">
      <motion.div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#ef4444]/20 to-[#f87171]/20 border border-[#ef4444]/20">
            <Heart className="w-5 h-5 text-[#ef4444]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-[#a78bfa] to-[#38bdf8] bg-clip-text text-transparent">Donation Settings</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Thông tin ngân hàng và QR code</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={resetToSaved}
            className="px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Discard
          </button>
          <button onClick={() => handleSave()} disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ef4444] to-[#f87171] text-white font-medium hover:shadow-lg hover:shadow-[#ef4444]/30 transition-all flex items-center gap-2 disabled:opacity-50 text-sm">
            {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Save to MongoDB
          </button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <motion.div className="glass rounded-2xl p-6 space-y-4"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-base font-semibold text-foreground">Bank Info</h2>
          {[
            { label: 'Tên ngân hàng', key: 'bank.bankName', placeholder: 'Vietcombank' },
            { label: 'Số tài khoản', key: 'bank.accountNumber', placeholder: '1234567890', mono: true },
            { label: 'Tên chủ tài khoản', key: 'bank.accountName', placeholder: 'NGUYEN VAN A' },
            { label: 'Nội dung chuyển khoản', key: 'bank.transferContent', placeholder: 'donate whiskey' },
            { label: 'QR Code URL', key: 'bank.qrCode', placeholder: 'https://cdn.example.com/qr.png' },
          ].map(f => (
            <div key={f.key} className="space-y-1.5">
              <label className={lbl}>{f.label}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={bank[f.key.split('.')[1]] ?? ''}
                  onChange={e => setNested(f.key, e.target.value)}
                  className={inp + (f.mono ? ' font-mono' : '')}
                  placeholder={f.placeholder}
                />
                <button
                  onClick={() => copy(bank[f.key.split('.')[1]] ?? '', f.key)}
                  disabled={!bank[f.key.split('.')[1]]}
                  className="p-3 rounded-xl bg-secondary/50 border border-border hover:bg-secondary disabled:opacity-40 transition-colors flex-shrink-0">
                  {copied === f.key ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Preview */}
        <motion.div className="space-y-4"
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <div className="glass rounded-2xl p-6 sticky top-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Preview</h2>

            {/* Bank card preview */}
            <div className="relative">
              <div className="absolute -inset-[1px] bg-gradient-to-r from-[#ef4444] via-[#f87171] to-[#a78bfa] rounded-2xl opacity-30 blur-sm" />
              <div className="relative glass-strong rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ef4444] to-[#f87171] flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{bank.bankName || 'Tên ngân hàng'}</p>
                    <p className="text-xs text-muted-foreground">Bank Transfer</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-secondary/30">
                    <span className="text-muted-foreground text-xs">Số TK</span>
                    <span className="font-mono font-medium">{bank.accountNumber || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-secondary/30">
                    <span className="text-muted-foreground text-xs">Chủ TK</span>
                    <span className="font-medium">{bank.accountName || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-secondary/30">
                    <span className="text-muted-foreground text-xs">Nội dung</span>
                    <span className="text-xs">{bank.transferContent || '—'}</span>
                  </div>
                </div>

                {/* QR preview */}
                {bank.qrCode && (
                  <div className="flex justify-center">
                    <div className="w-32 h-32 bg-white rounded-xl p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={bank.qrCode} alt="QR" className="w-full h-full object-contain" />
                    </div>
                  </div>
                )}
                {!bank.qrCode && (
                  <div className="flex justify-center">
                    <div className="w-32 h-32 bg-secondary/30 rounded-xl flex items-center justify-center">
                      <span className="text-xs text-muted-foreground text-center">QR Code<br />preview</span>
                    </div>
                  </div>
                )}
              </div>
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
