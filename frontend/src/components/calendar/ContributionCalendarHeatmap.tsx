'use client'

import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Download, ZoomIn, ZoomOut, RotateCcw, Flame, TrendingUp, Calendar } from 'lucide-react'
import { buildCalendarGrid, getIntensityLevel, getMonthLabels } from '@/utils/calendarHelpers'
import type { ContributionDay } from '@/utils/calendarHelpers'

// ── Types ──────────────────────────────────────────────────────────────────

interface StreakInfo {
  current: number
  longest: number
}

interface TooltipState {
  day: ContributionDay
  x: number
  y: number
}

interface ContributionCalendarHeatmapProps {
  contributions: ContributionDay[]
  weeks?: number
  title?: string
  streak?: StreakInfo
  onExport?: () => void
}

// ── Intensity colours ──────────────────────────────────────────────────────

const INTENSITY_BG: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'bg-gray-100 dark:bg-slate-700',
  1: 'bg-emerald-200 dark:bg-emerald-900',
  2: 'bg-emerald-400 dark:bg-emerald-700',
  3: 'bg-emerald-500 dark:bg-emerald-500',
  4: 'bg-emerald-700 dark:bg-emerald-400',
}

const INTENSITY_HEX: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: '#e5e7eb',
  1: '#6ee7b7',
  2: '#34d399',
  3: '#10b981',
  4: '#047857',
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ── Streak calculation ─────────────────────────────────────────────────────

function calcStreaks(contributions: ContributionDay[]): StreakInfo {
  const sorted = [...contributions].sort((a, b) => a.date.localeCompare(b.date))
  let current = 0
  let longest = 0
  let running = 0
  const today = new Date().toISOString().slice(0, 10)

  for (let i = sorted.length - 1; i >= 0; i--) {
    const c = sorted[i]
    if (c.date > today) continue
    if (c.count > 0) {
      running++
      if (i === sorted.length - 1 || sorted[i + 1].date === c.date) {
        current = running
      }
    } else {
      if (current === 0) current = running
      running = 0
    }
    longest = Math.max(longest, running)
  }
  if (current === 0) current = running
  longest = Math.max(longest, current)
  return { current, longest }
}

// ── Export helper ──────────────────────────────────────────────────────────

