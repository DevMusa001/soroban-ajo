'use client';

/**
 * AddToCalendarButton — Issue #619
 *
 * Dropdown button for adding a contribution reminder or payout event
 * to Google Calendar, Outlook, or downloading as .ics.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Download, ExternalLink } from 'lucide-react';
import {
  useCalendarIntegration,
  type CalendarEventOptions,
  type CalendarProvider,
} from '@/hooks/useCalendarIntegration';

interface Props extends CalendarEventOptions {
  label?: string;
  className?: string;
}

const PROVIDERS: { id: CalendarProvider; label: string; icon: React.ReactNode }[] = [
  {
    id: 'google',
    label: 'Google Calendar',
    icon: <ExternalLink className="w-3.5 h-3.5" />,
  },
  {
    id: 'outlook',
    label: 'Outlook',
    icon: <ExternalLink className="w-3.5 h-3.5" />,
  },
  {
    id: 'ics',
    label: 'Download .ics',
    icon: <Download className="w-3.5 h-3.5" />,
  },
];

export function AddToCalendarButton({ label = 'Add to Calendar', className, ...eventOpts }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { addToCalendar, isLoading, error } = useCalendarIntegration();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = async (provider: CalendarProvider) => {
    setOpen(false);
    await addToCalendar(eventOpts, provider);
  };

  return (
    <div ref={ref} className={`relative inline-block ${className ?? ''}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isLoading}
        className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Calendar className="w-4 h-4 text-indigo-500" />
        {isLoading ? 'Adding…' : label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-50 mt-1 w-48 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg overflow-hidden"
        >
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              role="option"
              onClick={() => handleSelect(p.id)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              {p.icon}
              {p.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="absolute top-full mt-1 text-xs text-red-500 whitespace-nowrap">{error}</p>
      )}
    </div>
  );
}
