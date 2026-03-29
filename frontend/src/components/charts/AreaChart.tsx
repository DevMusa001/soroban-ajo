'use client'

import React from 'react'
import {
  ResponsiveContainer,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  TooltipProps,
} from 'recharts'

export interface AreaChartDataPoint {
  [key: string]: string | number
}

export interface AreaChartSeries {
  dataKey: string
  name?: string
  color?: string
  strokeWidth?: number
  fillOpacity?: number
  stackId?: string
}

export interface AreaChartProps {
  data: AreaChartDataPoint[]
  series: AreaChartSeries[]
  xAxisKey?: string
  title?: string
  height?: number
  showLegend?: boolean
  stacked?: boolean
  yAxisFormatter?: (value: number) => string
  className?: string
}

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-background p-3 shadow-lg text-sm">
      <p className="font-semibold mb-1 text-foreground">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: <span className="font-bold">{entry.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  )
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  series,
  xAxisKey = 'date',
  title,
  height = 300,
  showLegend = true,
  stacked = false,
  yAxisFormatter = (v) => String(v),
  className,
}) => {
  const defaultColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className={className}>
      {title && <h3 className="text-base font-semibold mb-3 text-foreground">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <defs>
            {series.map((s, i) => {
              const color = s.color ?? defaultColors[i % defaultColors.length]
              return (
                <linearGradient key={s.dataKey} id={`gradient-${s.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.05} />
                </linearGradient>
              )
            })}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-line, #e2e8f0)" vertical={false} />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={yAxisFormatter}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {series.map((s, i) => {
            const color = s.color ?? defaultColors[i % defaultColors.length]
            return (
              <Area
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name ?? s.dataKey}
                stroke={color}
                strokeWidth={s.strokeWidth ?? 2}
                fill={`url(#gradient-${s.dataKey})`}
                fillOpacity={s.fillOpacity ?? 1}
                stackId={stacked ? (s.stackId ?? 'stack') : undefined}
              />
            )
          })}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}
