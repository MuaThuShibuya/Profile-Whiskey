'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Copy, 
  Check, 
  Heart, 
  Crown,
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { AuroraBackground } from '@/components/abyss/aurora-background'
import { ParticleBackground } from '@/components/abyss/particle-background'
export default function DonatePage() {
  const [copied, setCopied] = useState<string | null>(null)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [config, setConfig] = useState<any>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(json => { if (json.success) setConfig(json.data); else setError(true) })
      .catch(() => setError(true))
  }, [])

  const copyToClipboard = (text: string, type: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const quickAmounts = [10000, 20000, 50000, 100000, 200000, 500000]

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN').format(amount) + ' VND'

  if (error) return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0a15] text-white">
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">Không tải được dữ liệu.</p>
        <button onClick={() => { setError(false); window.location.reload() }}
          className="px-4 py-2 rounded-xl bg-[#8b5cf6] text-white text-sm">Retry</button>
      </div>
    </main>
  )

  if (!config) return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0a15]">
      <div className="w-8 h-8 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
    </main>
  )

  const bankInfo = config.bank

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AuroraBackground />
      <ParticleBackground />

      <div className="relative z-10 min-h-screen px-4 py-20">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span className="text-sm">Back to Profile</span>
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold text-glow bg-gradient-to-r from-white via-[#a78bfa] to-[#38bdf8] bg-clip-text text-transparent">
            Support the Abyss
          </h1>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto">
            Your support helps keep the void illuminated. Every donation is deeply appreciated.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* QR Code & Bank Info */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute -inset-[1px] bg-gradient-to-r from-[#8b5cf6] via-[#38bdf8] to-[#a78bfa] rounded-2xl opacity-40 blur-sm" />
              
              <div className="relative glass-strong rounded-2xl p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* QR Code */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      {/* QR Glow */}
                      <motion.div
                        className="absolute -inset-4 bg-gradient-to-r from-[#8b5cf6] to-[#38bdf8] rounded-2xl opacity-20 blur-xl"
                        animate={{
                          opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      
                      {/* QR Code từ MongoDB */}
                      <div className="relative w-48 h-48 bg-white rounded-xl p-3 shadow-lg shadow-[#8b5cf6]/20">
                        {bankInfo.qrCode ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={bankInfo.qrCode} alt="QR Code" className="w-full h-full object-contain rounded-lg" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#0a0a15] rounded-lg flex items-center justify-center">
                            <p className="text-xs text-muted-foreground text-center px-3">QR chưa được cấu hình</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-center text-xs text-muted-foreground mt-3">
                      Scan QR to donate
                    </p>
                  </div>

                  {/* Bank details */}
                  <div className="flex-1 space-y-4">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <Heart className="w-5 h-5 text-[#ef4444]" />
                      Bank Transfer
                    </h2>

                    <div className="space-y-3">
                      {/* Bank name */}
                      <div className="p-3 rounded-xl bg-secondary/50 border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Bank</p>
                        <p className="font-medium text-foreground">{bankInfo.bankName}</p>
                      </div>

                      {/* Account number */}
                      <div className="p-3 rounded-xl bg-secondary/50 border border-border flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Account Number</p>
                          <p className="font-mono font-medium text-foreground">{bankInfo.accountNumber}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(bankInfo.accountNumber, 'account')}
                          className="p-2 rounded-lg hover:bg-secondary transition-colors"
                          aria-label="Copy account number"
                        >
                          {copied === 'account' ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <Copy className="w-5 h-5 text-muted-foreground" />
                          )}
                        </button>
                      </div>

                      {/* Account name */}
                      <div className="p-3 rounded-xl bg-secondary/50 border border-border flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Account Name</p>
                          <p className="font-medium text-foreground">{bankInfo.accountName}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(bankInfo.accountName, 'name')}
                          className="p-2 rounded-lg hover:bg-secondary transition-colors"
                          aria-label="Copy account name"
                        >
                          {copied === 'name' ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <Copy className="w-5 h-5 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Quick amounts */}
                    <div className="pt-4">
                      <p className="text-sm text-muted-foreground mb-3">Quick amounts:</p>
                      <div className="flex flex-wrap gap-2">
                        {quickAmounts.map((amount) => (
                          <motion.button
                            key={amount}
                            onClick={() => setSelectedAmount(amount)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                              selectedAmount === amount
                                ? 'bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] text-white shadow-lg shadow-[#8b5cf6]/30'
                                : 'bg-secondary/50 text-foreground hover:bg-secondary'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {formatCurrency(amount)}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Other payment methods */}
                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-4">Other payment methods:</p>
                  <div className="flex flex-wrap gap-3">
                    {['Momo', 'ZaloPay', 'PayPal'].map((method) => (
                      <button
                        key={method}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 text-foreground hover:bg-secondary transition-colors text-sm"
                      >
                        <span>{method}</span>
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Leaderboard & Recent */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Top Supporters */}
            <div className="relative">
              <div className="absolute -inset-[1px] bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] rounded-2xl opacity-30 blur-sm" />
              
              <div className="relative glass-strong rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  Top Supporters
                </h3>

                <div className="space-y-3">
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Bảng xếp hạng sẽ sớm được cập nhật từ hệ thống.
                      </p>
                </div>
              </div>
            </div>

            {/* Recent Donations */}
            <div className="relative">
              <div className="absolute -inset-[1px] bg-gradient-to-r from-[#38bdf8] to-[#a78bfa] rounded-2xl opacity-30 blur-sm" />
              
              <div className="relative glass-strong rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-[#38bdf8]" />
                  Recent Donations
                </h3>

                <div className="space-y-4">
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Lịch sử donate sẽ hiển thị tại đây.
                      </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
