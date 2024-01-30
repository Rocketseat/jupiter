import { randomUUID } from 'node:crypto'

import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'
import axios from 'axios'
import { NextRequest, NextResponse } from 'next/server'
import WebSocket from 'ws'
import { z } from 'zod'

import { env } from '@/env'
import { prisma } from '@/lib/prisma'

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

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      },
    })

    if (!video.processedAt) {
      return NextResponse.json(
        { message: "Video hasn't processed yet." },
        {
          status: 400,
        },
      )
    }

    if (video.externalProviderId) {
      return NextResponse.json(
        { message: 'Video has already been uploaded to external provider.' },
        {
          status: 409,
        },
      )
    }

    await prisma.webhook.create({
      data: {
        id: webhookId,
        type: 'UPLOAD_TO_EXTERNAL_PROVIDER',
        videoId,
        metadata: JSON.stringify(body),
      },
    })

    const videoDownloadURL = `https://pub-${env.CLOUDFLARE_UPLOAD_BUCKET_ID}.r2.dev/${video.id}.mp4`

    const response = await axios.post(
      'https://import.pandavideo.com:9443/videos',
      {
        folder_id: env.PANDAVIDEO_UPLOAD_FOLDER,
        video_id: video.id,
        title: video.id,
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

          if (message.action === 'success' && message.payload?.complete) {
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

    await prisma.webhook.update({
      where: {
        id: webhookId,
      },
      data: {
        status: 'SUCCESS',
        finishedAt: new Date(),
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (err: unknown) {
    await prisma.webhook.update({
      where: {
        id: webhookId,
      },
      data: {
        status: 'ERROR',
        finishedAt: new Date(),
      },
    })

    return NextResponse.json(
      { message: 'Error uploading video.', error: err },
      { status: 400 },
    )
  }
}

export const POST = verifySignatureAppRouter(handler)
