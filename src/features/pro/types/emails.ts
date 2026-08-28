export type EmailStatus = 'sent' | 'delivered' | 'failed' | 'simulated' | 'skipped'

export interface ProEmailLogRecord {
  id: string
  recipientEmail: string
  templateName: string
  subject: string
  reason: string
  relatedWidget?: string | null
  relatedProfile?: string | null
  sentAt: string
  status: EmailStatus
  errorMessage?: string | null
  messageId?: string | null
}
