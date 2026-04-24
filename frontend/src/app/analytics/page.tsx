'use client';

import { useState, useMemo, useCallback } from 'react';
import { Download, FileText, Calendar } from 'lucide-react';
import { useGroupAnalytics } from '@/hooks/useGroupAnalytics';
import { SkeletonChart } from '@/components/skeletons';
import { lazyLoad } from '@/utils/lazyLoad';

const AnalyticsSummaryCards = lazyLoad(
  () => import('@/components/analytics').then((m) => ({ default: m.AnalyticsSummaryCards })),
  { loading: () => <SkeletonChart /> }
);
const ContributionTrendChart = lazyLoad(
  () => import('@/components/analytics').then((m) => ({ default: m.ContributionTrendChart })),
  { loading: () => <SkeletonChart /> }
);
const GroupPerformanceChart = lazyLoad(
  () => import('@/components/analytics').then((m) => ({ default: m.GroupPerformanceChart })),
  { loading: () => <SkeletonChart /> }
);
const MemberGrowthChart = lazyLoad(
  () => import('@/components/analytics').then((m) => ({ default: m.MemberGrowthChart })),
  { loading: () => <SkeletonChart /> }
);
const TopContributorsTable = lazyLoad(
  () => import('@/components/analytics').then((m) => ({ default: m.TopContributorsTable })),
  { loading: () => <SkeletonChart /> }
);

// ─── Date range presets ───────────────────────────────────────────────────────

type Preset = '7d' | '30d' | '90d' | '6m' | '1y' | 'custom';

const PRESETS: { label: string; value: Preset }[] = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
  { label: '6 months', value: '6m' },
  { label: '1 year', value: '1y' },
  { label: 'Custom', value: 'custom' },
];

function presetToDates(preset: Preset): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  switch (preset) {
    case '7d': from.setDate(from.getDate() - 7); break;
    case '30d': from.setDate(from.getDate() - 30); break;
    case '90d': from.setDate(from.getDate() - 90); break;
    case '6m': from.setMonth(from.getMonth() - 6); break;
    case '1y': from.setFullYear(from.getFullYear() - 1); break;
    default: from.setMonth(from.getMonth() - 6);
  }
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

// ─── Export helpers ───────────────────────────────────────────────────────────

