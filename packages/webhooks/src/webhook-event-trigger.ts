import { z } from 'zod'

import { webhookEventSchema } from './webhook-event'

export const webhookEventTriggerSchema = webhookEventSchema.transform(
  (webhookEvent) => webhookEvent.trigger,
)

export type WebhookEventTrigger = z.infer<typeof webhookEventTriggerSchema>
