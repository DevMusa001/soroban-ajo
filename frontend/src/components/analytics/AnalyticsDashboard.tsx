'use client';

/**
 * AnalyticsDashboard — Issue #600
 *
 * Unified analytics dashboard with interactive charts, drill-down,
 * zoom/brush, and CSV/PNG export capabilities.
 */

import React, { useState } from 'react';
import { useGroupAnalytics, GroupPerformance } from '@/hooks/useGroupAnalytics';
import { AnalyticsSummaryCards } from './AnalyticsSummaryCards';
import { InteractiveGroupPerformanceChart } from './InteractiveGroupPerformanceChart';
import { InteractiveContributionTrendChart } from './InteractiveContributionTrendChart';
import { MemberGrowthChart } from './MemberGrowthChart';
import { TopContributorsTable } from './TopContributorsTable';

interface Props {
  groups?: GroupPerformance[];
  isLoading?: boolean;
}

export function AnalyticsDashboard({ groups = [], isLoading }: Props) {
  const { summary, contributionTrends, memberStats, groupPerformance, topContributors } =
    useGroupAnalytics(groups);
  const [selectedGroup, setSelectedGroup] = useState<GroupPerformance | null>(null);

  return (
    <div className="space-y-6">
      <AnalyticsSummaryCards summary={summary} isLoading={isLoading} />

      {selectedGroup && (
        <div className="rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 px-4 py-3 text-sm text-indigo-700 dark:text-indigo-300">
          Showing drill-down for <span className="font-semibold">{selectedGroup.name}</span> —{' '}
          {selectedGroup.memberCount} members · {selectedGroup.completionRate}% completion
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <InteractiveGroupPerformanceChart
          data={groupPerformance}
          onGroupSelect={setSelectedGroup}
        />
        <InteractiveContributionTrendChart data={contributionTrends} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <MemberGrowthChart data={memberStats} />
        <TopContributorsTable data={topContributors} />
      </div>
    </div>
  );
}
