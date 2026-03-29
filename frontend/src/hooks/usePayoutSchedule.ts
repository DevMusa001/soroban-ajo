'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useGroupMembers, useGroupStatus } from './useContractData'
import { analytics } from '../services/analytics'
import type { Member } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PayoutEntry {
  /** 0-based cycle index */
  cycle: number
  /** Recipient wallet address */
  recipientAddress: string
  /** Truncated address for display */
  recipientShort: string
  /** ISO date string for the scheduled payout */
  scheduledDate: string
  /** Whether this cycle has already been paid out */
  isPast: boolean
  /** Whether this is the current active cycle */
  isCurrent: boolean
  /** Whether this is the next upcoming payout */
  isNext: boolean
  /** XLM amount to be paid out */
  payoutAmount: number
  /** ms until payout (negative if past) */
  msUntilPayout: number
}

export interface PayoutScheduleData {
  entries: PayoutEntry[]
  currentCycle: number
  totalCycles: number
  nextPayoutEntry: PayoutEntry | null
  /** Total XLM distributed so far */
  totalDistributed: number
  /** Total XLM remaining to be distributed */
  totalRemaining: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function shortAddress(addr: string): string {
  if (!addr || addr.length < 12) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

/**
 * Derives the full payout schedule from group members, status, and group config.
 * Members are ordered by join date (FIFO rotation — standard Ajo/Tontine rule).
 */
function buildPayoutSchedule(
  members: Member[],
  currentCycle: number,
  contributionAmount: number,
  cycleFrequencyDays: number,
  firstPayoutDate: Date
): PayoutScheduleData {
  const now = Date.now()

  // Sort by join date ascending — first joined, first paid
  const sorted = [...members].sort(
    (a, b) => new Date(a.joinedDate).getTime() - new Date(b.joinedDate).getTime()
  )

  const totalCycles = sorted.length
  const payoutAmount = contributionAmount * sorted.length

  const entries: PayoutEntry[] = sorted.map((member, idx) => {
    const cycleOffset = idx * cycleFrequencyDays * 24 * 60 * 60 * 1000
    const scheduledDate = new Date(firstPayoutDate.getTime() + cycleOffset)
    const msUntilPayout = scheduledDate.getTime() - now

    return {
      cycle: idx + 1,
      recipientAddress: member.address,
      recipientShort: shortAddress(member.address),
      scheduledDate: scheduledDate.toISOString(),
      isPast: idx + 1 < currentCycle,
      isCurrent: idx + 1 === currentCycle,
      isNext: idx + 1 === currentCycle + 1,
      payoutAmount,
      msUntilPayout,
    }
  })

  const nextPayoutEntry = entries.find((e) => e.isCurrent || e.isNext) ?? null
  const totalDistributed = entries.filter((e) => e.isPast).length * payoutAmount
  const totalRemaining = entries.filter((e) => !e.isPast).length * payoutAmount

  return {
    entries,
    currentCycle,
    totalCycles,
    nextPayoutEntry,
    totalDistributed,
    totalRemaining,
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Derives the full visual payout schedule for a group.
 * Combines member list + group status + group config to produce
 * a per-cycle breakdown with dates, amounts, and countdown data.
 */
export function usePayoutSchedule(
  groupId: string,
  options: {
    contributionAmount?: number
    cycleFrequencyDays?: number
    firstPayoutDate?: string
  } = {}
) {
  const {
    contributionAmount = 0,
    cycleFrequencyDays = 30,
    firstPayoutDate,
  } = options

  const {
    data: members = [],
    isLoading: membersLoading,
    error: membersError,
  } = useGroupMembers(groupId)

  const {
    data: status,
    isLoading: statusLoading,
    error: statusError,
  } = useGroupStatus(groupId)

  const queryKey = useMemo(
    () => [
      'payoutSchedule',
      groupId,
      members.length,
      status?.currentCycle,
      contributionAmount,
      cycleFrequencyDays,
      firstPayoutDate,
    ],
    [groupId, members.length, status?.currentCycle, contributionAmount, cycleFrequencyDays, firstPayoutDate]
  )

  const { data: schedule } = useQuery({
    queryKey,
    queryFn: () => {
      return analytics.measureAsync('compute_payout_schedule', async () => {
        const currentCycle = status?.currentCycle ?? 1
        const baseDate = firstPayoutDate
          ? new Date(firstPayoutDate)
          : new Date(Date.now() + cycleFrequencyDays * 24 * 60 * 60 * 1000)

        return buildPayoutSchedule(
          members as Member[],
          currentCycle,
          contributionAmount,
          cycleFrequencyDays,
          baseDate
        )
      })
    },
    enabled: !membersLoading && !statusLoading && members.length > 0,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  return {
    schedule: schedule ?? null,
    isLoading: membersLoading || statusLoading,
    error: membersError || statusError,
  }
}
