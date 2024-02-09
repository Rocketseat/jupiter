import { convertVideoToMP3 } from '@nivo/ffmpeg'
import axios from 'axios'
import { Draft, enableMapSet } from 'immer'
import { atom } from 'jotai'
import { selectAtom } from 'jotai/utils'
import { atomWithImmer } from 'jotai-immer'

import { nativeClient } from '@/lib/trpc/client'

enableMapSet()

interface Upload {
  file: File
  audioFile?: File
  previewURL: string
  duration?: number
  isRemoving: boolean
}

interface AsyncActionWithProgress {
  isRunning: boolean
  progress: number
  error: boolean
}

type Uploads = Map<string, Upload>

/**
 * State atoms
 */

export const isRunningAudioConversionAtom = atom(false)
export const isRunningAIGenerationAtom = atom(false)
export const audioConversionQueueAtom = atomWithImmer<Set<string>>(new Set())
export const uploadsAtom = atomWithImmer<Uploads>(new Map())

export const videoUploadAtom = atomWithImmer<
  Map<string, AsyncActionWithProgress>
>(new Map())

export const audioConversionAtom = atomWithImmer<
  Map<string, AsyncActionWithProgress>
>(new Map())

export const audioUploadAtom = atomWithImmer<
  Map<string, AsyncActionWithProgress>
>(new Map())

/**
 * State selectors
 */

export const areUploadsEmptyAtom = atom((get) => {
  return get(uploadsAtom).size === 0
})

export const isThereAnyPendingUploadAtom = atom((get) => {
  return Array.from(get(uploadsAtom).keys()).some((id) => {
    const videoUpload = get(videoUploadAtom).get(id)
    const audioConversion = get(audioConversionAtom).get(id)
    const audioUpload = get(audioUploadAtom).get(id)

    return (
      videoUpload?.isRunning ||
      videoUpload?.error ||
      audioConversion?.isRunning ||
      audioConversion?.error ||
      audioUpload?.isRunning ||
      audioUpload?.error
    )
  })
})

export const summarizedPercentageAtom = atom((get) => {
  const videoUploadProgress = summarizePercentage(
    Array.from(get(videoUploadAtom).values()),
  )

  const audioConversionProgress = summarizePercentage(
    Array.from(get(audioConversionAtom).values()),
  )

  const audioUploadProgress = summarizePercentage(
    Array.from(get(audioUploadAtom).values()),
  )

  return (
    (videoUploadProgress + audioConversionProgress + audioUploadProgress) / 3
  )
})

export const amountOfUploadsAtom = atom((get) => get(uploadsAtom).size)

/**
 * Helpers
 */

function getUploadById(uploadId: string) {
  return selectAtom(uploadsAtom, (state) => {
    const upload = state.get(uploadId)

    if (!upload) {
      throw new Error(`Upload with ID ${uploadId} not found.`)
    }

    return upload
  })
}

function createUpdateUploadDraft(uploadId: string, update: Partial<Upload>) {
  return (draft: Draft<Uploads>) => {
    const upload = draft.get(uploadId)

    if (!upload) {
      throw new Error(`Upload with ID ${uploadId} not found.`)
    }

    Object.assign(upload, update)
  }
}

function summarizePercentage(actions: AsyncActionWithProgress[]) {
  if (actions.length === 0) {
    return 0
  }

  const percentageSum = actions.reduce((acc, action) => {
    return acc + action.progress
  }, 0)

  return percentageSum / actions.length
}

/**
 * Action atoms
 */

export const addToAudioConversionQueueAtom = atom(
  null,
  (get, set, uploadId: string) => {
    set(audioConversionQueueAtom, (draft) => draft.add(uploadId))

    set(audioConversionAtom, (draft) => {
      const audioConversion = draft.get(uploadId)

      if (!audioConversion) return

      audioConversion.isRunning = false
      audioConversion.progress = 0
      audioConversion.error = false
    })

    if (get(isRunningAudioConversionAtom) === false) {
      set(runAudioConversionQueueAtom)
    }
  },
)

export const addUploadAtom = atom(null, (_, set, file: File) => {
  const uploadId = crypto.randomUUID()

  set(uploadsAtom, (draft) =>
    draft.set(uploadId, {
      file,
      previewURL: URL.createObjectURL(file),
      isRemoving: false,
    }),
  )

  set(videoUploadAtom, (draft) =>
    draft.set(uploadId, {
      isRunning: false,
      error: false,
      progress: 0,
    }),
  )

  set(audioConversionAtom, (draft) =>
    draft.set(uploadId, {
      isRunning: false,
      error: false,
      progress: 0,
    }),
  )

  set(audioUploadAtom, (draft) =>
    draft.set(uploadId, {
      isRunning: false,
      error: false,
      progress: 0,
    }),
  )

  set(startVideoUploadAtom, uploadId)
  set(addToAudioConversionQueueAtom, uploadId)

  return uploadId
})

export const addUploadsAtom = atom(null, (_, set, files: File[]) => {
  files.forEach((file) => set(addUploadAtom, file))
})

export const updateUploadDurationAtom = atom(
  null,
  (_, set, uploadId: string, duration: number) => {
    set(uploadsAtom, createUpdateUploadDraft(uploadId, { duration }))
  },
)

