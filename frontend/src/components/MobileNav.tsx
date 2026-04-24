'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { WalletConnector } from './WalletConnector'

interface NavItem {
  href: string
  label: string
  icon: string
  dataTour?: string
  badge?: number
}

interface MobileNavProps {
  navItems: NavItem[]
}

export const MobileNav: React.FC<MobileNavProps> = ({ navItems }) => {
  const [isOpen, setIsOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href

  const closeMenu = () => {
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  // Trap focus inside drawer
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return
    const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <div className="lg:hidden">
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-xl text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 outline-none"
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-surface-900/50 backdrop-blur-sm animate-fade-in"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Slide-up drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={[
          'fixed bottom-0 left-0 right-0 z-50',
          'rounded-t-3xl border-t border-white/40 dark:border-white/10',
          'bg-white/90 dark:bg-surface-900/90',
          'supports-[backdrop-filter]:backdrop-blur-xl supports-[backdrop-filter]:saturate-150',
          'shadow-2xl shadow-surface-900/20 dark:shadow-black/60',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-y-0' : 'translate-y-full',
          'pb-safe',
        ].join(' ')}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
          <div className="w-10 h-1 rounded-full bg-surface-300 dark:bg-surface-600" />
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-surface-100/60 dark:border-white/10">
          <span className="font-bold text-surface-900 dark:text-surface-50 text-lg">🪙 Ajo</span>
          <button
            onClick={closeMenu}
            className="p-2 rounded-xl text-surface-500 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Close navigation"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav className="px-4 py-3 space-y-1" aria-label="Mobile navigation">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                data-tour={item.dataTour}
                onClick={closeMenu}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium',
                  'transition-all duration-200 outline-none',
                  'focus-visible:ring-2 focus-visible:ring-primary-500',
                  active
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-glow-sm'
                    : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800',
                ].join(' ')}
              >
                <svg
                  className={[
                    'w-5 h-5 flex-shrink-0 transition-transform duration-200',
                    active ? 'text-white' : 'text-surface-500 dark:text-surface-400',
                  ].join(' ')}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={item.icon}
                  />
                </svg>
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-semibold flex items-center justify-center bg-primary-500 text-white animate-pulse-slow">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Wallet section */}
        <div className="px-5 py-4 border-t border-surface-100/60 dark:border-white/10">
          <div data-tour="wallet-connect">
            <WalletConnector />
          </div>
        </div>
      </div>
    </div>
  )
}
