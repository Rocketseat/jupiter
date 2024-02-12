import { env } from '@nivo/env'
import { qstash } from '@nivo/qstash/client'

import { getWebhookDeliverUrls } from './get-webhook-deliver-urls'
import { WebhookEvent } from './webhook-event'
import { WebhookEventTrigger } from './webhook-event-trigger'

export type PublishWebhookEventsParams = Parameters<typeof publishWebhookEvents>

export async function publishWebhookEvents<T extends WebhookEventTrigger>({
  companyId,
  trigger,
  events,
}: {
  companyId: string
  trigger: T
  events: Array<Extract<WebhookEvent, { trigger: T }>['payload']>
}) {
  const deliverToUrls = await getWebhookDeliverUrls({
    companyId,
    trigger,
  })

  if (deliverToUrls.length === 0) {
    return
  }

  if (env.NODE_ENV === 'development' && env.QSTASH_PUBLISH_MESSAGES === false) {
    console.log(
      '---------------------------------',
      '\n',
      `[Skipped] [Webhook] Event: "${trigger}" [${deliverToUrls.join(', ')}]:`,
      '\n',
      JSON.stringify(events, null, 2),
      '\n',
      '---------------------------------',
    )

    return
  }

  await Promise.all(
    deliverToUrls.flatMap(async (url) => {
      return events.map((event) => {
        return qstash.publishJSON({
          topic: env.QSTASH_WEBHOOKS_TOPIC,
          contentBasedDeduplication: true,
          body: {
            deliverTo: url,
            trigger,
            event,
          },
        })
      })
    }),
  )
}
