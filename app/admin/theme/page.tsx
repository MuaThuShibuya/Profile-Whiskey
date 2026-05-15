'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Palette,
  Sparkles,
  Eye,
  Save,
  RotateCcw,
  Sun,
  Droplets,
  Wind,
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

export default function ThemeEditorPage() {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings)
  const [activeTab, setActiveTab] = useState<'colors' | 'effects' | 'particles'>('colors')

  const updateSetting = <K extends keyof ThemeSettings>(
    key: K,
    value: ThemeSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-glow bg-gradient-to-r from-white via-[#a78bfa] to-[#38bdf8] bg-clip-text text-transparent">
          Theme Editor
        </h1>
        <p className="text-muted-foreground mt-2">
          Customize the look and feel of your abyss
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
              { id: 'colors', label: 'Colors', icon: Palette },
              { id: 'effects', label: 'Effects', icon: Sparkles },
              { id: 'particles', label: 'Particles', icon: Wind },
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
              <h3 className="text-lg font-semibold text-foreground">Color Palette</h3>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Primary Color */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Primary Color</label>
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
                        aria-label={`Set primary color to ${color}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Accent Color */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Accent Color</label>
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
                        aria-label={`Set accent color to ${color}`}
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
              <h3 className="text-lg font-semibold text-foreground">Visual Effects</h3>

              <div className="space-y-6">
                {/* Glow Intensity */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      Glow Intensity
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
                      Blur Intensity
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
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                    <span className="font-medium text-foreground">Float Animation</span>
                    <button
                      onClick={() => updateSetting('floatAnimation', !settings.floatAnimation)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.floatAnimation ? 'bg-[#8b5cf6]' : 'bg-secondary'
                      }`}
                      role="switch"
                      aria-checked={settings.floatAnimation}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          settings.floatAnimation ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                    <span className="font-medium text-foreground">Noise Overlay</span>
                    <button
                      onClick={() => updateSetting('noiseOverlay', !settings.noiseOverlay)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.noiseOverlay ? 'bg-[#8b5cf6]' : 'bg-secondary'
                      }`}
                      role="switch"
                      aria-checked={settings.noiseOverlay}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          settings.noiseOverlay ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
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
              <h3 className="text-lg font-semibold text-foreground">Particle Settings</h3>

              <div className="space-y-6">
                {/* Particle Count */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Particle Count</label>
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
                    <label className="text-sm font-medium text-foreground">Particle Speed</label>
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
              Reset to Default
            </motion.button>
            <motion.button
              className="flex-1 py-3 px-4 bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-[#8b5cf6]/30 transition-all flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save className="w-4 h-4" />
              Save Changes
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
              Live Preview
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
          </div>
        </motion.div>
      </div>
    </div>
  )
}
