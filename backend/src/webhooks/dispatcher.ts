import axios from 'axios'
import { WebhookSigner } from './signer'
import { prisma } from '@/config/database'
import { logger } from '@/utils/logger'

const MAX_RETRIES = 5
const INITIAL_BACKOFF = 1000

export class WebhookDispatcher {
  static async dispatch(event: string, payload: Record<string, any>) {
    const webhooks = await prisma.webhook.findMany({
      where: { active: true, events: { has: event } },
    })

    for (const webhook of webhooks) {
      await this.queue(webhook.id, event, payload)
    }
  }

  private static async queue(webhookId: string, event: string, payload: Record<string, any>) {
    await prisma.webhookEvent.create({
      data: {
        webhookId,
        event,
        payload,
        status: 'pending',
        attempts: 0,
      },
    })
  }

  static async processQueue() {
    const events = await prisma.webhookEvent.findMany({
      where: {
        status: { in: ['pending', 'failed'] },
        attempts: { lt: MAX_RETRIES },
        nextRetry: { lte: new Date() },
      },
      include: { webhook: true },
    })

    for (const event of events) {
      await this.deliver(event)
    }
  }

  private static async deliver(event: any) {
    try {
      const payload = JSON.stringify(event.payload)
      const signature = WebhookSigner.sign(payload, event.webhook.secret)

      const response = await axios.post(event.webhook.url, event.payload, {
        headers: {
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': event.event,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      })

      if (response.status >= 200 && response.status < 300) {
        await prisma.webhookEvent.update({
          where: { id: event.id },
          data: { status: 'delivered', attempts: event.attempts + 1 },
        })
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      const backoff = INITIAL_BACKOFF * Math.pow(2, event.attempts)
      await prisma.webhookEvent.update({
        where: { id: event.id },
        data: {
          status: 'failed',
          attempts: event.attempts + 1,
          nextRetry: new Date(Date.now() + backoff),
        },
      })
      logger.error(`Webhook delivery failed: ${error}`)
    }
  }
}
