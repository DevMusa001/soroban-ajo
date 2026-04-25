import React from 'react'
import { Skeleton } from './Skeleton'

interface SkeletonTransactionsProps {
  rows?: number
}

/** Matches the transactions page layout */
export const SkeletonTransactions: React.FC<SkeletonTransactionsProps> = ({ rows = 8 }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-slate-900 px-4 py-8 md:px-8 space-y-6" aria-busy="true" aria-label="Loading transactions">
    {/* Header */}
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-44" />
      <Skeleton className="h-9 w-28 rounded-xl" />
    </div>

    {/* Filter bar */}
    <Skeleton className="h-16 w-full rounded-xl" />

    {/* Table */}
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
      {/* Header row */}
      <div className="flex gap-4 px-5 py-3 border-b border-gray-100 dark:border-slate-700">
        {[80, 120, 80, 100, 80].map((w, i) => (
          <Skeleton key={i} className="h-3" style={{ width: w }} />
        ))}
      </div>
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 items-center px-5 py-4 border-b border-gray-50 dark:border-slate-700/50 last:border-0"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <Skeleton className="h-4 flex-1 max-w-[140px]" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-24 ml-auto" />
        </div>
      ))}
    </div>

    {/* Pagination */}
    <div className="flex justify-center gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-9 rounded-lg" />
      ))}
    </div>
  </div>
)
