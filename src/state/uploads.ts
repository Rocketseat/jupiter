import axios from 'axios'
import { atom } from 'jotai'
import { selectAtom } from 'jotai/utils'
import { atomWithImmer } from 'jotai-immer'
import { Draft, enableMapSet } from 'immer'
import { z } from 'zod'
import { convertVideoToMP3, ffmpeg } from '@/lib/ffmpeg'

enableMapSet()

interface Upload {
  file: File

  previewURL: string
  duration?: number
  isRemoving: boolean

  /** Video Upload */
  isUploadingVideo: boolean
  videoUploadProgress: number
  hasVideoUploadError: boolean

  /** Audio Conversion */
  audioFile?: File
  isConvertingAudio: boolean
  audioConversionProgress: number
  hasAudioConversionError: boolean

  /** Audio Upload */
  isUploadingAudio: boolean
  audioUploadProgress: number
  hasAudioUploadError: boolean
}

type Uploads = Map<string, Upload>

/**
 * State atoms
 */

export const isRunningAudioConversionAtom = atom(false)
export const audioConversionQueueAtom = atomWithImmer<Set<string>>(new Set())
export const uploadsAtom = atomWithImmer<Uploads>(new Map())

/**
 * State selectors
 */

export const areUploadsEmptyAtom = atom((get) => {
  return get(uploadsAtom).size === 0
})

export const isThereAnyPendingUploadAtom = atom((get) => {
  return Array.from(get(uploadsAtom).values()).some((upload) => {
    return (
      upload.isUploadingVideo ||
      upload.isUploadingAudio ||
      upload.isConvertingAudio ||
      upload.hasVideoUploadError ||
      upload.hasAudioUploadError ||
      upload.hasVideoUploadError
    )
  })
})

export const summarizedPercentageAtom = atom((get) => {
  const { amountOfItems, percentageSum } = Array.from(
    get(uploadsAtom).values(),
  ).reduce(
    (acc, upload) => {
      return {
        amountOfItems: acc.amountOfItems + 1,
        percentageSum:
          acc.percentageSum +
          (upload.videoUploadProgress +
            upload.audioUploadProgress +
            upload.audioUploadProgress) /
            3,
      }
    },
    {
      amountOfItems: 0,
      percentageSum: 0,
    },
  )

  if (amountOfItems === 0) {
    return 0
  }

  const percentage = amountOfItems
    ? Math.round(percentageSum / amountOfItems)
    : 0

  return percentage
})

export const amountOfUploadsAtom = atom((get) => get(uploadsAtom).size)

/**
 * Helpers
 */

function createUploadFromFile(file: File): Upload {
  return {
    file,
    previewURL: URL.createObjectURL(file),
    isRemoving: false,
    isUploadingVideo: false,
    isConvertingAudio: false,
    isUploadingAudio: false,
    hasVideoUploadError: false,
    hasAudioConversionError: false,
    hasAudioUploadError: false,
    videoUploadProgress: 0,
    audioConversionProgress: 0,
    audioUploadProgress: 0,
  }
}

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

/**
 * Action atoms
 */

