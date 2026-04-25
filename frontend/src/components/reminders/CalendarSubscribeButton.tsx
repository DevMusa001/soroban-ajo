'use client';

/**
 * CalendarSubscribeButton — Issue #619
 *
 * Button to subscribe to the user's personal Ajo iCal feed,
 * which auto-syncs all upcoming contribution and payout events.
 */

import React from 'react';
import { CalendarDays } from 'lucide-react';
import { useCalendarIntegration } from '@/hooks/useCalendarIntegration';

interface Props {
  className?: string;
}

export function CalendarSubscribeButton({ className }: Props) {
  const { subscribeToFeed } = useCalendarIntegration();

  return (
    <button
      onClick={subscribeToFeed}
      className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors ${className ?? ''}`}
    >
      <CalendarDays className="w-4 h-4" />
      Subscribe to Calendar
    </button>
  );
}
