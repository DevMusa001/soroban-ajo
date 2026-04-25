import React from 'react'
import { Skeleton } from './Skeleton'

/** Matches the member profile page layout */
export const SkeletonMemberProfile: React.FC = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-slate-900 px-4 py-8 md:px-8 space-y-6" aria-busy="true" aria-label="Loading member profile">
    {/* Back button */}
    <Skeleton className="h-8 w-24 rounded-lg" />

    {/* Profile header card */}
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 space-y-4">
      <div className="flex items-start gap-5">
        <Skeleton className="h-20 w-20 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>

      {/* Trust bar */}
      <div className="space-y-1 pt-2">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-slate-700">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <Skeleton className="h-7 w-16 mx-auto rounded" />
            <Skeleton className="h-3 w-20 mx-auto" />
          </div>
        ))}
      </div>
    </div>

    {/* Contribution history */}
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 space-y-4">
      <Skeleton className="h-5 w-40" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  </div>
)
