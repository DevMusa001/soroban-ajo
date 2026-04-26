'use client'

import { Users, TrendingUp, DollarSign, Calendar } from 'lucide-react'
import { Group, GroupStatus } from '@/types'

interface StatsWidgetProps {
  group?: Group
  status?: GroupStatus
  isLoading?: boolean
}

const StatItem = ({
  icon,
  label,
  value,
  gradient,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  gradient: string
}) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
    <div className={`flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs text-white/50 truncate">{label}</p>
      <p className="text-base font-bold text-white leading-tight">{value}</p>
    </div>
  </div>
)

export function StatsWidget({ group, status, isLoading }: StatsWidgetProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2 h-full">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2 h-full content-start">
      <StatItem
        icon={<Users size={16} />}
        label="Members"
        value={`${group?.currentMembers ?? 0} / ${group?.maxMembers ?? 0}`}
        gradient="from-blue-500 to-indigo-600"
      />
      <StatItem
        icon={<DollarSign size={16} />}
        label="Total Saved"
        value={`${(group?.totalContributions ?? 0).toLocaleString()} XLM`}
        gradient="from-emerald-500 to-teal-600"
      />
      <StatItem
        icon={<TrendingUp size={16} />}
        label="Contribution"
        value={`${group?.contributionAmount ?? 0} XLM`}
        gradient="from-violet-500 to-purple-600"
      />
      <StatItem
        icon={<Calendar size={16} />}
        label="Days to Payout"
        value={status?.daysUntilPayout != null ? `${status.daysUntilPayout}d` : '—'}
        gradient="from-orange-500 to-amber-600"
      />
    </div>
  )
}