function exportAnalyticsCSV(data: {
  summary: Record<string, unknown>;
  trends: Record<string, unknown>[];
  contributors: Record<string, unknown>[];
}, dateFrom: string, dateTo: string) {
  const lines: string[] = [
    `Ajo Analytics Report — ${dateFrom} to ${dateTo}`,
    '',
    '## Summary',
    Object.entries(data.summary).map(([k, v]) => `${k},${v}`).join('\n'),
    '',
    '## Contribution Trends',
    'Month,Contributions,Payouts,Net',
    ...data.trends.map((t: any) => `${t.month},${t.contributions},${t.payouts},${t.net}`),
    '',
    '## Top Contributors',
    'Address,Total Contributed,Groups,On-Time Rate',
    ...data.contributors.map((c: any) => `${c.address},${c.totalContributed},${c.groupCount},${c.onTimeRate}%`),
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ajo-analytics-${dateFrom}-${dateTo}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function exportAnalyticsPDF(data: {
  summary: Record<string, unknown>;
  trends: Record<string, unknown>[];
  contributors: Record<string, unknown>[];
}, dateFrom: string, dateTo: string) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait' });
  doc.setFontSize(16);
  doc.text('Ajo Analytics Report', 14, 18);
  doc.setFontSize(10);
  doc.text(`Period: ${dateFrom} to ${dateTo}`, 14, 26);

  // Summary table
  doc.setFontSize(12);
  doc.text('Summary', 14, 38);
  autoTable(doc, {
    startY: 42,
    head: [['Metric', 'Value']],
    body: Object.entries(data.summary).map(([k, v]) => [k, String(v)]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [99, 102, 241] },
  });

  // Trends table
  const afterSummary = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text('Contribution Trends', 14, afterSummary);
  autoTable(doc, {
    startY: afterSummary + 4,
    head: [['Month', 'Contributions', 'Payouts', 'Net']],
    body: data.trends.map((t: any) => [t.month, t.contributions, t.payouts, t.net]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [16, 185, 129] },
  });

  // Contributors table
  const afterTrends = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text('Top Contributors', 14, afterTrends);
  autoTable(doc, {
    startY: afterTrends + 4,
    head: [['Address', 'Total Contributed', 'Groups', 'On-Time Rate']],
    body: data.contributors.map((c: any) => [c.address, `$${c.totalContributed}`, c.groupCount, `${c.onTimeRate}%`]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [245, 158, 11] },
  });

  doc.save(`ajo-analytics-${dateFrom}-${dateTo}.pdf`);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsDashboard() {
  const [preset, setPreset] = useState<Preset>('6m');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);

  const { from: dateFrom, to: dateTo } = useMemo(() => {
    if (preset === 'custom' && customFrom && customTo) {
      return { from: customFrom, to: customTo };
    }
    return presetToDates(preset);
  }, [preset, customFrom, customTo]);

  // TODO: replace with real groups from useGroups() / API
  const { summary, contributionTrends, memberStats, groupPerformance, topContributors } =
    useGroupAnalytics([]);

  const handlePresetChange = (p: Preset) => {
    setPreset(p);
    setShowCustom(p === 'custom');
  };

  const handleExportCSV = useCallback(() => {
    setExporting('csv');
    try {
      exportAnalyticsCSV(
        {
          summary: summary as unknown as Record<string, unknown>,
          trends: contributionTrends as unknown as Record<string, unknown>[],
          contributors: topContributors as unknown as Record<string, unknown>[],
        },
        dateFrom,
        dateTo
      );
    } finally {
      setExporting(null);
    }
  }, [summary, contributionTrends, topContributors, dateFrom, dateTo]);

  const handleExportPDF = useCallback(async () => {
    setExporting('pdf');
    try {
      await exportAnalyticsPDF(
        {
          summary: summary as unknown as Record<string, unknown>,
          trends: contributionTrends as unknown as Record<string, unknown>[],
          contributors: topContributors as unknown as Record<string, unknown>[],
        },
        dateFrom,
        dateTo
      );
    } finally {
      setExporting(null);
    }
  }, [summary, contributionTrends, topContributors, dateFrom, dateTo]);

  const inputCls = 'px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900 px-4 py-8 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Analytics</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Group performance, contribution trends, and member statistics
            </p>
          </div>

          {/* Export buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleExportCSV}
              disabled={exporting !== null}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              {exporting === 'csv' ? 'Exporting…' : 'CSV'}
            </button>
            <button
              onClick={handleExportPDF}
              disabled={exporting !== null}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4" />
              {exporting === 'pdf' ? 'Exporting…' : 'PDF'}
            </button>
          </div>
        </div>

        {/* Date range selector */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-400 dark:text-slate-500 flex-shrink-0" />
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => handlePresetChange(p.value)}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    preset === p.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {showCustom && (
              <div className="flex items-center gap-2 ml-2">
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className={inputCls}
                  aria-label="From date"
                />
                <span className="text-gray-400 dark:text-slate-500 text-sm">to</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className={inputCls}
                  aria-label="To date"
                />
              </div>
            )}

            <span className="ml-auto text-xs text-gray-400 dark:text-slate-500">
              {dateFrom} → {dateTo}
            </span>
          </div>
        </div>

        {/* Summary KPI cards */}
        <AnalyticsSummaryCards summary={summary} />

        {/* Contribution trends + Member growth */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ContributionTrendChart data={contributionTrends} />
          <MemberGrowthChart data={memberStats} />
        </div>

        {/* Group performance bar chart */}
        <GroupPerformanceChart data={groupPerformance} />

        {/* Top contributors table */}
        <TopContributorsTable data={topContributors} />

      </div>
    </main>
  );
}
