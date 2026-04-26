'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Transaction } from '@/types'
import { useMemo } from 'react'

interface ChartWidgetProps {
  transactions?: Transaction[]
  isLoading?: boolean
}

function buildChartData(transactions: Transaction[]) {
  const byDate: Record<string, number> = {}
  transactions
    .filter((t) => t.type === 'contribution' && t.status === 'confirmed')
    .forEach((t) => {
      const day = (t.timestamp ?? t.date ?? '').slice(0, 10)
      if (day) byDate[day] = (byDate[day] ?? 0) + t.amount
    })

  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([date, amount]) => ({ date: date.slice(5), amount }))
}

export function ChartWidget({ transactions = [], isLoading }: ChartWidgetProps) {
  const data = useMemo(() => buildChartData(transactions), [transactions])

  if (isLoading) {
    return <div className="h-full rounded-xl bg-white/5 animate-pulse" />
  }

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-white/40 text-sm">
        No contribution data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="contributionGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
          itemStyle={{ color: '#a5b4fc' }}
        />
        <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} fill="url(#contributionGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
