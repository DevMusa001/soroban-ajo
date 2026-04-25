/**
 * Calendar Integration Service — Issue #619
 *
 * Generates iCalendar (.ics) events for contribution reminders and payout
 * notifications. Supports Google Calendar (via URL) and Outlook (via .ics download).
 *
 * No OAuth required for the core flow — we generate standard iCal files that
 * users can import into any calendar app. Google Calendar "Add to Calendar"
 * links are also generated for one-click adding.
 */

import { createModuleLogger } from '../utils/logger'
import { prisma } from '../config/database'

const logger = createModuleLogger('CalendarService')

// ── iCal helpers ──────────────────────────────────────────────────────────

function formatICalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

function escapeICalText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

function generateUID(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}@ajo-app`
}

export interface CalendarEvent {
  uid: string
  summary: string
  description: string
  dtstart: Date
  dtend: Date
  location?: string
  url?: string
  alarmMinutes?: number
}

/**
 * Generates a single VEVENT block for an iCal file.
 */
function buildVEvent(event: CalendarEvent): string {
  const lines = [
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    `DTSTAMP:${formatICalDate(new Date())}`,
    `DTSTART:${formatICalDate(event.dtstart)}`,
    `DTEND:${formatICalDate(event.dtend)}`,
    `SUMMARY:${escapeICalText(event.summary)}`,
    `DESCRIPTION:${escapeICalText(event.description)}`,
  ]

  if (event.location) lines.push(`LOCATION:${escapeICalText(event.location)}`)
  if (event.url) lines.push(`URL:${event.url}`)

  if (event.alarmMinutes !== undefined) {
    lines.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeICalText(event.summary)}`,
      `TRIGGER:-PT${event.alarmMinutes}M`,
      'END:VALARM'
    )
  }

  lines.push('END:VEVENT')
  return lines.join('\r\n')
}

/**
 * Wraps VEVENT blocks in a VCALENDAR envelope.
 */
export function buildICalendar(events: CalendarEvent[], calName = 'Ajo Reminders'): string {
  const vevents = events.map(buildVEvent).join('\r\n')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ajo App//EN',
    `X-WR-CALNAME:${calName}`,
    'X-WR-TIMEZONE:UTC',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    vevents,
    'END:VCALENDAR',
  ].join('\r\n')
}

// ── Google Calendar URL builder ───────────────────────────────────────────

/**
 * Builds a Google Calendar "Add to Calendar" URL for a single event.
 */
export function buildGoogleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.summary,
    dates: `${formatICalDate(event.dtstart)}/${formatICalDate(event.dtend)}`,
    details: event.description,
    ...(event.location ? { location: event.location } : {}),
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Builds an Outlook Web "Add to Calendar" URL for a single event.
 */
export function buildOutlookCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.summary,
    startdt: event.dtstart.toISOString(),
    enddt: event.dtend.toISOString(),
    body: event.description,
    ...(event.location ? { location: event.location } : {}),
  })
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}

// ── Domain-specific event builders ───────────────────────────────────────

export interface ContributionReminderEventOptions {
  groupId: string
  groupName: string
  contributionAmount: string
  dueDate: Date
  cycleNumber: number
  appUrl?: string
}

/**
 * Builds a CalendarEvent for a contribution reminder.
 */
export function buildContributionReminderEvent(
  opts: ContributionReminderEventOptions
): CalendarEvent {
  const dtend = new Date(opts.dueDate.getTime() + 60 * 60 * 1000) // 1 hour window
  return {
    uid: `contribution-${opts.groupId}-cycle${opts.cycleNumber}-${generateUID()}`,
    summary: `Contribution Due — ${opts.groupName}`,
    description: `Your contribution of ${opts.contributionAmount} for cycle #${opts.cycleNumber} in "${opts.groupName}" is due. Pay on time to maintain your standing.`,
    dtstart: opts.dueDate,
    dtend,
    url: opts.appUrl,
    alarmMinutes: 60, // 1 hour before
  }
}

export interface PayoutEventOptions {
  groupId: string
  groupName: string
  payoutAmount: string
  payoutDate: Date
  appUrl?: string
}

/**
 * Builds a CalendarEvent for an upcoming payout.
 */
export function buildPayoutEvent(opts: PayoutEventOptions): CalendarEvent {
  const dtend = new Date(opts.payoutDate.getTime() + 60 * 60 * 1000)
  return {
    uid: `payout-${opts.groupId}-${generateUID()}`,
    summary: `Payout Incoming — ${opts.groupName}`,
    description: `You are scheduled to receive ${opts.payoutAmount} from "${opts.groupName}".`,
    dtstart: opts.payoutDate,
    dtend,
    url: opts.appUrl,
    alarmMinutes: 120, // 2 hours before
  }
}

// ── Group calendar generation ─────────────────────────────────────────────

/**
 * Generates a full iCal feed for all upcoming contribution deadlines
 * and payouts for a given user across all their groups.
 */
export async function generateUserCalendarFeed(userId: string): Promise<string> {
  const appUrl = process.env.FRONTEND_URL ?? 'https://app.ajo.finance'
  const events: CalendarEvent[] = []

  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    include: {
      group: {
        include: {
          contributions: {
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  })

  for (const membership of memberships) {
    const group = membership.group as any
    if (!group.isActive) continue

    const deadline: Date | undefined = group.cycleDeadline ?? group.nextPayoutAt
    if (deadline && deadline > new Date()) {
      const amount = `${Number(group.contributionAmount) / 1e7} XLM`
      events.push(
        buildContributionReminderEvent({
          groupId: group.id,
          groupName: group.name,
          contributionAmount: amount,
          dueDate: deadline,
          cycleNumber: group.currentRound ?? 1,
          appUrl: `${appUrl}/groups/${group.id}`,
        })
      )
    }
  }

  logger.info(`Generated calendar feed for user ${userId}: ${events.length} events`)
  return buildICalendar(events, 'Ajo — My Contributions')
}

/**
 * Generates a single-event iCal for a specific contribution reminder.
 */
export async function generateContributionEventIcal(
  groupId: string,
  userId: string
): Promise<{ ical: string; googleUrl: string; outlookUrl: string } | null> {
  const appUrl = process.env.FRONTEND_URL ?? 'https://app.ajo.finance'

  const group = await prisma.group.findUnique({
    where: { id: groupId },
  }) as any

  if (!group) return null

  const deadline: Date | undefined = group.cycleDeadline ?? group.nextPayoutAt
  if (!deadline) return null

  const amount = `${Number(group.contributionAmount) / 1e7} XLM`
  const event = buildContributionReminderEvent({
    groupId: group.id,
    groupName: group.name,
    contributionAmount: amount,
    dueDate: deadline,
    cycleNumber: group.currentRound ?? 1,
    appUrl: `${appUrl}/groups/${group.id}`,
  })

  return {
    ical: buildICalendar([event]),
    googleUrl: buildGoogleCalendarUrl(event),
    outlookUrl: buildOutlookCalendarUrl(event),
  }
}
