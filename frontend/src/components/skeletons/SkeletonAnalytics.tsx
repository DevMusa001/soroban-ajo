import React from 'react'
import { Skeleton } from './Skeleton'

/** Matches the analytics page layout */
export const SkeletonAnalytics: React.FC = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-slate-900 px-4 py-8 md:px-8 space-y-8" aria-busy="true" aria-label="Loading analytics">
    {/* Header */}
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-20 rounded-xl" />
        <Skeleton className="h-9 w-20 rounded-xl" />
      </div>
    </div>

    {/* Date range bar */}
    <Skeleton className="h-14 w-full rounded-2xl" />

    {/* KPI cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-2xl" />
      ))}
    </div>

    {/* Heatmap */}
    <Skeleton className="h-48 w-full rounded-xl" />

    {/* Charts row */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-64 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>

    {/* Bar chart */}
    <Skeleton className="h-64 w-full rounded-2xl" />

    {/* Table */}
    <Skeleton className="h-48 w-full rounded-2xl" />
  </div>
)
