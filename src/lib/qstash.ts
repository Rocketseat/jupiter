import { Client, PublishJsonRequest } from '@upstash/qstash'
import { verifySignatureAppRouter } from '@upstash/qstash/dist/nextjs'
import { NextRequest, NextResponse } from 'next/server'

import { env } from '@/env'

const qstash = new Client({
  token: env.QSTASH_TOKEN,
})

export async function publishMessage<T = any>({
  topic,
  body,
  runInDev = false,
  options,
}: {
  topic: string
  body: T
  runInDev?: boolean
  options?: Pick<PublishJsonRequest, 'delay'>
}) {
  if (env.NODE_ENV === 'development' && runInDev === false) {
    console.log(
      `[Skipped] [QStash] Publish to "${topic}: ${JSON.stringify(body)}"`,
    )

    return
  }

  await qstash.publishJSON({
    topic,
    contentBasedDeduplication: true,
    body,
    ...options,
  })
}

export async function validateQStashSignature(
  handler: (request: NextRequest) => Promise<NextResponse>,
) {
  return async (request: NextRequest) => {
    if (env.QSTASH_VALIDATE_SIGNATURE) {
      return await verifySignatureAppRouter(handler)(request)
    }

    return await handler(request)
  }
}