function exportHeatmapAsImage(
  grid: ReturnType<typeof buildCalendarGrid>,
  max: number,
  title: string,
) {
  const CELL = 14
  const GAP = 2
  const COLS = grid.length
  const ROWS = 7
  const MARGIN_LEFT = 28
  const MARGIN_TOP = 40
  const MARGIN_BOTTOM = 30

  const width = MARGIN_LEFT + COLS * (CELL + GAP) + 20
  const height = MARGIN_TOP + ROWS * (CELL + GAP) + MARGIN_BOTTOM

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#111827'
  ctx.font = 'bold 13px sans-serif'
  ctx.fillText(title, MARGIN_LEFT, 22)

  // Day labels
  ctx.font = '10px sans-serif'
  ctx.fillStyle = '#9ca3af'
  DAY_LABELS.forEach((label, i) => {
    if (i % 2 !== 0) {
      ctx.fillText(label[0], 4, MARGIN_TOP + i * (CELL + GAP) + CELL - 2)
    }
  })

  // Cells
  grid.forEach((week, wi) => {
    week.days.forEach((day, di) => {
      const x = MARGIN_LEFT + wi * (CELL + GAP)
      const y = MARGIN_TOP + di * (CELL + GAP)
      const level = day ? getIntensityLevel(day.count, max) : (0 as const)
      ctx.fillStyle = INTENSITY_HEX[level]
      ctx.beginPath()
      ctx.roundRect(x, y, CELL, CELL, 2)
      ctx.fill()
    })
  })

  // Legend
  const legendY = height - 16
  ctx.fillStyle = '#9ca3af'
  ctx.font = '10px sans-serif'
  ctx.fillText('Less', MARGIN_LEFT, legendY)
  ;([0, 1, 2, 3, 4] as const).forEach((level, i) => {
    ctx.fillStyle = INTENSITY_HEX[level]
    ctx.beginPath()
    ctx.roundRect(MARGIN_LEFT + 32 + i * (CELL + 2), legendY - CELL + 2, CELL, CELL, 2)
    ctx.fill()
  })
  ctx.fillStyle = '#9ca3af'
  ctx.fillText('More', MARGIN_LEFT + 32 + 5 * (CELL + 2) + 4, legendY)

  const link = document.createElement('a')
  link.download = `contribution-heatmap-${new Date().toISOString().slice(0, 10)}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

// ── Tooltip ────────────────────────────────────────────────────────────────

function Tooltip({ state }: { state: TooltipState }) {
  const { day, x, y } = state
  return (
    <div
      className="pointer-events-none fixed z-50 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-slate-600 dark:bg-slate-800"
      style={{ left: x + 12, top: y - 10 }}
    >
      <p className="text-xs font-semibold text-gray-800 dark:text-slate-100">{day.date}</p>
      <p className="text-xs text-gray-500 dark:text-slate-400">
        {day.count} contribution{day.count !== 1 ? 's' : ''}
      </p>
      {day.amount > 0 && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400">
          ${day.amount.toFixed(2)}
        </p>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export const ContributionCalendarHeatmap: React.FC<ContributionCalendarHeatmapProps> = ({
  contributions,
  weeks = 52,
  title = 'Contribution Activity',
  streak: streakProp,
  onExport,
}) => {
  const [zoom, setZoom] = useState(1)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const grid = useMemo(() => buildCalendarGrid(contributions, weeks), [contributions, weeks])
  const monthLabels = useMemo(() => getMonthLabels(grid), [grid])
  const max = useMemo(() => Math.max(0, ...contributions.map((c) => c.count)), [contributions])
  const total = useMemo(() => contributions.reduce((s, c) => s + c.count, 0), [contributions])
  const streak = useMemo(() => streakProp ?? calcStreaks(contributions), [streakProp, contributions])

  const cellSize = Math.round(12 * zoom)
  const gap = Math.round(2 * zoom)

  const handleMouseEnter = useCallback((day: ContributionDay, e: React.MouseEvent) => {
    setTooltip({ day, x: e.clientX, y: e.clientY })
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltip((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)
  }, [])

  const handleMouseLeave = useCallback(() => setTooltip(null), [])

  const handleExport = useCallback(() => {
    if (onExport) {
      onExport()
    } else {
      exportHeatmapAsImage(grid, max, title)
    }
  }, [grid, max, title, onExport])

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {total} contribution{total !== 1 ? 's' : ''} in the last {weeks === 52 ? 'year' : `${weeks} weeks`}
          </p>
        </div>

        {/* Streak badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-1.5 dark:bg-orange-900/20">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">
              {streak.current} day streak
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 dark:bg-blue-900/20">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
              Best: {streak.longest}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-3 flex items-center gap-2">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.25, 2))}
          className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition-colors hover:bg-gray-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
          aria-label="Zoom in"
          title="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
          className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition-colors hover:bg-gray-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
          aria-label="Zoom out"
          title="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition-colors hover:bg-gray-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
          aria-label="Reset zoom"
          title="Reset zoom"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <span className="text-xs text-gray-400 dark:text-slate-500">{Math.round(zoom * 100)}%</span>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Export heatmap as PNG"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Heatmap grid */}
      <div ref={scrollRef} className="overflow-x-auto overflow-y-hidden pb-2">
        <div className="inline-block min-w-max select-none">
          {/* Month labels */}
          <div className="mb-1 flex" style={{ marginLeft: cellSize + gap + 4 }}>
            {monthLabels.map(({ label, weekIndex }, idx) => {
              const prevIdx = monthLabels[idx - 1]?.weekIndex ?? 0
              const marginLeft = idx === 0 ? 0 : (weekIndex - prevIdx) * (cellSize + gap)
              return (
                <div
                  key={`${label}-${weekIndex}`}
                  className="text-xs text-gray-400 dark:text-slate-500"
                  style={{ marginLeft, minWidth: 0 }}
                >
                  {label}
                </div>
              )
            })}
          </div>

          <div className="flex" style={{ gap }}>
            {/* Day-of-week labels */}
            <div className="flex flex-col" style={{ gap, marginRight: 4 }}>
              {DAY_LABELS.map((d, i) => (
                <div
                  key={d}
                  className={`flex items-center justify-end text-xs text-gray-400 dark:text-slate-500 ${i % 2 === 0 ? 'invisible' : ''}`}
                  style={{ height: cellSize, width: cellSize }}
                >
                  {d[0]}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {grid.map((week, wi) => (
              <div key={wi} className="flex flex-col" style={{ gap }}>
                {week.days.map((day, di) => {
                  if (!day) {
                    return <div key={di} style={{ width: cellSize, height: cellSize }} />
                  }
                  const level = getIntensityLevel(day.count, max)
                  return (
                    <div
                      key={di}
                      role="gridcell"
                      aria-label={`${day.date}: ${day.count} contributions`}
                      className={`cursor-default rounded-sm transition-transform hover:scale-125 ${INTENSITY_BG[level]}`}
                      style={{ width: cellSize, height: cellSize }}
                      onMouseEnter={(e) => handleMouseEnter(day, e)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-2">
        <span className="text-xs text-gray-400 dark:text-slate-500">Less</span>
        {([0, 1, 2, 3, 4] as const).map((level) => (
          <div
            key={level}
            className={`rounded-sm ${INTENSITY_BG[level]}`}
            style={{ width: 12, height: 12 }}
          />
        ))}
        <span className="text-xs text-gray-400 dark:text-slate-500">More</span>
      </div>

      {/* Tooltip */}
      {tooltip && <Tooltip state={tooltip} />}
    </div>
  )
}

export default ContributionCalendarHeatmap
