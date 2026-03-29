'use client'

import React from 'react'
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  TooltipProps,
} from 'recharts'

export interface PieChartDataPoint {
  name: string
  value: number
  color?: string
}

export interface PieChartProps {
  data: PieChartDataPoint[]
  title?: string
  height?: number
  innerRadius?: number
  outerRadius?: number
  showLegend?: boolean
  showLabels?: boolean
  valueFormatter?: (value: number) => string
  className?: string
}

const DEFAULT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316']

const CustomTooltip: React.FC<TooltipProps<number, string> & { valueFormatter?: (v: number) => string }> = ({
  active,
  payload,
  valueFormatter,
}) => {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="rounded-lg border border-border bg-background p-3 shadow-lg text-sm">
      <p className="font-semibold text-foreground">{entry.name}</p>
      <p style={{ color: entry.payload?.fill }}>
        {valueFormatter ? valueFormatter(entry.value as number) : (entry.value as number).toLocaleString()}
      </p>
    </div>
  )
}

const renderCustomLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: {
  cx: number; cy: number; midAngle: number
  innerRadius: number; outerRadius: number; percent: number
}) => {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  height = 300,
  innerRadius = 0,
  outerRadius = 100,
  showLegend = true,
  showLabels = false,
  valueFormatter,
  className,
}) => {
  return (
    <div className={className}>
      {title && <h3 className="text-base font-semibold mb-3 text-foreground">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            dataKey="value"
            labelLine={false}
            label={showLabels ? renderCustomLabel : undefined}
          >
            {data.map((entry, i) => (
              <Cell
                key={`cell-${i}`}
                fill={entry.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip valueFormatter={valueFormatter} />} />
          {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}
