'use client'

import React from 'react'
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  TooltipProps,
} from 'recharts'

export interface LineChartDataPoint {
  [key: string]: string | number
}

export interface LineChartSeries {
  dataKey: string
  name?: string
  color?: string
  strokeWidth?: number
  dot?: boolean
}

export interface LineChartProps {
  data: LineChartDataPoint[]
  series: LineChartSeries[]
  xAxisKey?: string
  title?: string
  height?: number
  showLegend?: boolean
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

export const LineChart: React.FC<LineChartProps> = ({
  data,
  series,
  xAxisKey = 'date',
  title,
  height = 300,
  showLegend = true,
  yAxisFormatter = (v) => String(v),
  className,
}) => {
  const defaultColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className={className}>
      {title && <h3 className="text-base font-semibold mb-3 text-foreground">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
          {series.map((s, i) => (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name ?? s.dataKey}
              stroke={s.color ?? defaultColors[i % defaultColors.length]}
              strokeWidth={s.strokeWidth ?? 2}
              dot={s.dot ?? false}
              activeDot={{ r: 4 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}
