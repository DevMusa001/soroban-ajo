import React from 'react'

export type SkeletonAnimation = 'pulse' | 'shimmer' | 'none'

interface SkeletonProps {
  className?: string
  animation?: SkeletonAnimation
  width?: string | number
  height?: string | number
  rounded?: string
}

/**
 * Base skeleton primitive. Use `animation="shimmer"` for the shimmer effect,
 * `animation="pulse"` (default) for the pulse effect, or `animation="none"`.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  animation = 'shimmer',
  width,
  height,
  rounded = 'rounded',
}) => {
  const animClass =
    animation === 'shimmer'
      ? 'skeleton-shimmer'
      : animation === 'pulse'
        ? 'skeleton animate-pulse'
        : 'skeleton'

  return (
    <div
      className={`${animClass} ${rounded} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}
