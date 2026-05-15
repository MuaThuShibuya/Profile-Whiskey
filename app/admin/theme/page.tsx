'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Palette,
  Sparkles,
  Eye,
  Save,
  RotateCcw,
  Sun,
  Droplets,
  Wind,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'

interface ThemeSettings {
  primaryColor: string
  accentColor: string
  glowIntensity: number
  blurIntensity: number
  particleCount: number
  particleSpeed: number
  floatAnimation: boolean
  noiseOverlay: boolean
}

const defaultSettings: ThemeSettings = {
  primaryColor: '#8b5cf6',
  accentColor: '#38bdf8',
  glowIntensity: 50,
  blurIntensity: 70,
  particleCount: 80,
  particleSpeed: 30,
  floatAnimation: true,
  noiseOverlay: true,
}

function profileToSettings(data: any): ThemeSettings {
  return {
    primaryColor: data?.theme?.primaryColor ?? defaultSettings.primaryColor,
    accentColor: data?.theme?.accentColor ?? defaultSettings.accentColor,
    glowIntensity: data?.theme?.glowIntensity ?? defaultSettings.glowIntensity,
    blurIntensity: data?.theme?.blurIntensity ?? defaultSettings.blurIntensity,
    particleCount: data?.theme?.particleCount ?? defaultSettings.particleCount,
    particleSpeed: data?.theme?.particleSpeed ?? defaultSettings.particleSpeed,
    floatAnimation: data?.effects?.enableFloatingAnimation ?? defaultSettings.floatAnimation,
    noiseOverlay: data?.effects?.enableNoiseOverlay ?? defaultSettings.noiseOverlay,
  }
}

