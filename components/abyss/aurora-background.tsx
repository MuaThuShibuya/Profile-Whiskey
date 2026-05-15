'use client'

import { motion } from 'framer-motion'

export function AuroraBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden z-0">
      {/* Deep background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a15] via-[#0d0d1a] to-[#050510]" />
      
      {/* Aurora layers */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        {/* Purple aurora */}
        <motion.div
          className="absolute top-0 left-1/4 w-[800px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
          animate={{
            x: [0, 100, -50, 0],
            y: [0, 50, -30, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Ice blue aurora */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-[600px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.1) 0%, transparent 70%)',
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
          animate={{
            x: [0, -80, 60, 0],
            y: [0, -40, 20, 0],
            scale: [1, 0.9, 1.05, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Violet glow */}
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-[500px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(167, 139, 250, 0.12) 0%, transparent 70%)',
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
          animate={{
            x: [0, 60, -40, 0],
            y: [0, -60, 40, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Subtle crimson accent */}
        <motion.div
          className="absolute bottom-1/3 right-1/3 w-[300px] h-[300px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(239, 68, 68, 0.08) 0%, transparent 70%)',
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
          animate={{
            x: [0, -30, 50, 0],
            y: [0, 30, -20, 0],
            scale: [1, 1.2, 0.85, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>

      {/* Noise overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(5, 5, 16, 0.4) 100%)',
        }}
      />
    </div>
  )
}
