import { eq, getTableColumns } from 'drizzle-orm'
import { Elysia, t } from 'elysia'

import { db } from '@/drizzle/client'
import { tag, tagToVideo, video } from '@/drizzle/schema'

export const getUpload = new Elysia().get(
  '/videos/:videoId',
  async ({ params }) => {
    const { videoId } = params

    const upload = await db.query.video.findFirst({
      with: {
        tagToVideos: {
          with: {
            tag: {
              columns: {
                slug: true,
              },
            },
          },
        },
      },
      where(fields, { eq }) {
        return eq(fields.id, videoId)
      },
    })

    if (!upload) {
      throw new Error('Video not found.')
    }

    const { tagToVideos, ...video } = upload

    return {
      video: {
        ...video,
        tags: tagToVideos.map((tagToVideo) => tagToVideo.tag),
      },
    }
  },
  {
    params: t.Object({
      videoId: t.String(),
    }),
  },
)