export default function ThemeEditorPage() {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings)
  const [activeTab, setActiveTab] = useState<'colors' | 'effects' | 'particles'>('colors')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/profile')
      const json = await res.json()
      if (json.success && json.data) {
        setSettings(profileToSettings(json.data))
      }
    } catch {
      showToast('Không thể tải cài đặt giao diện', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadProfile() }, [loadProfile])

  const updateSetting = <K extends keyof ThemeSettings>(
    key: K,
    value: ThemeSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'theme.primaryColor': settings.primaryColor,
          'theme.accentColor': settings.accentColor,
          'theme.glowIntensity': settings.glowIntensity,
          'theme.blurIntensity': settings.blurIntensity,
          'theme.particleCount': settings.particleCount,
          'theme.particleSpeed': settings.particleSpeed,
          'effects.enableFloatingAnimation': settings.floatAnimation,
          'effects.enableNoiseOverlay': settings.noiseOverlay,
        }),
      })
      const data = await res.json()
      if (data.success) {
        showToast('Đã lưu giao diện thành công!')
        setSettings(profileToSettings(data.data))
      } else {
        showToast(data.message || 'Lỗi khi lưu', 'error')
      }
    } catch {
      showToast('Lỗi kết nối server', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-[#a78bfa] to-[#38bdf8] bg-clip-text text-transparent">
          Theme Editor
        </h1>
        <p className="text-muted-foreground mt-2">
          Tùy chỉnh giao diện và hiệu ứng
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Editor Panel */}
        <motion.div
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Tabs */}
          <div className="flex gap-2 p-1 glass rounded-xl">
            {[
              { id: 'colors', label: 'Màu sắc', icon: Palette },
              { id: 'effects', label: 'Hiệu ứng', icon: Sparkles },
              { id: 'particles', label: 'Hạt lửa', icon: Wind },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Colors Tab */}
          {activeTab === 'colors' && (
            <motion.div
              className="glass rounded-2xl p-6 space-y-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-lg font-semibold text-foreground">Bảng màu</h3>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Primary Color */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Màu chính</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => updateSetting('primaryColor', e.target.value)}
                      className="w-12 h-12 rounded-xl cursor-pointer border-2 border-border"
                    />
                    <input
                      type="text"
                      value={settings.primaryColor}
                      onChange={(e) => updateSetting('primaryColor', e.target.value)}
                      className="flex-1 px-4 py-2 bg-secondary/50 border border-border rounded-xl text-foreground font-mono"
                    />
                  </div>
                  <div className="flex gap-2">
                    {['#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#3b82f6'].map((color) => (
                      <button
                        key={color}
                        onClick={() => updateSetting('primaryColor', color)}
                        className="w-8 h-8 rounded-lg border-2 border-border hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        aria-label={`Đặt màu chính thành ${color}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Accent Color */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Màu phụ</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => updateSetting('accentColor', e.target.value)}
                      className="w-12 h-12 rounded-xl cursor-pointer border-2 border-border"
                    />
                    <input
                      type="text"
                      value={settings.accentColor}
                      onChange={(e) => updateSetting('accentColor', e.target.value)}
                      className="flex-1 px-4 py-2 bg-secondary/50 border border-border rounded-xl text-foreground font-mono"
                    />
                  </div>
                  <div className="flex gap-2">
                    {['#38bdf8', '#22d3ee', '#a78bfa', '#f472b6', '#fb923c'].map((color) => (
                      <button
                        key={color}
                        onClick={() => updateSetting('accentColor', color)}
                        className="w-8 h-8 rounded-lg border-2 border-border hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        aria-label={`Đặt màu phụ thành ${color}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Effects Tab */}
          {activeTab === 'effects' && (
            <motion.div
              className="glass rounded-2xl p-6 space-y-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-lg font-semibold text-foreground">Hiệu ứng hình ảnh</h3>

              <div className="space-y-6">
                {/* Glow Intensity */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      Cường độ glow
                    </label>
                    <span className="text-sm text-muted-foreground">{settings.glowIntensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.glowIntensity}
                    onChange={(e) => updateSetting('glowIntensity', parseInt(e.target.value))}
                    className="w-full accent-[#8b5cf6]"
                  />
                </div>

                {/* Blur Intensity */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Droplets className="w-4 h-4" />
                      Cường độ blur
                    </label>
                    <span className="text-sm text-muted-foreground">{settings.blurIntensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.blurIntensity}
                    onChange={(e) => updateSetting('blurIntensity', parseInt(e.target.value))}
                    className="w-full accent-[#8b5cf6]"
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-4">
                  {[
                    { key: 'floatAnimation' as const, label: 'Hiệu ứng nổi', desc: 'Các phần tử trang trí lơ lửng' },
                    { key: 'noiseOverlay' as const, label: 'Noise Overlay', desc: 'Kết cấu hạt phim analog' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                      <div>
                        <p className="text-sm font-medium text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <button
                        onClick={() => updateSetting(key, !settings[key])}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings[key] ? 'bg-[#8b5cf6]' : 'bg-secondary'
                        }`}
                        role="switch"
                        aria-checked={settings[key]}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            settings[key] ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Particles Tab */}
          {activeTab === 'particles' && (
            <motion.div
              className="glass rounded-2xl p-6 space-y-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-lg font-semibold text-foreground">Cài đặt hạt</h3>

              <div className="space-y-6">
                {/* Particle Count */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Số lượng hạt</label>
                    <span className="text-sm text-muted-foreground">{settings.particleCount}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={settings.particleCount}
                    onChange={(e) => updateSetting('particleCount', parseInt(e.target.value))}
                    className="w-full accent-[#8b5cf6]"
                  />
                </div>

                {/* Particle Speed */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Tốc độ hạt</label>
                    <span className="text-sm text-muted-foreground">{settings.particleSpeed}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.particleSpeed}
                    onChange={(e) => updateSetting('particleSpeed', parseInt(e.target.value))}
                    className="w-full accent-[#8b5cf6]"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <motion.button
              className="flex-1 py-3 px-4 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSettings(defaultSettings)}
            >
              <RotateCcw className="w-4 h-4" />
              Khôi phục mặc định
            </motion.button>
            <motion.button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-[#8b5cf6]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSaving
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Save className="w-4 h-4" />}
              {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </motion.button>
          </div>
        </motion.div>

        {/* Preview Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="glass rounded-2xl p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Xem trước
            </h3>

            {/* Mini preview */}
            <div
              className="relative aspect-[9/16] rounded-xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${settings.primaryColor}20, ${settings.accentColor}20)`,
              }}
            >
              {/* Aurora preview */}
              <div
                className="absolute top-0 left-1/4 w-32 h-24 rounded-full"
                style={{
                  background: `radial-gradient(ellipse at center, ${settings.primaryColor}${Math.round(settings.glowIntensity * 0.4).toString(16).padStart(2, '0')}, transparent 70%)`,
                  filter: `blur(${Math.round(settings.blurIntensity * 0.3)}px)`,
                }}
              />
              <div
                className="absolute top-1/3 right-1/4 w-24 h-20 rounded-full"
                style={{
                  background: `radial-gradient(ellipse at center, ${settings.accentColor}${Math.round(settings.glowIntensity * 0.3).toString(16).padStart(2, '0')}, transparent 70%)`,
                  filter: `blur(${Math.round(settings.blurIntensity * 0.25)}px)`,
                }}
              />

              {/* Card preview */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 aspect-square rounded-xl border"
                style={{
                  background: `rgba(18, 18, 35, ${settings.blurIntensity * 0.008})`,
                  backdropFilter: `blur(${settings.blurIntensity * 0.3}px)`,
                  borderColor: `${settings.primaryColor}30`,
                  boxShadow: `0 0 ${settings.glowIntensity * 0.4}px ${settings.primaryColor}30`,
                  animation: settings.floatAnimation ? 'float 6s ease-in-out infinite' : 'none',
                }}
              >
                {/* Avatar placeholder */}
                <div
                  className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})`,
                  }}
                />
              </div>

              {/* Noise overlay */}
              {settings.noiseOverlay && (
                <div
                  className="absolute inset-0 opacity-[0.015] pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  }}
                />
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-3">
              Preview cập nhật real-time
            </p>
          </div>
        </motion.div>
      </div>

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
