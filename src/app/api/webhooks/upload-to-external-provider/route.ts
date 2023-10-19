import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import axios from 'axios'
import { z } from 'zod'
import { env } from '@/env'
import { validateQStashSignature } from '@/lib/qstash'
import WebSocket from 'ws'
import { randomUUID } from 'node:crypto'

type PandaMessage = {
  action: 'progress' | 'success'
  payload: any
}

const createTranscriptionBodySchema = z.object({
  videoId: z.string().uuid(),
})

export const config = {
  maxDuration: 300,
}

export async function POST(request: Request) {
  const webhookId = randomUUID()

  try {
    const { bodyAsJSON } = await validateQStashSignature({ request })

    const { videoId } = createTranscriptionBodySchema.parse(bodyAsJSON)

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
        metadata: JSON.stringify(bodyAsJSON),
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

    return new Response()
  } catch (err: any) {
    console.error(err)

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
      { message: 'Error uploading video.', error: err?.message || '' },
      { status: 401 },
    )
  }
}
