import React, { useState } from 'react'
import { Menu, X, Search, LogOut } from 'lucide-react'

interface DrawerItem {
  label: string
  href: string
  icon?: React.ReactNode
  badge?: string
}

interface MobileDrawerProps {
  items: DrawerItem[]
  onItemClick?: (href: string) => void
  userMenu?: {
    name: string
    email: string
    avatar?: string
    onLogout?: () => void
  }
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ items, onItemClick, userMenu }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = items.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 shadow-lg z-50 transform transition-transform duration-300 md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="font-bold text-lg">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 rounded-lg px-3 py-2">
            <Search size={16} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none flex-1 text-sm"
            />
          </div>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {filteredItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => {
                onItemClick?.(item.href)
                setIsOpen(false)
              }}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors group"
            >
              <div className="flex items-center gap-3">
                {item.icon && <span className="text-gray-600 dark:text-slate-400 group-hover:text-blue-600">{item.icon}</span>}
                <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </nav>

        {userMenu && (
          <div className="p-4 border-t border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              {userMenu.avatar && (
                <img
                  src={userMenu.avatar}
                  alt={userMenu.name}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">{userMenu.name}</p>
                <p className="text-xs text-gray-600 dark:text-slate-400 truncate">{userMenu.email}</p>
              </div>
            </div>
            <button
              onClick={() => {
                userMenu.onLogout?.()
                setIsOpen(false)
              }}
              className="w-full flex items-center justify-center gap-2 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  )
}
