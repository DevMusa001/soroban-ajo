/**
 * Email Template Service
 * Issue #666: Email Service with Templates
 * 
 * Manages email templates with variables, delivery tracking, bounce handling,
 * and unsubscribe management.
 */

import { PrismaClient } from '@prisma/client'
import { createModuleLogger } from '../utils/logger'

const logger = createModuleLogger('EmailTemplateService')
const prisma = new PrismaClient()

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent?: string
  variables: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface EmailDeliveryRecord {
  id: string
  templateId: string
  recipientEmail: string
  subject: string
  status: 'pending' | 'sent' | 'failed' | 'bounced' | 'complained'
  sentAt?: Date
  bouncedAt?: Date
  complaintAt?: Date
  metadata?: Record<string, any>
}

export interface UnsubscribeRecord {
  id: string
  email: string
  reason?: string
  unsubscribedAt: Date
}

export class EmailTemplateService {
  /**
   * Create or update an email template
   */
  async upsertTemplate(data: {
    name: string
    subject: string
    htmlContent: string
    textContent?: string
    variables?: string[]
  }): Promise<EmailTemplate> {
    try {
      const template = await prisma.emailTemplate.upsert({
        where: { name: data.name },
        update: {
          subject: data.subject,
          htmlContent: data.htmlContent,
          textContent: data.textContent,
          variables: data.variables || [],
        },
        create: {
          name: data.name,
          subject: data.subject,
          htmlContent: data.htmlContent,
          textContent: data.textContent,
          variables: data.variables || [],
          isActive: true,
        },
      })
      logger.info('Template upserted', { templateName: data.name })
      return template as EmailTemplate
    } catch (error) {
      logger.error('Failed to upsert template', { error, templateName: data.name })
      throw error
    }
  }

  /**
   * Get template by name
   */
  async getTemplate(name: string): Promise<EmailTemplate | null> {
    try {
      const template = await prisma.emailTemplate.findUnique({
        where: { name },
      })
      return template as EmailTemplate | null
    } catch (error) {
      logger.error('Failed to get template', { error, templateName: name })
      return null
    }
  }

  /**
   * Render template with variables
   */
  renderTemplate(template: EmailTemplate, variables: Record<string, any>): {
    subject: string
    html: string
    text?: string
  } {
    let subject = template.subject
    let html = template.htmlContent
    let text = template.textContent || ''

    // Replace variables in all content
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      const regex = new RegExp(placeholder, 'g')
      subject = subject.replace(regex, String(value))
      html = html.replace(regex, String(value))
      text = text.replace(regex, String(value))
    })

    return { subject, html, text }
  }

  /**
   * Track email delivery
   */
  async trackDelivery(data: {
    templateId: string
    recipientEmail: string
    subject: string
    status: 'pending' | 'sent' | 'failed' | 'bounced' | 'complained'
    metadata?: Record<string, any>
  }): Promise<EmailDeliveryRecord> {
    try {
      const record = await prisma.emailDelivery.create({
        data: {
          templateId: data.templateId,
          recipientEmail: data.recipientEmail,
          subject: data.subject,
          status: data.status,
          sentAt: data.status === 'sent' ? new Date() : undefined,
          metadata: data.metadata,
        },
      })
      logger.info('Delivery tracked', {
        email: data.recipientEmail,
        status: data.status,
      })
      return record as EmailDeliveryRecord
    } catch (error) {
      logger.error('Failed to track delivery', { error })
      throw error
    }
  }

  /**
   * Handle bounce webhook
   */
  async handleBounce(email: string, bounceType: 'permanent' | 'temporary'): Promise<void> {
    try {
      await prisma.emailDelivery.updateMany({
        where: { recipientEmail: email, status: 'sent' },
        data: {
          status: 'bounced',
          bouncedAt: new Date(),
          metadata: { bounceType },
        },
      })

      if (bounceType === 'permanent') {
        await this.addToUnsubscribe(email, 'bounce')
      }

      logger.info('Bounce handled', { email, bounceType })
    } catch (error) {
      logger.error('Failed to handle bounce', { error, email })
      throw error
    }
  }

  /**
   * Handle complaint webhook
   */
  async handleComplaint(email: string): Promise<void> {
    try {
      await prisma.emailDelivery.updateMany({
        where: { recipientEmail: email, status: 'sent' },
        data: {
          status: 'complained',
          complaintAt: new Date(),
        },
      })

      await this.addToUnsubscribe(email, 'complaint')
      logger.info('Complaint handled', { email })
    } catch (error) {
      logger.error('Failed to handle complaint', { error, email })
      throw error
    }
  }

  /**
   * Add email to unsubscribe list
   */
  async addToUnsubscribe(email: string, reason?: string): Promise<UnsubscribeRecord> {
    try {
      const record = await prisma.unsubscribe.upsert({
        where: { email },
        update: { reason },
        create: { email, reason },
      })
      logger.info('Email unsubscribed', { email, reason })
      return record as UnsubscribeRecord
    } catch (error) {
      logger.error('Failed to add to unsubscribe', { error, email })
      throw error
    }
  }

  /**
   * Check if email is unsubscribed
   */
  async isUnsubscribed(email: string): Promise<boolean> {
    try {
      const record = await prisma.unsubscribe.findUnique({
        where: { email },
      })
      return !!record
    } catch (error) {
      logger.error('Failed to check unsubscribe status', { error, email })
      return false
    }
  }

  /**
   * Get delivery statistics
   */
  async getDeliveryStats(templateId: string, days: number = 30): Promise<{
    total: number
    sent: number
    failed: number
    bounced: number
    complained: number
  }> {
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

      const records = await prisma.emailDelivery.findMany({
        where: {
          templateId,
          createdAt: { gte: since },
        },
      })

      return {
        total: records.length,
        sent: records.filter(r => r.status === 'sent').length,
        failed: records.filter(r => r.status === 'failed').length,
        bounced: records.filter(r => r.status === 'bounced').length,
        complained: records.filter(r => r.status === 'complained').length,
      }
    } catch (error) {
      logger.error('Failed to get delivery stats', { error, templateId })
      throw error
    }
  }

  /**
   * Get unsubscribe rate
   */
  async getUnsubscribeRate(templateId: string, days: number = 30): Promise<number> {
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

      const totalSent = await prisma.emailDelivery.count({
        where: {
          templateId,
          status: 'sent',
          sentAt: { gte: since },
        },
      })

      const unsubscribed = await prisma.emailDelivery.count({
        where: {
          templateId,
          status: { in: ['bounced', 'complained'] },
          createdAt: { gte: since },
        },
      })

      return totalSent > 0 ? (unsubscribed / totalSent) * 100 : 0
    } catch (error) {
      logger.error('Failed to get unsubscribe rate', { error, templateId })
      throw error
    }
  }
}

export const emailTemplateService = new EmailTemplateService()
