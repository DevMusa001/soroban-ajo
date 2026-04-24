'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMotionPreference } from '../hooks/useMotionPreference'

interface PageTransitionProps {
  children: React.ReactNode
  /** Key to trigger re-animation on route change */
  routeKey?: string
}

export function PageTransition({ children, routeKey }: PageTransitionProps) {
  const reducedMotion = useMotionPreference()

  if (reducedMotion) {
    return <div className="w-full h-full">{children}</div>
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        className="w-full h-full"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

/** Fade-in wrapper for individual sections */
export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const reducedMotion = useMotionPreference()
  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

/** Staggered list container */
export function StaggeredList({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const reducedMotion = useMotionPreference()
  return (
    <motion.ul
      className={className}
      initial={reducedMotion ? false : 'hidden'}
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
      }}
    >
      {children}
    </motion.ul>
  )
}

/** Individual staggered list item */
export function StaggeredItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.li
      className={className}
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
      }}
    >
      {children}
    </motion.li>
  )
}
