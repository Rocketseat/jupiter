import { randomUUID } from 'node:crypto'

import { verifySignatureAppRouter } from '@upstash/qstash/dist/nextjs'
import axios from 'axios'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import WebSocket from 'ws'
import { z } from 'zod'

import { db } from '@/drizzle/client'
import { webhook } from '@/drizzle/schema'
import { env } from '@/env'

type PandaMessage = {
  action: 'progress' | 'success'
  payload: any
}

const createTranscriptionBodySchema = z.object({
  videoId: z.string().uuid(),
})

export const maxDuration = 300

async function handler(request: NextRequest) {
  const webhookId = randomUUID()

  const body = await request.json()

  try {
    const { videoId } = createTranscriptionBodySchema.parse(body)

    const sourceVideo = await db.query.video.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, videoId)
      },
    })

    if (!sourceVideo) {
      return NextResponse.json(
        { message: 'Video not found.' },
        {
          status: 400,
        },
      )
    }

    if (!sourceVideo.processedAt) {
      return NextResponse.json(
        { message: "Video hasn't processed yet." },
        {
          status: 400,
        },
      )
    }

    if (sourceVideo.externalProviderId) {
      return NextResponse.json(
        { message: 'Video has already been uploaded to external provider.' },
        {
          status: 409,
        },
      )
    }

    await db.insert(webhook).values({
      id: webhookId,
      type: 'UPLOAD_TO_EXTERNAL_PROVIDER',
      videoId,
      metadata: JSON.stringify({ videoId }),
    })

    const videoDownloadURL = `https://pub-${env.CLOUDFLARE_UPLOAD_BUCKET_ID}.r2.dev/${sourceVideo.id}.mp4`

    const response = await axios.post(
      'https://import.pandavideo.com:9443/videos',
      {
        folder_id: env.PANDAVIDEO_UPLOAD_FOLDER,
        video_id: sourceVideo.id,
        title: sourceVideo.id,
        url: videoDownloadURL,
      },
      {
        headers: {
          Authorization: env.PANDAVIDEO_API_KEY,
        },
      },
    )

    const { websocket_url: websocketURL } = response.data

    await new Promise((resolve, reject) => {
      const socket = new WebSocket(websocketURL)

      socket.on('message', (data) => {
        try {
          const message: PandaMessage = JSON.parse(data.toString())

          if (message.action === 'success' && 'complete' in message.payload) {
            resolve(true)
          }
        } catch (err) {
          return reject(err)
        }
      })

      socket.on('close', () => {
        resolve(true)
      })
    })

    await db
      .update(webhook)
      .set({
        status: 'SUCCESS',
        finishedAt: new Date(),
      })
      .where(eq(webhook.id, webhookId))

    return new NextResponse(null, { status: 204 })
  } catch (err: unknown) {
    await db
      .update(webhook)
      .set({
        status: 'ERROR',
        finishedAt: new Date(),
      })
      .where(eq(webhook.id, webhookId))

    return NextResponse.json(
      { message: 'Error uploading video.', error: err },
      { status: 400 },
    )
  }
}

export const POST = verifySignatureAppRouter(handler)
