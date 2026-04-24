import { Router, Request, Response } from 'express'
import { prisma } from '@/config/database'
import { WebhookSigner } from './signer'
import crypto from 'crypto'

const router = Router()

router.post('/webhooks', async (req: Request, res: Response) => {
  const { url, events } = req.body

  if (!url || !events || !Array.isArray(events)) {
    return res.status(400).json({ error: 'Invalid request' })
  }

  const secret = crypto.randomBytes(32).toString('hex')
  const webhook = await prisma.webhook.create({
    data: { url, events, secret, active: true },
  })

  res.json(webhook)
})

router.get('/webhooks', async (req: Request, res: Response) => {
  const webhooks = await prisma.webhook.findMany()
  res.json(webhooks)
})

router.put('/webhooks/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const { url, events, active } = req.body

  const webhook = await prisma.webhook.update({
    where: { id },
    data: { ...(url && { url }), ...(events && { events }), ...(active !== undefined && { active }) },
  })

  res.json(webhook)
})

router.delete('/webhooks/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  await prisma.webhook.delete({ where: { id } })
  res.json({ success: true })
})

router.get('/webhooks/:id/deliveries', async (req: Request, res: Response) => {
  const { id } = req.params
  const events = await prisma.webhookEvent.findMany({
    where: { webhookId: id },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  res.json(events)
})

export default router
