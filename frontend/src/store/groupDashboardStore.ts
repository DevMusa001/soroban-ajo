import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Layout } from 'react-grid-layout'

export type WidgetType = 'stats' | 'chart' | 'activity' | 'quick-actions'

export interface DashboardWidget {
  id: string
  type: WidgetType
  title: string
  position: { x: number; y: number; w: number; h: number }
  visible: boolean
}

export const WIDGET_CATALOG: Omit<DashboardWidget, 'visible'>[] = [
  { id: 'stats-1',         type: 'stats',         title: 'Group Stats',         position: { x: 0, y: 0, w: 4, h: 3 } },
  { id: 'chart-1',         type: 'chart',         title: 'Contribution Trend',  position: { x: 4, y: 0, w: 8, h: 4 } },
  { id: 'activity-1',      type: 'activity',      title: 'Recent Activity',     position: { x: 0, y: 3, w: 6, h: 4 } },
  { id: 'quick-actions-1', type: 'quick-actions', title: 'Quick Actions',       position: { x: 6, y: 3, w: 6, h: 4 } },
]

const DEFAULT_WIDGETS: DashboardWidget[] = WIDGET_CATALOG.map((w) => ({ ...w, visible: true }))

interface GroupDashboardState {
  // keyed by groupId
  layouts: Record<string, DashboardWidget[]>
}

interface GroupDashboardActions {
  getWidgets: (groupId: string) => DashboardWidget[]
  updateLayout: (groupId: string, layout: Layout[]) => void
  addWidget: (groupId: string, widget: DashboardWidget) => void
  removeWidget: (groupId: string, widgetId: string) => void
  resetLayout: (groupId: string) => void
}

export const useGroupDashboardStore = create<GroupDashboardState & GroupDashboardActions>()(
  persist(
    (set, get) => ({
      layouts: {},

      getWidgets: (groupId) => get().layouts[groupId] ?? DEFAULT_WIDGETS,

      updateLayout: (groupId, layout) => {
        set((state) => {
          const widgets = state.layouts[groupId] ?? DEFAULT_WIDGETS
          const updated = widgets.map((w) => {
            const item = layout.find((l) => l.i === w.id)
            return item ? { ...w, position: { x: item.x, y: item.y, w: item.w, h: item.h } } : w
          })
          return { layouts: { ...state.layouts, [groupId]: updated } }
        })
      },

      addWidget: (groupId, widget) => {
        set((state) => {
          const widgets = state.layouts[groupId] ?? DEFAULT_WIDGETS
          if (widgets.find((w) => w.id === widget.id)) return state
          return { layouts: { ...state.layouts, [groupId]: [...widgets, widget] } }
        })
      },

      removeWidget: (groupId, widgetId) => {
        set((state) => {
          const widgets = (state.layouts[groupId] ?? DEFAULT_WIDGETS).filter((w) => w.id !== widgetId)
          return { layouts: { ...state.layouts, [groupId]: widgets } }
        })
      },

      resetLayout: (groupId) => {
        set((state) => ({ layouts: { ...state.layouts, [groupId]: DEFAULT_WIDGETS } }))
      },
    }),
    { name: 'ajo-group-dashboards' }
  )
)