export const startVideoUploadAtom = atom(
  null,
  async (get, set, uploadId: string) => {
    set(videoUploadAtom, (draft) => {
      const videoUpload = draft.get(uploadId)

      if (!videoUpload) return

      videoUpload.isRunning = true
      videoUpload.progress = 0
      videoUpload.error = false
    })

    const upload = get(getUploadById(uploadId))
    const abortController = new AbortController()

    try {
      const { url: uploadUrl } = await nativeClient.requestVideoUploadUrl.query(
        {
          videoId: uploadId,
        },
      )

      await axios.put(uploadUrl, upload.file, {
        signal: abortController.signal,
        headers: {
          'Content-Type': upload.file.type,
        },
        onUploadProgress(progressEvent) {
          const progress = progressEvent.progress
            ? Math.round(progressEvent.progress * 100)
            : 0

          set(videoUploadAtom, (draft) => {
            const videoUpload = draft.get(uploadId)

            if (!videoUpload) return

            videoUpload.progress = progress
            videoUpload.isRunning = progress < 100
          })
        },
      })
    } catch (err) {
      set(videoUploadAtom, (draft) => {
        const videoUpload = draft.get(uploadId)

        if (!videoUpload) return

        videoUpload.isRunning = false
        videoUpload.error = true
      })
    }
  },
)

export const startAudioUploadAtom = atom(
  null,
  async (get, set, uploadId: string) => {
    set(audioUploadAtom, (draft) => {
      const audioUpload = draft.get(uploadId)

      if (!audioUpload) return

      audioUpload.progress = 0
      audioUpload.isRunning = true
      audioUpload.error = false
    })

    try {
      const upload = get(getUploadById(uploadId))
      const abortController = new AbortController()

      if (!upload.audioFile) {
        throw new Error(`Audio file not found for upload ${uploadId}.`)
      }

      const { url: uploadUrl } = await nativeClient.requestAudioUploadUrl.query(
        {
          videoId: uploadId,
        },
      )

      await axios.put(uploadUrl, upload.audioFile, {
        signal: abortController.signal,
        headers: {
          'Content-Type': upload.audioFile.type,
        },
        onUploadProgress(progressEvent) {
          const progress = progressEvent.progress
            ? Math.round(progressEvent.progress * 100)
            : 0

          set(audioUploadAtom, (draft) => {
            const audioUpload = draft.get(uploadId)

            if (!audioUpload) return

            audioUpload.progress = progress
            audioUpload.isRunning = progress < 100
          })
        },
      })
    } catch (err) {
      set(audioUploadAtom, (draft) => {
        const audioUpload = draft.get(uploadId)

        if (!audioUpload) return

        audioUpload.isRunning = false
        audioUpload.error = true
      })
    }
  },
)

export const convertUploadVideoToAudioAtom = atom(
  null,
  async (get, set, uploadId: string) => {
    set(audioConversionAtom, (draft) => {
      const audioConversion = draft.get(uploadId)

      if (!audioConversion) return

      audioConversion.progress = 0
      audioConversion.isRunning = true
      audioConversion.error = false
    })

    try {
      const { file } = get(getUploadById(uploadId))

      const result = await Promise.race<[Promise<File>, Promise<'timeout'>]>([
        convertVideoToMP3(file, (progress) => {
          set(audioConversionAtom, (draft) => {
            const audioConversion = draft.get(uploadId)

            if (!audioConversion) return

            audioConversion.progress = progress
          })
        }),
        new Promise((resolve) => setTimeout(resolve, 50_000, 'timeout')),
      ])

      if (result === 'timeout') {
        throw new Error('Audio conversion timeout')
      }

      set(audioConversionAtom, (draft) => {
        const audioConversion = draft.get(uploadId)

        if (!audioConversion) return

        audioConversion.isRunning = false
      })

      set(
        uploadsAtom,
        createUpdateUploadDraft(uploadId, {
          audioFile: result,
        }),
      )

      set(startAudioUploadAtom, uploadId)
    } catch (err) {
      set(audioConversionAtom, (draft) => {
        const audioConversion = draft.get(uploadId)

        if (!audioConversion) return

        audioConversion.isRunning = false
        audioConversion.error = true
      })
    } finally {
      set(audioConversionQueueAtom, (draft) => {
        draft.delete(uploadId)
      })

      set(runAudioConversionQueueAtom)
    }
  },
)

export const runAudioConversionQueueAtom = atom(null, async (get, set) => {
  const queue = get(audioConversionQueueAtom)

  if (queue.size === 0) {
    set(isRunningAudioConversionAtom, false)
    return
  }

  set(isRunningAudioConversionAtom, true)

  const nextUploadId = Array.from(queue)[0]

  /**
   * As FFMpeg can only convert one file at a time, we loop thought the queue
   * until there are not more videos to convert.
   */
  set(convertUploadVideoToAudioAtom, nextUploadId)
})

export const deleteUploadAtom = atom(
  null,
  async (get, set, uploadId: string) => {
    set(uploadsAtom, createUpdateUploadDraft(uploadId, { isRemoving: true }))

    // const { isUploadingVideo, isUploadingAudio, isConvertingAudio } = get(
    //   getUploadById(uploadId),
    // )

    // if (isConvertingAudio) {
    //   ffmpeg.exit()
    // }

    set(uploadsAtom, (draft) => draft.delete(uploadId))
  },
)

export const clearUploadsAtom = atom(null, async (get, set) => {
  Array.from(get(uploadsAtom).keys()).forEach((uploadId) => {
    set(deleteUploadAtom, uploadId)
  })
})
