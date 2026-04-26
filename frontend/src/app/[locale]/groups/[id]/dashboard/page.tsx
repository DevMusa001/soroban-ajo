'use client'

import { useParams } from 'next/navigation'
import { GroupDashboard } from '@/components/dashboard/GroupDashboard'

export default function GroupDashboardPage() {
  const params = useParams()
  const groupId = params?.id as string
  const locale = params?.locale as string | undefined

  if (!groupId) return null

  return <GroupDashboard groupId={groupId} locale={locale ?? 'en'} />
}
