/**
 * Calendar Routes — Issue #619
 *
 * Endpoints for Google Calendar / Outlook integration and iCal feed generation.
 */

import { Router, Response } from 'express'
import { z } from 'zod'
import { AuthRequest } from '../middleware/auth'
import {
  generateUserCalendarFeed,
  generateContributionEventIcal,
  buildContributionReminderEvent,
  buildPayoutEvent,
  buildICalendar,
  buildGoogleCalendarUrl,
  buildOutlookCalendarUrl,
} from '../services/calendarService'
import { createModuleLogger } from '../utils/logger'

const router = Router()
const logger = createModuleLogger('CalendarRoutes')

// GET /api/calendar/feed — iCal feed for all user events (subscribe URL)
router.get('/feed', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const ical = await generateUserCalendarFeed(userId)
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="ajo-reminders.ics"')
    res.setHeader('Cache-Control', 'no-cache, no-store')
    return res.send(ical)
  } catch (error) {
    logger.error('[Calendar] Feed error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/calendar/groups/:groupId/event — single group contribution event
router.get('/groups/:groupId/event', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { groupId } = req.params
    const format = (req.query.format as string) ?? 'json'

    const result = await generateContributionEventIcal(groupId, userId)
    if (!result) return res.status(404).json({ error: 'Group not found or no upcoming deadline' })

    if (format === 'ics') {
      res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="contribution-${groupId}.ics"`)
      return res.send(result.ical)
    }

    return res.json({
      googleCalendarUrl: result.googleUrl,
      outlookCalendarUrl: result.outlookUrl,
      icsDownloadUrl: `/api/calendar/groups/${groupId}/event?format=ics`,
    })
  } catch (error) {
    logger.error('[Calendar] Group event error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/calendar/events/custom — generate calendar links for a custom event
const customEventSchema = z.object({
  type: z.enum(['contribution', 'payout']),
  groupId: z.string(),
  groupName: z.string(),
  amount: z.string(),
  date: z.string().datetime(),
  cycleNumber: z.number().optional(),
})

router.post('/events/custom', async (req: AuthRequest, res: Response) => {
  try {
    const body = customEventSchema.parse(req.body)
    const appUrl = process.env.FRONTEND_URL ?? 'https://app.ajo.finance'
    const date = new Date(body.date)

    const event =
      body.type === 'contribution'
        ? buildContributionReminderEvent({
            groupId: body.groupId,
            groupName: body.groupName,
            contributionAmount: body.amount,
            dueDate: date,
            cycleNumber: body.cycleNumber ?? 1,
            appUrl: `${appUrl}/groups/${body.groupId}`,
          })
        : buildPayoutEvent({
            groupId: body.groupId,
            groupName: body.groupName,
            payoutAmount: body.amount,
            payoutDate: date,
            appUrl: `${appUrl}/groups/${body.groupId}`,
          })

    return res.json({
      googleCalendarUrl: buildGoogleCalendarUrl(event),
      outlookCalendarUrl: buildOutlookCalendarUrl(event),
      ical: buildICalendar([event]),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.errors })
    }
    logger.error('[Calendar] Custom event error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export const calendarRouter = router
