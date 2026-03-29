'use client'

import React, { useState } from 'react'
import { clsx } from 'clsx'
import { CalendarDays, List, Trophy, Clock, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePayoutSchedule } from '@/hooks/usePayoutSchedule'
import { PayoutCalendar } from './PayoutCalendar'
import { CountdownTimer } from './CountdownTimer'
import type { PayoutEntry } from '@/hooks/usePayoutSchedule'

// ── Props ─────────────────────────────────────────────────────────────────────

interface PayoutScheduleProps {
  groupId: string
  /** Contribution amount per member per cycle (XLM) */
  contributionAmount: number
  /** Cycle length in days (e.g. 30 for monthly) */
  cycleFrequencyDays?: number
  /** ISO date of the first payout */
  firstPayoutDate?: string
  /** Current user's wallet address — highlights their row */
  currentUserAddress?: string
  className?: string
}

// ── Sub-components ────────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <div className="flex items-center gap-3 py-3 px-4 animate-pulse">
    <div className="w-8 h-8 rounded-full bg-surface-200 dark:bg-slate-700 flex-shrink-0" />
    <div className="flex-1 space-y-1.5">
      <div className="h-3 w-32 rounded bg-surface-200 dark:bg-slate-700" />
      <div className="h-2.5 w-20 rounded bg-surface-100 dark:bg-slate-700/60" />
    </div>
    <div className="h-3 w-16 rounded bg-surface-200 dark:bg-slate-700" />
  </div>
)

interface EntryRowProps {
  entry: PayoutEntry
  isMe: boolean
}

