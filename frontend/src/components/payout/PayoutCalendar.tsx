'use client'

import React, { useMemo, useState } from 'react'
import { clsx } from 'clsx'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PayoutEntry } from '@/hooks/usePayoutSchedule'

interface PayoutCalendarProps {
  entries: PayoutEntry[]
  /** Wallet address of the current user — highlights their payout */
  currentUserAddress?: string
  className?: string
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface CalendarCell {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  payouts: PayoutEntry[]
}

function buildCalendarCells(year: number, month: number, entries: PayoutEntry[]): CalendarCell[][] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Map ISO date → entries for O(1) lookup
  const payoutMap = new Map<string, PayoutEntry[]>()
  for (const entry of entries) {
    const key = entry.scheduledDate.slice(0, 10)
    const existing = payoutMap.get(key) ?? []
    payoutMap.set(key, [...existing, entry])
  }

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Pad start with days from previous month
  const startPad = firstDay.getDay()
  const cells: CalendarCell[] = []

  for (let i = startPad - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    cells.push({ date: d, isCurrentMonth: false, isToday: false, payouts: [] })
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d)
    const key = date.toISOString().slice(0, 10)
    const isToday = date.getTime() === today.getTime()
    cells.push({
      date,
      isCurrentMonth: true,
      isToday,
      payouts: payoutMap.get(key) ?? [],
    })
  }

  // Pad end to complete last row
  const endPad = 7 - (cells.length % 7 || 7)
  for (let i = 1; i <= endPad; i++) {
    const d = new Date(year, month + 1, i)
    cells.push({ date: d, isCurrentMonth: false, isToday: false, payouts: [] })
  }

  // Chunk into weeks
  const weeks: CalendarCell[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }
  return weeks
}

/**
 * Monthly calendar view that marks payout dates with colour-coded indicators.
 * - Purple dot = another member's payout
 * - Green dot = current user's payout
 * - Amber ring = today
 */
export const PayoutCalendar: React.FC<PayoutCalendarProps> = ({
  entries,
  currentUserAddress,
  className,
}) => {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedCell, setSelectedCell] = useState<CalendarCell | null>(null)

  const weeks = useMemo(
    () => buildCalendarCells(viewYear, viewMonth, entries),
    [viewYear, viewMonth, entries]
  )

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
    setSelectedCell(null)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
    setSelectedCell(null)
  }

  return (
    <div className={clsx('bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} className="text-surface-500 dark:text-slate-400" />
        </button>

        <h3 className="text-sm font-semibold text-surface-900 dark:text-slate-100">
          {MONTHS[viewMonth]} {viewYear}
        </h3>

        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight size={18} className="text-surface-500 dark:text-slate-400" />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-surface-400 dark:text-slate-500 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-0.5">
            {week.map((cell, di) => {
              const hasMyPayout = cell.payouts.some(
                (e) => currentUserAddress && e.recipientAddress === currentUserAddress
              )
              const hasOtherPayout = cell.payouts.some(
                (e) => !currentUserAddress || e.recipientAddress !== currentUserAddress
              )
              const isSelected = selectedCell?.date.toDateString() === cell.date.toDateString()

              return (
                <button
                  key={di}
                  onClick={() => cell.payouts.length > 0 ? setSelectedCell(isSelected ? null : cell) : undefined}
                  className={clsx(
                    'relative flex flex-col items-center justify-start pt-1 pb-1.5 rounded-lg min-h-[44px] transition-colors',
                    cell.isCurrentMonth
                      ? 'text-surface-800 dark:text-slate-200'
                      : 'text-surface-300 dark:text-slate-600',
                    cell.isToday && 'ring-2 ring-warning-500 ring-offset-1 dark:ring-offset-slate-800',
                    isSelected && 'bg-primary-50 dark:bg-primary-900/30',
                    cell.payouts.length > 0 && !isSelected && 'hover:bg-surface-50 dark:hover:bg-slate-700/50 cursor-pointer',
                    cell.payouts.length === 0 && 'cursor-default',
                  )}
                  aria-label={`${cell.date.toDateString()}${cell.payouts.length > 0 ? `, ${cell.payouts.length} payout(s)` : ''}`}
                  aria-pressed={isSelected}
                >
                  <span className={clsx(
                    'text-xs font-medium leading-none',
                    cell.isToday && 'font-bold text-warning-600 dark:text-warning-400',
                  )}>
                    {cell.date.getDate()}
                  </span>

                  {/* Payout indicators */}
                  {(hasMyPayout || hasOtherPayout) && (
                    <div className="flex gap-0.5 mt-1">
                      {hasMyPayout && (
                        <span className="w-1.5 h-1.5 rounded-full bg-success-500" aria-hidden="true" />
                      )}
                      {hasOtherPayout && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500" aria-hidden="true" />
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Selected day popover */}
      {selectedCell && selectedCell.payouts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 space-y-2">
          <p className="text-xs font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wide">
            {selectedCell.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          {selectedCell.payouts.map((entry) => {
            const isMe = currentUserAddress && entry.recipientAddress === currentUserAddress
            return (
              <div
                key={entry.cycle}
                className={clsx(
                  'flex items-center justify-between rounded-lg px-3 py-2 text-sm',
                  isMe
                    ? 'bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800'
                    : 'bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={clsx(
                    'text-xs font-bold px-1.5 py-0.5 rounded',
                    isMe ? 'bg-success-100 dark:bg-success-800 text-success-700 dark:text-success-300'
                         : 'bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-300'
                  )}>
                    Cycle {entry.cycle}
                  </span>
                  <span className="font-mono text-xs text-surface-600 dark:text-slate-400">
                    {entry.recipientShort}
                    {isMe && <span className="ml-1 text-success-600 dark:text-success-400 font-semibold">(You)</span>}
                  </span>
                </div>
                <span className="font-semibold text-surface-800 dark:text-slate-200">
                  {entry.payoutAmount.toLocaleString()} XLM
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-success-500" aria-hidden="true" />
          <span className="text-xs text-surface-500 dark:text-slate-400">Your payout</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary-500" aria-hidden="true" />
          <span className="text-xs text-surface-500 dark:text-slate-400">Member payout</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-warning-500" aria-hidden="true" />
          <span className="text-xs text-surface-500 dark:text-slate-400">Today</span>
        </div>
      </div>
    </div>
  )
}
