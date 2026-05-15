'use client'

import { motion } from 'framer-motion'

interface StatusBadgeProps {
  status: 'online' | 'idle' | 'dnd' | 'offline'
}

const statusConfig = {
  online: {
    color: 'bg-green-500',
    glow: 'shadow-green-500/50',
    label: 'Online',
  },
  idle: {
    color: 'bg-yellow-500',
    glow: 'shadow-yellow-500/50',
    label: 'Idle',
  },
  dnd: {
    color: 'bg-red-500',
    glow: 'shadow-red-500/50',
    label: 'Do Not Disturb',
  },
  offline: {
    color: 'bg-gray-500',
    glow: 'shadow-gray-500/50',
    label: 'Offline',
  },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <motion.div
      className="absolute -bottom-1 -right-1"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 500 }}
    >
      <div className="relative">
        {/* Glow effect */}
        <div
          className={`absolute inset-0 ${config.color} rounded-full blur-md opacity-60`}
        />
        {/* Status dot */}
        <div
          className={`relative w-5 h-5 ${config.color} rounded-full border-4 border-[#1a1a2e] shadow-lg ${config.glow}`}
        />
        {/* Pulse animation for online status */}
        {status === 'online' && (
          <motion.div
            className={`absolute inset-0 ${config.color} rounded-full`}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </div>
    </motion.div>
  )
}
