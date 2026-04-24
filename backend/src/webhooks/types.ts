export interface Webhook {
  id: string
  url: string
  events: string[]
  active: boolean
  secret: string
  createdAt: Date
  updatedAt: Date
}

export interface WebhookEvent {
  id: string
  webhookId: string
  event: string
  payload: Record<string, any>
  status: 'pending' | 'delivered' | 'failed'
  attempts: number
  nextRetry?: Date
  createdAt: Date
}

export interface WebhookDelivery {
  webhookId: string
  eventId: string
  statusCode?: number
  responseBody?: string
  error?: string
  timestamp: Date
}
