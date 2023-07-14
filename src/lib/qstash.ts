import { env } from '@/env'
import { Receiver, Client } from '@upstash/qstash/nodejs'

const qstash = new Client({
  token: env.QSTASH_TOKEN,
})

export async function publishMessage<T = any>({
  topic,
  body,
  runInDev = false,
}: {
  topic: string
  body: T
  runInDev?: boolean
}) {
  if (env.NODE_ENV === 'development' && runInDev === false) {
    console.log(`[Skipped] Publish to "${topic}: ${JSON.stringify(body)}"`)

    return
  }

  await qstash.publishJSON({
    topic,
    contentBasedDeduplication: true,
    body,
  })
}

export async function validateQStashSignature({
  request,
  runInDev = false,
}: {
  request: Request
  runInDev?: boolean
}) {
  const requestBodyAsText = await request.text()

  if (env.NODE_ENV === 'development' && runInDev === false) {
    return {
      bodyAsJSON: JSON.parse(requestBodyAsText),
    }
  }

  const signature = request.headers.get('upstash-signature')

  const receiver = new Receiver({
    currentSigningKey: env.QSTASH_CURRENT_SIGNING_KEY,
    nextSigningKey: env.QSTASH_NEXT_SIGNING_KEY,
  })

  if (!signature) {
    throw new Error('QStash signature not found.')
  }

  const isValid = await receiver
    .verify({
      signature,
      body: requestBodyAsText,
    })
    .catch((err) => {
      console.error(err)
      return false
    })

  if (!isValid) {
    throw new Error('QStash signature is invalid.')
  }

  return {
    bodyAsJSON: JSON.parse(requestBodyAsText),
  }
}
