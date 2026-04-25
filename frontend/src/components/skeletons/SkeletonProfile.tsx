/**
 * SkeletonProfile - matches ProfileCard layout
 */
import React from 'react'
import { Skeleton } from './Skeleton'

export const SkeletonProfile: React.FC = () => {
  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8"
      aria-busy="true"
      aria-label="Loading profile"
    >
      {/* Avatar + info row */}
      <div className="flex items-start gap-6">
        <Skeleton className="w-24 h-24 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <Skeleton className="h-8 w-16 mx-auto" />
            <Skeleton className="h-3.5 w-20 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
