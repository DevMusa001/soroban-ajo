'use client';

import React, { useState, useCallback } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  TooltipProps,
  Cell,
  ReferenceLine,
} from 'recharts';
import { Download, ZoomIn, ZoomOut, Filter } from 'lucide-react';
import { GroupPerformance } from '@/hooks/useGroupAnalytics';

const DEMO_DATA: GroupPerformance[] = [
  { id: '1', name: 'Alpha Savers', totalContributed: 4200, totalPayouts: 1400, memberCount: 8, completionRate: 85, isActive: true },
  { id: '2', name: 'Beta Circle', totalContributed: 3100, totalPayouts: 800, memberCount: 6, completionRate: 72, isActive: true },
  { id: '3', name: 'Gamma Fund', totalContributed: 2600, totalPayouts: 2600, memberCount: 5, completionRate: 100, isActive: false },
  { id: '4', name: 'Delta Pool', totalContributed: 1900, totalPayouts: 400, memberCount: 4, completionRate: 60, isActive: true },
  { id: '5', name: 'Epsilon Group', totalContributed: 3500, totalPayouts: 1200, memberCount: 7, completionRate: 91, isActive: true },
];

type SortKey = 'totalContributed' | 'completionRate' | 'memberCount';
type ViewMode = 'contributions' | 'completion' | 'members';

const CustomTooltip: React.FC<TooltipProps<number, string> & { selected: string | null }> = ({
  active, payload, label, selected,
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border p-3 shadow-lg text-sm bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600">
      <p className="font-semibold mb-2 text-gray-900 dark:text-slate-100">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: <span className="font-bold">${Number(entry.value).toLocaleString()}</span>
        </p>
      ))}
      {selected === label && (
        <p className="mt-1 text-xs text-indigo-500 font-medium">Click to deselect</p>
      )}
    </div>
  );
};

interface Props {
  data?: GroupPerformance[];
  onGroupSelect?: (group: GroupPerformance | null) => void;
}

export function InteractiveGroupPerformanceChart({ data, onGroupSelect }: Props) {
  const source = data && data.length > 0 ? data : DEMO_DATA;
  const [sortBy, setSortBy] = useState<SortKey>('totalContributed');
  const [viewMode, setViewMode] = useState<ViewMode>('contributions');
  const [selected, setSelected] = useState<string | null>(null);
  const [activeOnly, setActiveOnly] = useState(false);

  const filtered = activeOnly ? source.filter((g) => g.isActive) : source;
  const sorted = [...filtered].sort((a, b) => b[sortBy] - a[sortBy]);

  const chartData = sorted.map((g) => ({
    ...g,
    name: g.name.length > 12 ? g.name.slice(0, 12) + '…' : g.name,
    Contributed: g.totalContributed,
    Payouts: g.totalPayouts,
    'Completion %': g.completionRate,
    Members: g.memberCount,
  }));

  const handleBarClick = useCallback(
    (entry: any) => {
      const clickedName = entry?.activePayload?.[0]?.payload?.name;
      if (!clickedName) return;
      const fullGroup = source.find((g) =>
        g.name.startsWith(clickedName.replace('…', ''))
      ) ?? null;
      setSelected((prev) => {
        const next = prev === clickedName ? null : clickedName;
        onGroupSelect?.(next ? fullGroup : null);
        return next;
      });
    },
    [source, onGroupSelect]
  );

  const exportCSV = useCallback(() => {
    const headers = ['Name', 'Contributed', 'Payouts', 'Members', 'Completion %', 'Active'];
    const rows = source.map((g) =>
      [g.name, g.totalContributed, g.totalPayouts, g.memberCount, g.completionRate, g.isActive].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'group-performance.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [source]);

  const exportPNG = useCallback(() => {
    const svg = document.querySelector('#group-perf-chart svg') as SVGElement | null;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d')?.drawImage(img, 0, 0);
      const a = document.createElement('a');
      a.download = 'group-performance.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgStr);
  }, []);

  const avgContribution = Math.round(
    source.reduce((s, g) => s + g.totalContributed, 0) / source.length
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">Group Performance</h3>
          <p className="text-xs text-gray-500 dark:text-slate-400">Click a bar to drill down</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* View mode */}
          <div className="flex rounded-lg border border-gray-200 dark:border-slate-600 overflow-hidden text-xs">
            {(['contributions', 'completion', 'members'] as ViewMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-2.5 py-1 capitalize transition-colors ${
                  viewMode === m
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="text-xs border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200"
            aria-label="Sort by"
          >
            <option value="totalContributed">Sort: Contributions</option>
            <option value="completionRate">Sort: Completion</option>
            <option value="memberCount">Sort: Members</option>
          </select>
          {/* Active filter */}
          <button
            onClick={() => setActiveOnly((v) => !v)}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
              activeOnly
                ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400'
                : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300'
            }`}
            aria-pressed={activeOnly}
          >
            <Filter className="w-3 h-3" />
            Active only
          </button>
          {/* Export */}
          <div className="flex gap-1">
            <button
              onClick={exportCSV}
              title="Export CSV"
              className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={exportPNG}
              title="Export PNG"
              className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div id="group-perf-chart">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} onClick={handleBarClick}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-line, #e2e8f0)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: 'var(--chart-tick, #64748b)', fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
            <YAxis tick={{ fill: 'var(--chart-tick, #64748b)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip selected={selected} />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            {viewMode === 'contributions' && (
              <>
                <ReferenceLine y={avgContribution} stroke="#6366f1" strokeDasharray="4 2" label={{ value: 'Avg', fill: '#6366f1', fontSize: 10 }} />
                <Bar dataKey="Contributed" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.id}
                      fill={selected === entry.name ? '#4f46e5' : 'var(--chart-primary, #6366f1)'}
                      opacity={selected && selected !== entry.name ? 0.4 : 1}
                    />
                  ))}
                </Bar>
                <Bar dataKey="Payouts" fill="var(--chart-secondary, #10b981)" radius={[4, 4, 0, 0]} opacity={selected ? 0.6 : 1} />
              </>
            )}
            {viewMode === 'completion' && (
              <Bar dataKey="Completion %" radius={[4, 4, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.id}
                    fill={entry['Completion %'] >= 90 ? '#10b981' : entry['Completion %'] >= 70 ? '#f59e0b' : '#ef4444'}
                    opacity={selected && selected !== entry.name ? 0.4 : 1}
                  />
                ))}
              </Bar>
            )}
            {viewMode === 'members' && (
              <Bar dataKey="Members" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.id}
                    fill="#8b5cf6"
                    opacity={selected && selected !== entry.name ? 0.4 : 1}
                  />
                ))}
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Selected group detail */}
      {selected && (() => {
        const g = source.find((x) => x.name.startsWith(selected.replace('…', '')));
        if (!g) return null;
        return (
          <div className="mt-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 text-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-indigo-700 dark:text-indigo-300">{g.name}</span>
              <button onClick={() => { setSelected(null); onGroupSelect?.(null); }} className="text-xs text-indigo-500 hover:underline">Clear</button>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs text-gray-600 dark:text-slate-300">
              <div><span className="block text-gray-400">Contributed</span><span className="font-bold">${g.totalContributed.toLocaleString()}</span></div>
              <div><span className="block text-gray-400">Payouts</span><span className="font-bold">${g.totalPayouts.toLocaleString()}</span></div>
              <div><span className="block text-gray-400">Members</span><span className="font-bold">{g.memberCount}</span></div>
              <div><span className="block text-gray-400">Completion</span><span className="font-bold">{g.completionRate}%</span></div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