const EntryRow: React.FC<EntryRowProps> = ({ entry, isMe }) => {
  const formattedDate = new Date(entry.scheduledDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        'flex items-center gap-3 py-3 px-4 rounded-xl transition-colors',
        entry.isCurrent && 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800',
        entry.isPast && 'opacity-50',
        isMe && !entry.isPast && 'bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800',
        !entry.isCurrent && !isMe && !entry.isPast && 'hover:bg-surface-50 dark:hover:bg-slate-700/40',
      )}
      aria-current={entry.isCurrent ? 'true' : undefined}
    >
      {/* Cycle badge */}
      <div
        className={clsx(
          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
          entry.isPast
            ? 'bg-surface-200 dark:bg-slate-700 text-surface-400 dark:text-slate-500'
            : entry.isCurrent
            ? 'bg-primary-600 text-white'
            : isMe
            ? 'bg-success-500 text-white'
            : 'bg-surface-100 dark:bg-slate-700 text-surface-600 dark:text-slate-300',
        )}
        aria-label={`Cycle ${entry.cycle}`}
      >
        {entry.isPast ? '✓' : entry.cycle}
      </div>

      {/* Recipient info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-mono text-surface-700 dark:text-slate-300 truncate">
            {entry.recipientShort}
          </span>
          {isMe && (
            <span className="text-xs font-semibold text-success-600 dark:text-success-400 bg-success-100 dark:bg-success-900/40 px-1.5 py-0.5 rounded-full">
              You
            </span>
          )}
          {entry.isCurrent && (
            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/40 px-1.5 py-0.5 rounded-full">
              Active
            </span>
          )}
          {entry.isNext && (
            <span className="text-xs font-semibold text-warning-600 dark:text-warning-400 bg-warning-100 dark:bg-warning-900/40 px-1.5 py-0.5 rounded-full">
              Next
            </span>
          )}
        </div>
        <p className="text-xs text-surface-400 dark:text-slate-500 mt-0.5">{formattedDate}</p>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold text-surface-800 dark:text-slate-200">
          {entry.payoutAmount.toLocaleString()} XLM
        </p>
        {!entry.isPast && entry.msUntilPayout > 0 && (
          <CountdownTimer
            targetDate={entry.scheduledDate}
            compact
            showSeconds={false}
            className="text-xs text-surface-400 dark:text-slate-500"
          />
        )}
      </div>
    </motion.div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

type ViewMode = 'list' | 'calendar'

export const PayoutSchedule: React.FC<PayoutScheduleProps> = ({
  groupId,
  contributionAmount,
  cycleFrequencyDays = 30,
  firstPayoutDate,
  currentUserAddress,
  className,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  const { schedule, isLoading, error } = usePayoutSchedule(groupId, {
    contributionAmount,
    cycleFrequencyDays,
    firstPayoutDate,
  })

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={clsx('bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700', className)}>
        <div className="p-5 border-b border-gray-100 dark:border-slate-700">
          <div className="h-5 w-40 rounded bg-surface-200 dark:bg-slate-700 animate-pulse" />
        </div>
        <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
          {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !schedule) {
    return (
      <div className={clsx('bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-8 text-center', className)}>
        <p className="text-sm text-error-500 dark:text-error-400">
          {error ? 'Failed to load payout schedule.' : 'No schedule data available yet.'}
        </p>
      </div>
    )
  }

  const myEntry = currentUserAddress
    ? schedule.entries.find((e) => e.recipientAddress === currentUserAddress)
    : null

  return (
    <div className={clsx('bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
        <div>
          <h2 className="text-base font-semibold text-surface-900 dark:text-slate-100">
            Payout Schedule
          </h2>
          <p className="text-xs text-surface-400 dark:text-slate-500 mt-0.5">
            {schedule.totalCycles} cycles · {cycleFrequencyDays}-day rotation
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-surface-100 dark:bg-slate-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={clsx(
              'p-1.5 rounded-md transition-colors',
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600 dark:text-primary-400'
                : 'text-surface-400 dark:text-slate-500 hover:text-surface-600 dark:hover:text-slate-300'
            )}
            aria-label="List view"
            aria-pressed={viewMode === 'list'}
          >
            <List size={15} />
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={clsx(
              'p-1.5 rounded-md transition-colors',
              viewMode === 'calendar'
                ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600 dark:text-primary-400'
                : 'text-surface-400 dark:text-slate-500 hover:text-surface-600 dark:hover:text-slate-300'
            )}
            aria-label="Calendar view"
            aria-pressed={viewMode === 'calendar'}
          >
            <CalendarDays size={15} />
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-slate-700 border-b border-gray-100 dark:border-slate-700">
        <div className="flex flex-col items-center py-3 gap-0.5">
          <div className="flex items-center gap-1 text-surface-400 dark:text-slate-500">
            <Trophy size={12} />
            <span className="text-[11px] uppercase tracking-wide">Cycle</span>
          </div>
          <span className="text-sm font-bold text-surface-800 dark:text-slate-200">
            {schedule.currentCycle} / {schedule.totalCycles}
          </span>
        </div>
        <div className="flex flex-col items-center py-3 gap-0.5">
          <div className="flex items-center gap-1 text-surface-400 dark:text-slate-500">
            <TrendingUp size={12} />
            <span className="text-[11px] uppercase tracking-wide">Distributed</span>
          </div>
          <span className="text-sm font-bold text-success-600 dark:text-success-400">
            {schedule.totalDistributed.toLocaleString()} XLM
          </span>
        </div>
        <div className="flex flex-col items-center py-3 gap-0.5">
          <div className="flex items-center gap-1 text-surface-400 dark:text-slate-500">
            <Clock size={12} />
            <span className="text-[11px] uppercase tracking-wide">Remaining</span>
          </div>
          <span className="text-sm font-bold text-surface-800 dark:text-slate-200">
            {schedule.totalRemaining.toLocaleString()} XLM
          </span>
        </div>
      </div>

      {/* Next payout countdown — only when there's an upcoming one */}
      {schedule.nextPayoutEntry && schedule.nextPayoutEntry.msUntilPayout > 0 && (
        <div className="px-5 py-4 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border-b border-primary-100 dark:border-primary-800/40">
          <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide mb-2">
            {schedule.nextPayoutEntry.isCurrent ? 'Current payout in' : 'Next payout in'}
          </p>
          <CountdownTimer
            targetDate={schedule.nextPayoutEntry.scheduledDate}
            showSeconds
          />
          <p className="text-xs text-surface-500 dark:text-slate-400 mt-2">
            Recipient:{' '}
            <span className="font-mono font-medium">
              {schedule.nextPayoutEntry.recipientShort}
              {currentUserAddress &&
                schedule.nextPayoutEntry.recipientAddress === currentUserAddress && (
                  <span className="ml-1 text-success-600 dark:text-success-400 font-semibold">(You)</span>
                )}
            </span>
            {' · '}
            <span className="font-semibold text-surface-700 dark:text-slate-300">
              {schedule.nextPayoutEntry.payoutAmount.toLocaleString()} XLM
            </span>
          </p>
        </div>
      )}

      {/* Your payout callout */}
      {myEntry && !myEntry.isPast && (
        <div className="px-5 py-3 bg-success-50 dark:bg-success-900/10 border-b border-success-100 dark:border-success-800/30 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-success-700 dark:text-success-400">Your payout — Cycle {myEntry.cycle}</p>
            <p className="text-xs text-success-600 dark:text-success-500 mt-0.5">
              {new Date(myEntry.scheduledDate).toLocaleDateString(undefined, {
                weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-success-700 dark:text-success-400">
              {myEntry.payoutAmount.toLocaleString()} XLM
            </p>
            {myEntry.msUntilPayout > 0 && (
              <CountdownTimer
                targetDate={myEntry.scheduledDate}
                compact
                showSeconds={false}
                className="text-xs text-success-600 dark:text-success-500"
              />
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="divide-y divide-gray-50 dark:divide-slate-700/50 px-1 py-1"
            role="list"
            aria-label="Payout schedule list"
          >
            {schedule.entries.map((entry) => (
              <EntryRow
                key={entry.cycle}
                entry={entry}
                isMe={!!currentUserAddress && entry.recipientAddress === currentUserAddress}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="calendar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="p-1"
          >
            <PayoutCalendar
              entries={schedule.entries}
              currentUserAddress={currentUserAddress}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
