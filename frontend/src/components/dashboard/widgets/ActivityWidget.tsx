'use client'

import { ArrowDownLeft, ArrowUpRight, UserPlus } from 'lucide-react'
import { Transaction } from '@/types'

interface ActivityWidgetProps {
  transactions?: Transaction[]
  isLoading?: boolean
}

const TYPE_CONFIG = {
  contribution: { icon: <ArrowDownLeft size={14} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  payout:       { icon: <ArrowUpRight size={14} />,  color: 'text-blue-400',    bg: 'bg-blue-500/10' },
  refund:       { icon: <UserPlus size={14} />,       color: 'text-amber-400',   bg: 'bg-amber-500/10' },
} as const

function shortAddr(addr: string) {
  return addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr
}

export function ActivityWidget({ transactions = [], isLoading }: ActivityWidgetProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse" />
        ))}
      </div>
    )
  }

  const recent = transactions.slice(0, 8)

  if (recent.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-white/40 text-sm">
        No activity yet
      </div>
    )
  }

  return (
    <ul className="space-y-1.5 overflow-auto h-full pr-1">
      {recent.map((tx) => {
        const cfg = TYPE_CONFIG[tx.type] ?? TYPE_CONFIG.contribution
        return (
          <li key={tx.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <span className={`flex-shrink-0 w-7 h-7 rounded-lg ${cfg.bg} ${cfg.color} flex items-center justify-center`}>
              {cfg.icon}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/80 truncate">
                <span className="font-medium capitalize">{tx.type}</span>
                {' · '}
                <span className="text-white/50">{shortAddr(tx.member)}</span>
              </p>
              <p className="text-[10px] text-white/40">
                {new Date(tx.timestamp ?? tx.date ?? '').toLocaleDateString()}
              </p>
            </div>
            <span className={`text-xs font-semibold flex-shrink-0 ${cfg.color}`}>
              {tx.amount} XLM
            </span>
          </li>
        )
      })}
    </ul>
  )
}