export const addUploadAtom = atom(null, (get, set, file: File) => {
  const uploadId = crypto.randomUUID()

  set(uploadsAtom, (draft) => draft.set(uploadId, createUploadFromFile(file)))
  set(startUploadAtom, uploadId)
  set(audioConversionQueueAtom, (draft) => draft.add(uploadId))

  if (get(isRunningAudioConversionAtom) === false) {
    set(runAudioConversionQueueAtom)
  }

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

export const startUploadAtom = atom(
  null,
  async (get, set, uploadId: string) => {
    set(
      uploadsAtom,
      createUpdateUploadDraft(uploadId, {
        isUploadingVideo: true,
        videoUploadProgress: 0,
        hasVideoUploadError: false,
      }),
    )

    const upload = get(getUploadById(uploadId))
    const abortController = new AbortController()

    try {
      const response = await axios.post('/api/uploads', { videoId: uploadId })
      const uploadURL = z.string().url().parse(response.data.url)

      await axios.put(uploadURL, upload.file, {
        signal: abortController.signal,
        headers: {
          'Content-Type': upload.file.type,
        },
        onUploadProgress(progressEvent) {
          const progress = progressEvent.progress
            ? Math.round(progressEvent.progress * 100)
            : 0

          set(
            uploadsAtom,
            createUpdateUploadDraft(uploadId, {
              videoUploadProgress: progress,
              isUploadingVideo: progress < 100,
            }),
          )
        },
      })
    } catch (err) {
      set(
        uploadsAtom,
        createUpdateUploadDraft(uploadId, {
          isUploadingVideo: false,
          hasVideoUploadError: true,
        }),
      )
    }
  },
)

export const startAudioUploadAtom = atom(
  null,
  async (get, set, uploadId: string) => {
    set(
      uploadsAtom,
      createUpdateUploadDraft(uploadId, {
        isUploadingAudio: true,
        audioUploadProgress: 0,
        hasAudioUploadError: false,
      }),
    )

    try {
      const upload = get(getUploadById(uploadId))
      const abortController = new AbortController()

      if (!upload.audioFile) {
        throw new Error(`Audio file not found for upload ${uploadId}.`)
      }

      const response = await axios.post('/api/uploads/audio', {
        videoId: uploadId,
      })

      const uploadURL = z.string().url().parse(response.data.url)

      await axios.put(uploadURL, upload.audioFile, {
        signal: abortController.signal,
        headers: {
          'Content-Type': upload.audioFile.type,
        },
        onUploadProgress(progressEvent) {
          const progress = progressEvent.progress
            ? Math.round(progressEvent.progress * 100)
            : 0

          set(
            uploadsAtom,
            createUpdateUploadDraft(uploadId, {
              audioUploadProgress: progress,
              isUploadingAudio: progress < 100,
            }),
          )
        },
      })
    } catch (err) {
      set(
        uploadsAtom,
        createUpdateUploadDraft(uploadId, {
          isUploadingAudio: false,
          hasAudioUploadError: true,
        }),
      )
    }
  },
)

export const convertUploadVideoToAudioAtom = atom(
  null,
  async (get, set, uploadId: string) => {
    set(
      uploadsAtom,
      createUpdateUploadDraft(uploadId, {
        isConvertingAudio: true,
        audioConversionProgress: 0,
        hasAudioConversionError: false,
      }),
    )

    try {
      const { file } = get(getUploadById(uploadId))

      const audioFile = await convertVideoToMP3(file, (progress) => {
        set(
          uploadsAtom,
          createUpdateUploadDraft(uploadId, {
            audioConversionProgress: progress,
          }),
        )
      })

      set(
        uploadsAtom,
        createUpdateUploadDraft(uploadId, {
          isConvertingAudio: false,
          audioFile,
        }),
      )

      set(startAudioUploadAtom, uploadId)
    } catch (err) {
      set(
        uploadsAtom,
        createUpdateUploadDraft(uploadId, {
          isConvertingAudio: false,
          hasAudioConversionError: true,
        }),
      )
    } finally {
      set(audioConversionQueueAtom, (draft) => {
        draft.delete(uploadId)
      })

      set(runAudioConversionQueueAtom)
    }
  },
)

export const runAudioConversionQueueAtom = atom(null, (get, set) => {
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

    const { isUploadingVideo, isUploadingAudio, isConvertingAudio } = get(
      getUploadById(uploadId),
    )

    if (isConvertingAudio) {
      ffmpeg.exit()
    }

    set(uploadsAtom, (draft) => draft.delete(uploadId))
  },
)

export const clearUploadsAtom = atom(null, async (get, set) => {
  Array.from(get(uploadsAtom).keys()).forEach((uploadId) => {
    set(deleteUploadAtom, uploadId)
  })
})
