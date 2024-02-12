import { env } from '@nivo/env'
import { Kafka } from '@upstash/kafka'

export const kafka = new Kafka({
  url: env.KAFKA_BROKER_URL,
  username: env.KAFKA_USERNAME,
  password: env.KAFKA_PASSWORD,
})

const producer = kafka.producer()

export async function publishMessagesOnTopic<T = unknown>({
  topic,
  messages,
  runInDev = false,
}: {
  topic: string
  messages: T[]
  runInDev?: boolean
}) {
  if (env.NODE_ENV === 'development' && runInDev === false) {
    console.log(
      `[Skipped] [Kafka] Messages to "${topic}: ${JSON.stringify(messages)}"`,
    )

    return
  }

  await producer.produceMany(
    messages.map((message) => {
      return {
        topic,
        value: message,
      }
    }),
  )
}
