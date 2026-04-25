import React from 'react'
import { Skeleton } from './Skeleton'

/** Matches the leaderboard page layout */
export const SkeletonLeaderboard: React.FC = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-slate-900 px-4 py-8 md:px-8 space-y-6" aria-busy="true" aria-label="Loading leaderboard">
    <Skeleton className="h-8 w-40" />

    {/* Top 3 podium */}
    <div className="flex items-end justify-center gap-4 py-4">
      <Skeleton className="h-28 w-24 rounded-2xl" />
      <Skeleton className="h-36 w-24 rounded-2xl" />
      <Skeleton className="h-24 w-24 rounded-2xl" />
    </div>

    {/* Rank list */}
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 dark:border-slate-700/50 last:border-0"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  </div>
)
