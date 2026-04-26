'use client'

import { useState, useEffect, useCallback } from 'react'
import { Responsive, WidthProvider, Layout } from 'react-grid-layout'
import { motion, AnimatePresence } from 'framer-motion'
import { GripVertical, X, Plus, RotateCcw, LayoutDashboard } from 'lucide-react'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import { useGroupDashboardStore, WIDGET_CATALOG, DashboardWidget } from '@/store/groupDashboardStore'
import { StatsWidget } from '@/components/dashboard/widgets/StatsWidget'
import { ChartWidget } from '@/components/dashboard/widgets/ChartWidget'
import { ActivityWidget } from '@/components/dashboard/widgets/ActivityWidget'
import { QuickActionsWidget } from '@/components/dashboard/widgets/QuickActionsWidget'
import { useGroupDetail, useGroupStatus, useTransactions } from '@/hooks/useContractData'
import { Transaction } from '@/types'

const ResponsiveGridLayout = WidthProvider(Responsive)

// ── Widget content dispatcher ─────────────────────────────────────────────────

interface WidgetContentProps {
  widget: DashboardWidget
  groupId: string
  locale: string
  group?: any
  status?: any
  transactions: Transaction[]
  isLoading: boolean
}

function WidgetContent({ widget, groupId, locale, group, status, transactions, isLoading }: WidgetContentProps) {
  switch (widget.type) {
    case 'stats':
      return <StatsWidget group={group} status={status} isLoading={isLoading} />
    case 'chart':
      return <ChartWidget transactions={transactions} isLoading={isLoading} />
    case 'activity':
      return <ActivityWidget transactions={transactions} isLoading={isLoading} />
    case 'quick-actions':
      return <QuickActionsWidget groupId={groupId} locale={locale} />
    default:
      return null
  }
}

// ── Widget card ───────────────────────────────────────────────────────────────

interface WidgetCardProps extends WidgetContentProps {
  onRemove: (id: string) => void
}

function WidgetCard({ widget, onRemove, ...rest }: WidgetCardProps) {
  return (
    <div className="h-full flex flex-col rounded-2xl overflow-hidden backdrop-blur-md bg-white/5 border border-white/10 shadow-xl">
      <div className="widget-drag-handle flex items-center justify-between px-4 py-2.5 border-b border-white/10 cursor-grab active:cursor-grabbing select-none">
        <div className="flex items-center gap-2">
          <GripVertical size={14} className="text-white/30" />
          <span className="text-sm font-semibold text-white/80">{widget.title}</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onRemove(widget.id)}
          className="p-1 rounded-md hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
          aria-label={`Remove ${widget.title}`}
        >
          <X size={14} />
        </motion.button>
      </div>
      <div className="flex-1 p-3 overflow-hidden">
        <WidgetContent widget={widget} {...rest} />
      </div>
    </div>
  )
}

// ── Widget marketplace ────────────────────────────────────────────────────────

interface MarketplaceProps {
  activeWidgetIds: string[]
  onAdd: (widget: DashboardWidget) => void
  onClose: () => void
}

function WidgetMarketplace({ activeWidgetIds, onAdd, onClose }: MarketplaceProps) {
  const available = WIDGET_CATALOG.filter((w) => !activeWidgetIds.includes(w.id))

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute right-0 top-12 z-50 w-64 rounded-2xl backdrop-blur-xl bg-slate-900/90 border border-white/10 shadow-2xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Add Widget</h3>
        <button onClick={onClose} className="text-white/40 hover:text-white/80">
          <X size={14} />
        </button>
      </div>
      {available.length === 0 ? (
        <p className="text-xs text-white/40 text-center py-4">All widgets are active</p>
      ) : (
        <ul className="space-y-1.5">
          {available.map((w) => (
            <motion.li key={w.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <button
                onClick={() => { onAdd({ ...w, visible: true }); onClose() }}
                className="w-full text-left px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <p className="text-sm font-medium text-white">{w.title}</p>
                <p className="text-xs text-white/40 capitalize">{w.type}</p>
              </button>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface GroupDashboardProps {
  groupId: string
  locale?: string
}

export function GroupDashboard({ groupId, locale = 'en' }: GroupDashboardProps) {
  const [mounted, setMounted] = useState(false)
  const [showMarketplace, setShowMarketplace] = useState(false)

  const { getWidgets, updateLayout, addWidget, removeWidget, resetLayout } = useGroupDashboardStore()
  const widgets = getWidgets(groupId)

  // Real-time data via existing React Query hooks (auto-refetch intervals built in)
  const { data: group, isLoading: groupLoading } = useGroupDetail(groupId)
  const { data: status, isLoading: statusLoading } = useGroupStatus(groupId)
  const { data: txData, isLoading: txLoading } = useTransactions(groupId, undefined, 20)

  const transactions: Transaction[] = (txData?.transactions ?? []) as Transaction[]
  const isLoading = groupLoading || statusLoading

  useEffect(() => { setMounted(true) }, [])

  const handleLayoutChange = useCallback(
    (layout: Layout[]) => updateLayout(groupId, layout),
    [groupId, updateLayout]
  )
  const handleRemove = useCallback((id: string) => removeWidget(groupId, id), [groupId, removeWidget])
  const handleAdd = useCallback((widget: DashboardWidget) => addWidget(groupId, widget), [groupId, addWidget])
  const handleReset = useCallback(() => resetLayout(groupId), [groupId, resetLayout])

  if (!mounted) return null

  const gridLayout: Layout[] = widgets.map((w) => ({
    i: w.id,
    x: w.position.x,
    y: w.position.y,
    w: w.position.w,
    h: w.position.h,
    minW: 3,
    minH: 2,
  }))

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <LayoutDashboard size={18} className="text-indigo-400" />
          <h2 className="text-lg font-bold text-white">
            {group?.name ?? 'Group Dashboard'}
          </h2>
          {group?.status && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              group.status === 'active'    ? 'bg-emerald-500/20 text-emerald-300' :
              group.status === 'paused'   ? 'bg-amber-500/20 text-amber-300' :
                                            'bg-gray-500/20 text-gray-300'
            }`}>
              {group.status}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-medium transition-colors border border-white/10"
            title="Reset layout"
          >
            <RotateCcw size={13} />
            Reset
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMarketplace((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
          >
            <Plus size={13} />
            Add Widget
          </motion.button>

          <AnimatePresence>
            {showMarketplace && (
              <WidgetMarketplace
                activeWidgetIds={widgets.map((w) => w.id)}
                onAdd={handleAdd}
                onClose={() => setShowMarketplace(false)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Grid */}
      {widgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-white/40 gap-3">
          <LayoutDashboard size={40} className="opacity-30" />
          <p className="text-sm">No widgets. Click &quot;Add Widget&quot; to get started.</p>
        </div>
      ) : (
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: gridLayout, md: gridLayout, sm: gridLayout }}
          onLayoutChange={handleLayoutChange}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={70}
          isDraggable
          isResizable
          draggableHandle=".widget-drag-handle"
          compactType="vertical"
          useCSSTransforms
        >
          {widgets.map((widget) => (
            <div key={widget.id}>
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.88 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <WidgetCard
                  widget={widget}
                  groupId={groupId}
                  locale={locale}
                  group={group}
                  status={status}
                  transactions={transactions}
                  isLoading={isLoading}
                  onRemove={handleRemove}
                />
              </motion.div>
            </div>
          ))}
        </ResponsiveGridLayout>
      )}
    </div>
  )
}
