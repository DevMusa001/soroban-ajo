'use client'

import { motion } from 'framer-motion'
import { PlusCircle, Eye, UserPlus, Settings } from 'lucide-react'
import Link from 'next/link'

interface QuickActionsWidgetProps {
  groupId: string
  locale?: string
}

const ACTIONS = [
  { label: 'Contribute',    icon: <PlusCircle size={18} />, href: (id: string, locale: string) => `/${locale}/groups/${id}#contribute`, gradient: 'from-indigo-500 to-purple-600' },
  { label: 'View Details',  icon: <Eye size={18} />,        href: (id: string, locale: string) => `/${locale}/groups/${id}`,             gradient: 'from-blue-500 to-cyan-600' },
  { label: 'Invite Member', icon: <UserPlus size={18} />,   href: (id: string, locale: string) => `/${locale}/groups/${id}#invite`,      gradient: 'from-emerald-500 to-teal-600' },
  { label: 'Settings',      icon: <Settings size={18} />,   href: (id: string, locale: string) => `/${locale}/groups/${id}/settings`,    gradient: 'from-orange-500 to-amber-600' },
]

export function QuickActionsWidget({ groupId, locale = 'en' }: QuickActionsWidgetProps) {
  return (
    <div className="grid grid-cols-2 gap-2 h-full content-start">
      {ACTIONS.map((action) => (
        <motion.div key={action.label} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link
            href={action.href(groupId, locale)}
            className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-gradient-to-br ${action.gradient} text-white text-xs font-semibold h-full min-h-[64px] hover:opacity-90 transition-opacity`}
          >
            {action.icon}
            {action.label}
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
