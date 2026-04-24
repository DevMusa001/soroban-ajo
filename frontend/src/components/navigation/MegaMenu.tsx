import React, { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'

interface MenuSection {
  title: string
  items: Array<{
    label: string
    href: string
    icon?: React.ReactNode
    description?: string
  }>
}

interface MegaMenuProps {
  sections: MenuSection[]
  onItemClick?: (href: string) => void
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ sections, onItemClick }) => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSections = sections.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0)

  return (
    <div className="relative group">
      <button className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
        Menu
        <ChevronDown size={16} className="group-hover:rotate-180 transition-transform" />
      </button>

      <div className="absolute left-0 top-full hidden group-hover:block bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6 w-screen max-w-4xl z-50 border border-gray-200 dark:border-slate-700">
        <div className="mb-4 flex items-center gap-2 bg-gray-100 dark:bg-slate-700 rounded-lg px-3 py-2">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none flex-1 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {filteredSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      onClick={() => onItemClick?.(item.href)}
                      className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors group/item"
                    >
                      {item.icon && <span className="mt-1 flex-shrink-0">{item.icon}</span>}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400">
                          {item.label}
                        </p>
                        {item.description && (
                          <p className="text-xs text-gray-600 dark:text-slate-400">{item.description}</p>
                        )}
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
