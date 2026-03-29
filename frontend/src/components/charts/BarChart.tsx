'use client'

import React from 'react'
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  TooltipProps,
} from 'recharts'

export interface BarChartDataPoint {
  [key: string]: string | number
}

export interface BarChartSeries {
  dataKey: string
  name?: string
  color?: string
  radius?: number
}

export interface BarChartProps {
  data: BarChartDataPoint[]
  series: BarChartSeries[]
  xAxisKey?: string
  title?: string
  height?: number
  showLegend?: boolean
  layout?: 'vertical' | 'horizontal'
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

export const BarChart: React.FC<BarChartProps> = ({
  data,
  series,
  xAxisKey = 'name',
  title,
  height = 300,
  showLegend = true,
  layout = 'horizontal',
  yAxisFormatter = (v) => String(v),
  className,
}) => {
  const defaultColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className={className}>
      {title && <h3 className="text-base font-semibold mb-3 text-foreground">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-line, #e2e8f0)" vertical={layout === 'vertical'} horizontal={layout === 'horizontal'} />
          <XAxis
            dataKey={layout === 'horizontal' ? xAxisKey : undefined}
            type={layout === 'horizontal' ? 'category' : 'number'}
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={layout === 'vertical' ? yAxisFormatter : undefined}
          />
          <YAxis
            dataKey={layout === 'vertical' ? xAxisKey : undefined}
            type={layout === 'vertical' ? 'category' : 'number'}
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={layout === 'horizontal' ? yAxisFormatter : undefined}
            width={layout === 'vertical' ? 80 : undefined}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {series.map((s, i) => (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name ?? s.dataKey}
              fill={s.color ?? defaultColors[i % defaultColors.length]}
              radius={s.radius ?? [4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}
