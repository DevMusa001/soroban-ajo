'use client'

import { useEffect, useState } from 'react'

/**
 * SSR-safe hook that returns true when the user prefers reduced motion.
 * Subscribes to changes so it reacts if the user toggles the OS setting.
 */
export function useMotionPreference(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reducedMotion
}
