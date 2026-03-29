'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { clsx } from 'clsx'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

interface CountdownTimerProps {
  /** Target ISO date string */
  targetDate: string
  /** Show seconds unit */
  showSeconds?: boolean
  /** Compact single-line variant */
  compact?: boolean
  className?: string
  /** Called once when the countdown reaches zero */
  onExpire?: () => void
}

function computeTimeLeft(targetDate: string): TimeLeft {
  const total = new Date(targetDate).getTime() - Date.now()
  if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }

  return {
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
  }
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/**
 * Live countdown timer that ticks every second.
 * Supports both a full block layout and a compact inline variant.
 */
export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  showSeconds = true,
  compact = false,
  className,
  onExpire,
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => computeTimeLeft(targetDate))
  const expired = timeLeft.total <= 0

  const tick = useCallback(() => {
    const next = computeTimeLeft(targetDate)
    setTimeLeft(next)
    if (next.total <= 0) onExpire?.()
  }, [targetDate, onExpire])

  useEffect(() => {
    if (expired) return
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [tick, expired])

  // Re-sync when targetDate changes
  useEffect(() => {
    setTimeLeft(computeTimeLeft(targetDate))
  }, [targetDate])

  if (expired) {
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1.5 text-sm font-semibold text-success-600 dark:text-success-500',
          className
        )}
        aria-live="polite"
      >
        <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" aria-hidden="true" />
        Payout due
      </span>
    )
  }

  if (compact) {
    return (
      <span
        className={clsx('font-mono text-sm tabular-nums text-surface-700 dark:text-slate-300', className)}
        aria-label={`${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m remaining`}
        aria-live="off"
      >
        {timeLeft.days > 0 && <>{timeLeft.days}d </>}
        {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}
        {showSeconds && <>:{pad(timeLeft.seconds)}</>}
      </span>
    )
  }

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Mins', value: timeLeft.minutes },
    ...(showSeconds ? [{ label: 'Secs', value: timeLeft.seconds }] : []),
  ]

  return (
    <div
      className={clsx('flex items-end gap-2', className)}
      aria-label={`${timeLeft.days} days ${timeLeft.hours} hours ${timeLeft.minutes} minutes remaining`}
      aria-live="off"
    >
      {units.map(({ label, value }, i) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center">
            <span className="font-mono text-2xl font-bold tabular-nums leading-none text-primary-600 dark:text-primary-400">
              {pad(value)}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-surface-400 dark:text-slate-500 mt-0.5">
              {label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span
              className="text-xl font-bold text-surface-300 dark:text-slate-600 mb-1 select-none"
              aria-hidden="true"
            >
              :
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
