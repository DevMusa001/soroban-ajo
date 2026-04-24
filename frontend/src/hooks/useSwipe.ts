import { useRef, useCallback } from 'react'

interface UseSwipeOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number
}

export const useSwipe = ({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
}: UseSwipeOptions) => {
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX
    const diff = touchStartX.current - touchEndX.current

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        onSwipeLeft?.()
      } else {
        onSwipeRight?.()
      }
    }
  }, [onSwipeLeft, onSwipeRight, threshold])

  return { handleTouchStart, handleTouchEnd }
}
