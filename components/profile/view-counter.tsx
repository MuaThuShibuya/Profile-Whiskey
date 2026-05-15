'use client'

import { motion } from 'framer-motion'
import { Eye, TrendingUp } from 'lucide-react'

interface ViewCounterProps {
  count: number
  trend?: number
}

export function ViewCounter({ count, trend = 12 }: ViewCounterProps) {
  return (
    <motion.div
      className="fixed top-6 right-6 z-50"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.2, duration: 0.5 }}
    >
      <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
        <div className="relative">
          <Eye className="w-5 h-5 text-[#8b5cf6]" />
          <motion.div
            className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        
        <div>
          <p className="text-lg font-bold text-foreground">
            {count.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-xs text-green-400">
            <TrendingUp className="w-3 h-3" />
            <span>+{trend}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
