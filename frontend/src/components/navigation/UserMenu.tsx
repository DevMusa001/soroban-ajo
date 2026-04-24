import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface UserMenuProps {
  userName: string
  userEmail: string
  avatar?: string
  onLogout?: () => void
  onProfile?: () => void
  onSettings?: () => void
}

export const UserMenu: React.FC<UserMenuProps> = ({
  userName,
  userEmail,
  avatar,
  onLogout,
  onProfile,
  onSettings,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
      >
        {avatar && (
          <img
            src={avatar}
            alt={userName}
            className="w-8 h-8 rounded-full"
          />
        )}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{userName}</p>
          <p className="text-xs text-gray-600 dark:text-slate-400">{userEmail}</p>
        </div>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-50">
          <div className="p-3 border-b border-gray-200 dark:border-slate-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{userName}</p>
            <p className="text-xs text-gray-600 dark:text-slate-400">{userEmail}</p>
          </div>
          <nav className="p-2 space-y-1">
            <button
              onClick={() => {
                onProfile?.()
                setIsOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              Profile
            </button>
            <button
              onClick={() => {
                onSettings?.()
                setIsOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              Settings
            </button>
            <hr className="my-2 border-gray-200 dark:border-slate-700" />
            <button
              onClick={() => {
                onLogout?.()
                setIsOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-sm text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Logout
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}
