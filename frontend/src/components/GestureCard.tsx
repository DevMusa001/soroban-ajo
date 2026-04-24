'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useMotionPreference } from '../hooks/useMotionPreference'

interface GestureCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  /** Lift amount in px on hover (default 4) */
  liftPx?: number
  /** Whether the card is interactive */
  interactive?: boolean
}

/**
 * Card with hover lift, tap press, and drag gesture feedback.
 * Respects prefers-reduced-motion.
 */
export function GestureCard({
  children,
  className,
  onClick,
  liftPx = 4,
  interactive = true,
}: GestureCardProps) {
  const reducedMotion = useMotionPreference()

  if (reducedMotion || !interactive) {
    return (
      <div className={className} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={className}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      whileHover={{ y: -liftPx, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
      whileTap={{ scale: 0.98, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  )
}
