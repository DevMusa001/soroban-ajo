import { SkeletonProfile } from '@/components/skeletons'

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 px-4 py-8 md:px-8">
      <div className="max-w-3xl mx-auto">
        <SkeletonProfile />
      </div>
    </div>
  )
}
