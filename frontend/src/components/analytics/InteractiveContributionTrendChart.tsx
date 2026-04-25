'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  TooltipProps,
  Brush,
  ReferenceLine,
} from 'recharts';
import { Download, BarChart2, TrendingUp, Activity } from 'lucide-react';
import { ContributionTrend } from '@/hooks/useGroupAnalytics';

type ChartType = 'area' | 'line' | 'bar';

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const net = (payload.find((p) => p.dataKey === 'net')?.value as number) ?? 0;
  return (
    <div className="rounded-lg border p-3 shadow-lg text-sm bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600">
      <p className="font-semibold mb-2 text-gray-900 dark:text-slate-100">{label}</p>
      {payload.filter((p) => p.dataKey !== 'net').map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: <span className="font-bold">${Number(entry.value).toLocaleString()}</span>
        </p>
      ))}
      <p className={`mt-1 text-xs font-semibold ${net >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
        Net: ${net.toLocaleString()}
      </p>
    </div>
  );
};

interface Props {
  data: ContributionTrend[];
}

export function InteractiveContributionTrendChart({ data }: Props) {
  const [chartType, setChartType] = useState<ChartType>('area');
  const [showNet, setShowNet] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const exportCSV = useCallback(() => {
    const headers = ['Month', 'Contributions', 'Payouts', 'Net'];
    const rows = data.map((d) => [d.month, d.contributions, d.payouts, d.net].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contribution-trends.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const chartIcons: Record<ChartType, React.ReactNode> = {
    area: <Activity className="w-3.5 h-3.5" />,
    line: <TrendingUp className="w-3.5 h-3.5" />,
    bar: <BarChart2 className="w-3.5 h-3.5" />,
  };

  const commonProps = {
    data,
    margin: { top: 4, right: 4, left: -16, bottom: 0 },
  };

  const renderChart = () => {
    if (chartType === 'bar') {
      return (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-line, #e2e8f0)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: 'var(--chart-tick, #64748b)', fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
          <YAxis tick={{ fill: 'var(--chart-tick, #64748b)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Brush dataKey="month" height={20} stroke="var(--chart-grid-line, #e2e8f0)" travellerWidth={6} />
          <Bar dataKey="contributions" name="Contributions" fill="var(--chart-primary, #6366f1)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="payouts" name="Payouts" fill="var(--chart-secondary, #10b981)" radius={[4, 4, 0, 0]} />
          {showNet && <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />}
        </BarChart>
      );
    }

    if (chartType === 'line') {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-line, #e2e8f0)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: 'var(--chart-tick, #64748b)', fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
          <YAxis tick={{ fill: 'var(--chart-tick, #64748b)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Brush dataKey="month" height={20} stroke="var(--chart-grid-line, #e2e8f0)" travellerWidth={6} />
          <Line type="monotone" dataKey="contributions" name="Contributions" stroke="var(--chart-primary, #6366f1)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="payouts" name="Payouts" stroke="var(--chart-secondary, #10b981)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          {showNet && <Line type="monotone" dataKey="net" name="Net" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />}
        </LineChart>
      );
    }

    // area (default)
    return (
      <AreaChart {...commonProps}>
        <defs>
          <linearGradient id="gradContrib" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-primary, #6366f1)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--chart-primary, #6366f1)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradPayouts" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-secondary, #10b981)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--chart-secondary, #10b981)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-line, #e2e8f0)" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: 'var(--chart-tick, #64748b)', fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
        <YAxis tick={{ fill: 'var(--chart-tick, #64748b)', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Brush dataKey="month" height={20} stroke="var(--chart-grid-line, #e2e8f0)" travellerWidth={6} />
        <Area type="monotone" dataKey="contributions" name="Contributions" stroke="var(--chart-primary, #6366f1)" fill="url(#gradContrib)" strokeWidth={2} />
        <Area type="monotone" dataKey="payouts" name="Payouts" stroke="var(--chart-secondary, #10b981)" fill="url(#gradPayouts)" strokeWidth={2} />
        {showNet && <Area type="monotone" dataKey="net" name="Net" stroke="#f59e0b" fill="none" strokeWidth={1.5} strokeDasharray="4 2" />}
      </AreaChart>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">Contribution Trends</h3>
          <p className="text-xs text-gray-500 dark:text-slate-400">Drag the brush to zoom into a time range</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart type switcher */}
          <div className="flex rounded-lg border border-gray-200 dark:border-slate-600 overflow-hidden">
            {(['area', 'line', 'bar'] as ChartType[]).map((t) => (
              <button
                key={t}
                onClick={() => setChartType(t)}
                title={t}
                className={`p-1.5 transition-colors ${
                  chartType === t
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
                aria-label={`${t} chart`}
              >
                {chartIcons[t]}
              </button>
            ))}
          </div>
          {/* Net toggle */}
          <button
            onClick={() => setShowNet((v) => !v)}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
              showNet
                ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400'
                : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300'
            }`}
            aria-pressed={showNet}
          >
            Show Net
          </button>
          <button
            onClick={exportCSV}
            title="Export CSV"
            className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div ref={chartRef}>
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
