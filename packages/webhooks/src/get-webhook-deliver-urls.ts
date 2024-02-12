import { db } from '@nivo/drizzle'
import { companyWebhook } from '@nivo/drizzle/schema'
import { and, arrayContains, eq } from 'drizzle-orm'
import { z } from 'zod'

import { webhookEventTriggerSchema } from './webhook-event-trigger'

const getWebhookDeliverUrlsParamsSchema = z.object({
  companyId: z.string().uuid(),
  trigger: webhookEventTriggerSchema,
})

type GetWebhookDeliverUrlsParams = z.infer<
  typeof getWebhookDeliverUrlsParamsSchema
>

export async function getWebhookDeliverUrls({
  companyId,
  trigger,
}: GetWebhookDeliverUrlsParams) {
  const webhooks = await db
    .select({ url: companyWebhook.url })
    .from(companyWebhook)
    .where(
      and(
        eq(companyWebhook.companyId, companyId),
        arrayContains(companyWebhook.triggers, [trigger]),
      ),
    )

  const deliverToUrls = webhooks.map((webhook) => webhook.url)

  return deliverToUrls
}
