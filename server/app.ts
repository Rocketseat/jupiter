import { Elysia } from 'elysia'

import { createTag } from './routes/create-tag'
import { createUploadBatch } from './routes/create-upload-batch'
import { deleteUpload } from './routes/delete-upload'
import { downloadUploadMedia } from './routes/download-upload-media'
import { generateAIDescription } from './routes/generate-ai-description'
import { generateAITitle } from './routes/generate-ai-title'
import { getTags } from './routes/get-tags'
import { getUpload } from './routes/get-upload'
import { getUploadBatch } from './routes/get-upload-batch'
import { getUploadTranscription } from './routes/get-upload-transcription'
import { getUploadWebhooks } from './routes/get-upload-webhooks'
import { getUploads } from './routes/get-uploads'
import { requestAudioUploadURL } from './routes/request-audio-upload-url'
import { requestVideoUploadURL } from './routes/request-video-upload-url'
import { updateUpload } from './routes/update-upload'

export const app = new Elysia({ prefix: '/api' })
  .use(createTag)
  .use(createUploadBatch)
  .use(deleteUpload)
  .use(downloadUploadMedia)
  .use(generateAITitle)
  .use(generateAIDescription)
  .use(getTags)
  .use(getUploadBatch)
  .use(getUploadTranscription)
  .use(getUploadWebhooks)
  .use(getUploads)
  .use(getUpload)
  .use(requestAudioUploadURL)
  .use(requestVideoUploadURL)
  .use(updateUpload)
  .onError(({ error, set }) => {
    console.error(error)

    set.status = 500

    return new Response()
  })

export type App = typeof app
