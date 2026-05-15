'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  User,
  Image as ImageIcon,
  Music,
  Palette,
  Link2,
  Heart,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Shield,
  Bot,
} from 'lucide-react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Tổng quan',    href: '/admin' },
  { icon: User,           label: 'Profile',        href: '/admin/profile' },
  { icon: ImageIcon,      label: 'Media nhận',     href: '/admin/media' },
  { icon: Bot,            label: 'Quản lý Bot',    href: '/admin/bots' },
  { icon: Music,          label: 'Âm nhạc',        href: '/admin/music' },
  { icon: Palette,        label: 'Giao diện',      href: '/admin/theme' },
  { icon: Link2,          label: 'Mạng xã hội',    href: '/admin/links' },
  { icon: Heart,          label: 'Donate',         href: '/admin/donations' },
  { icon: MessageSquare,  label: 'Yêu cầu',        href: '/admin/requests' },
]

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-xl glass lg:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className={`fixed top-0 left-0 h-full w-64 glass-strong z-40 border-r border-border transition-transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#38bdf8] flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Admin Panel</h2>
              <p className="text-xs text-muted-foreground">Abyss Control</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
              >
                <motion.div
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#8b5cf6]/20 to-[#38bdf8]/20 text-foreground border border-[#8b5cf6]/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-[#8b5cf6]' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-[#8b5cf6]"
                      layoutId="activeIndicator"
                    />
                  )}
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#38bdf8] flex items-center justify-center text-white font-bold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">Admin</p>
              <p className="text-xs text-muted-foreground">Super Admin</p>
            </div>
            <button
              onClick={async () => {
                await fetch('/api/admin/logout', { method: 'POST' })
                window.location.href = '/login'
              }}
              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
