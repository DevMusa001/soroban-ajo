'use client';

/**
 * useCalendarIntegration — Issue #619
 *
 * Hook for adding contribution reminders and payout events to
 * Google Calendar, Outlook, or downloading as .ics files.
 */

import { useCallback, useState } from 'react';

export type CalendarProvider = 'google' | 'outlook' | 'ics';

export interface CalendarEventOptions {
  groupId: string;
  groupName: string;
  amount: string;
  date: Date;
  type: 'contribution' | 'payout';
  cycleNumber?: number;
}

interface UseCalendarIntegrationReturn {
  addToCalendar: (opts: CalendarEventOptions, provider: CalendarProvider) => Promise<void>;
  subscribeToFeed: () => void;
  isLoading: boolean;
  error: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export function useCalendarIntegration(): UseCalendarIntegrationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addToCalendar = useCallback(
    async (opts: CalendarEventOptions, provider: CalendarProvider) => {
      setIsLoading(true);
      setError(null);

      try {
        if (provider === 'ics') {
          // Download .ics file directly
          const res = await fetch(
            `${API_BASE}/api/calendar/groups/${opts.groupId}/event?format=ics`,
            { credentials: 'include' }
          );
          if (!res.ok) throw new Error('Failed to generate calendar event');
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `contribution-${opts.groupId}.ics`;
          a.click();
          URL.revokeObjectURL(url);
          return;
        }

        // Get calendar URLs from backend
        const res = await fetch(`${API_BASE}/api/calendar/events/custom`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            type: opts.type,
            groupId: opts.groupId,
            groupName: opts.groupName,
            amount: opts.amount,
            date: opts.date.toISOString(),
            cycleNumber: opts.cycleNumber,
          }),
        });

        if (!res.ok) throw new Error('Failed to generate calendar links');
        const data = await res.json();

        const url =
          provider === 'google' ? data.googleCalendarUrl : data.outlookCalendarUrl;
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Calendar integration failed');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const subscribeToFeed = useCallback(() => {
    // Opens the iCal feed URL — calendar apps can subscribe to this
    const feedUrl = `${API_BASE}/api/calendar/feed`;
    // Try webcal:// protocol for native calendar app subscription
    const webcalUrl = feedUrl.replace(/^https?:\/\//, 'webcal://');
    window.open(webcalUrl, '_blank', 'noopener,noreferrer');
  }, []);

  return { addToCalendar, subscribeToFeed, isLoading, error };
}
