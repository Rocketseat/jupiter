import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react'
import axios from 'axios'
import { produce, enableMapSet } from 'immer'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { UploadsFormSchema } from '../app/(app)/upload/upload-list'
import { ffmpeg } from '@/lib/ffmpeg'
import { fetchFile } from '@ffmpeg/ffmpeg'

enableMapSet()

export interface Upload {
  file: File
  audioFile?: File
  title?: string
  previewURL: string
  duration?: number
  isRemoving: boolean

  /** Audio Conversion */
  isConvertingAudio: boolean
  audioProgress: number

  /** Video Upload */
  isUploading: boolean
  uploadProgress: number
  abortController?: AbortController
  hasError: boolean

  /** Audio Upload */
  isUploadingAudio: boolean
  audioUploadProgress: number
  audioAbortController?: AbortController
  audioHasError: boolean
}

interface UploadState {
  uploads: Map<string, Upload>
  isRunningAI: boolean
  audioConversionQueue: Set<string>
}

interface UploadContextType extends UploadState {
  startUpload: (id: string) => Promise<void>
  startAudioUpload: (id: string) => Promise<void>
  add: (files: File[]) => void
  clear: () => void
  remove: (id: string) => Promise<void>
  updateDuration: (id: string, duration: number) => Promise<void>
  generateAITitles: () => Promise<void>
  /**
   * Return `true` if there is any upload with `pending` or `error` status.
   */
  isThereAnyPendingUpload: boolean
  isUploadsEmpty: boolean
}

export enum ActionTypes {
  UPLOAD,

  REMOVE_UPLOAD_REQUEST,
  REMOVE_UPLOAD_SUCCESS,

  START_UPLOAD,
  UPDATE_UPLOAD_PROGRESS,
  UPLOAD_ERROR,

  UPDATE_TITLE,
  UPDATE_DURATION,

  START_CONVERSION,
  END_CONVERSION,
  UPDATE_CONVERSION_PROGRESS,
  CONVERSION_ERROR,

  START_AUDIO_UPLOAD,
  UPDATE_AUDIO_UPLOAD_PROGRESS,
  UPLOAD_AUDIO_ERROR,

  RUN_AI_REQUEST,
  RUN_AI_SUCCESS,
}

interface Action {
  type: ActionTypes
  payload?: any
}

export const UploadsContext = createContext({} as UploadContextType)

export function UploadsProvider({ children }: { children: ReactNode }) {
  const [{ uploads, isRunningAI, audioConversionQueue }, dispatch] = useReducer(
    (state: UploadState, action: Action) => {
      return produce(state, (draft) => {
        switch (action.type) {
          case ActionTypes.UPLOAD: {
            const files = action.payload.files as File[]

            files.forEach((file) => {
              const videoId = crypto.randomUUID()

              draft.uploads.set(videoId, {
                file,
                previewURL: URL.createObjectURL(file),
                isUploading: false,
                uploadProgress: 0,
                isConvertingAudio: false,
                isUploadingAudio: false,
                audioProgress: 0,
                audioUploadProgress: 0,
                isRemoving: false,
                hasError: false,
                audioHasError: false,
              })

              draft.audioConversionQueue.add(videoId)
            })

            break
          }
          case ActionTypes.START_UPLOAD: {
            const id = action.payload.id as string
            const abortController = action.payload
              .abortController as AbortController

            const videoToBeUpdated = draft.uploads.get(id)

            if (!videoToBeUpdated) {
              return
            }

            draft.uploads.set(id, {
              ...videoToBeUpdated,
              isUploading: true,
              uploadProgress: 0,
              hasError: false,
              abortController,
            })

            break
          }
          case ActionTypes.REMOVE_UPLOAD_REQUEST: {
            const id = action.payload.id as string

            const videoToBeUpdated = draft.uploads.get(id)

            if (!videoToBeUpdated) {
              return
            }

            draft.audioConversionQueue.delete(id)

            draft.uploads.set(id, {
              ...videoToBeUpdated,
              isRemoving: true,
            })

            break
          }
          case ActionTypes.REMOVE_UPLOAD_SUCCESS: {
            const id = action.payload.id as string

            draft.uploads.delete(id)

            break
          }
          case ActionTypes.UPDATE_UPLOAD_PROGRESS: {
            const id = action.payload.id as string
            const progress = action.payload.progress as number

            const videoToBeUpdated = draft.uploads.get(id)

            if (!videoToBeUpdated) {
              return
            }

            draft.uploads.set(id, {
              ...videoToBeUpdated,
              uploadProgress: progress,
              isUploading: progress < 100,
            })

            break
          }
          case ActionTypes.UPDATE_DURATION: {
            const id = action.payload.id as string
            const duration = action.payload.duration as number

            const videoToBeUpdated = draft.uploads.get(id)

            if (!videoToBeUpdated) {
              return
            }

            draft.uploads.set(id, {
              ...videoToBeUpdated,
              duration,
            })

            break
          }
          case ActionTypes.UPLOAD_ERROR: {
            const id = action.payload.id as string

            const videoToBeUpdated = draft.uploads.get(id)

            if (!videoToBeUpdated) {
              return
            }

            draft.uploads.set(id, {
              ...videoToBeUpdated,
              isUploading: false,
              hasError: true,
            })

            break
          }
          case ActionTypes.UPDATE_TITLE: {
            const id = action.payload.id as string
            const title = action.payload.title as string

            const videoToBeUpdated = draft.uploads.get(id)

            if (!videoToBeUpdated) {
              return
            }

            draft.uploads.set(id, {
              ...videoToBeUpdated,
              title,
            })

            break
          }
          case ActionTypes.RUN_AI_REQUEST: {
            draft.isRunningAI = true
            break
          }
          case ActionTypes.RUN_AI_SUCCESS: {
            draft.isRunningAI = false
            break
          }
          case ActionTypes.START_CONVERSION: {
            const id = action.payload.id as string

            const videoToBeUpdated = draft.uploads.get(id)

            if (!videoToBeUpdated) {
              return
            }

            draft.uploads.set(id, {
              ...videoToBeUpdated,
              isConvertingAudio: true,
              audioProgress: 0,
              hasError: false,
            })

            break
          }
          case ActionTypes.END_CONVERSION: {
            const id = action.payload.id as string
            const audioFile = action.payload.audioFile as File

            const videoToBeUpdated = draft.uploads.get(id)

            if (!videoToBeUpdated) {
              return
            }

            draft.audioConversionQueue.delete(id)

            draft.uploads.set(id, {
              ...videoToBeUpdated,
              isConvertingAudio: false,
              audioFile,
            })

            break
          }
          case ActionTypes.UPDATE_CONVERSION_PROGRESS: {
            const id = action.payload.id as string
            const progress = action.payload.progress as number

            const videoToBeUpdated = draft.uploads.get(id)

            if (!videoToBeUpdated) {
              return
            }

            const progressDiff = progress - videoToBeUpdated.audioProgress

            /**
             * FFMpeg has a bug that it sometimes report the progress from
             * another video causing the progress bar to jump to full so we
             * check if the difference is to big to avoid the glitch.
             */
            if (progressDiff > 50) {
              break
            }

            draft.uploads.set(id, {
              ...videoToBeUpdated,
              audioProgress: progress,
            })

            break
          }
          case ActionTypes.START_AUDIO_UPLOAD: {
            const id = action.payload.id as string
            const abortController = action.payload
              .abortController as AbortController

            const videoToBeUpdated = draft.uploads.get(id)

            if (!videoToBeUpdated) {
              return
            }

            draft.uploads.set(id, {
              ...videoToBeUpdated,
              isUploadingAudio: true,
              audioUploadProgress: 0,
              audioHasError: false,
              audioAbortController: abortController,
            })

            break
          }
          case ActionTypes.UPDATE_AUDIO_UPLOAD_PROGRESS: {
            const id = action.payload.id as string
            const progress = action.payload.progress as number

            const videoToBeUpdated = draft.uploads.get(id)

            if (!videoToBeUpdated) {
              return
            }

            draft.uploads.set(id, {
              ...videoToBeUpdated,
              audioUploadProgress: progress,
              isUploadingAudio: progress < 100,
            })

            break
          }
          case ActionTypes.UPLOAD_AUDIO_ERROR: {
            const id = action.payload.id as string

            const videoToBeUpdated = draft.uploads.get(id)

            if (!videoToBeUpdated) {
              return
            }

            draft.uploads.set(id, {
              ...videoToBeUpdated,
              isUploadingAudio: false,
              audioHasError: true,
            })

            break
          }
        }
      })
    },
    {
      uploads: new Map(),
      audioConversionQueue: new Set<string>(),
      isRunningAI: false,
    },
  )

  const { setValue } = useFormContext<UploadsFormSchema>()

  const { remove: removeFromForm } = useFieldArray<UploadsFormSchema>({
    name: 'files',
  })

  const add = useCallback((files: File[]) => {
    dispatch({ type: ActionTypes.UPLOAD, payload: { files } })
  }, [])

  const remove = useCallback(
    async (id: string) => {
      dispatch({
        type: ActionTypes.REMOVE_UPLOAD_REQUEST,
        payload: { id },
      })

      const upload = uploads.get(id)
      const isStillUploading = upload?.isUploading
      const hasFinishedUploading = upload?.uploadProgress === 100
      const hasFinishedAudioUploading = upload?.audioUploadProgress === 100

      if (upload?.isConvertingAudio) {
        ffmpeg.exit()
      }

      if (upload?.isUploadingAudio) {
        upload.audioAbortController?.abort()
      } else if (hasFinishedAudioUploading) {
        await axios.delete(`/api/uploads/${id}/audio`)
      }

      if (isStillUploading) {
        upload.abortController?.abort()
      } else if (hasFinishedUploading) {
        await axios.delete(`/api/uploads/${id}`)
      }

      const uploadIndex = Array.from(uploads.keys()).findIndex(
        (uploadId) => uploadId === id,
      )

      removeFromForm(uploadIndex)

      dispatch({
        type: ActionTypes.REMOVE_UPLOAD_SUCCESS,
        payload: { id },
      })
    },
    [removeFromForm, uploads],
  )

  const clear = useCallback(() => {
    Array.from(uploads.keys()).forEach((id) => {
      remove(id)
    })
  }, [remove, uploads])

  const generateAITitles = useCallback(async () => {
    dispatch({ type: ActionTypes.RUN_AI_REQUEST })

    await Promise.allSettled(
      Array.from(uploads.entries()).map(async ([id, upload], index) => {
        if (upload.title !== undefined) {
          return
        }

        const fileName = upload.file.name

        const response = await axios.get('/api/ai/generate/title', {
          params: {
            slug: fileName,
          },
        })

        const { title } = response.data

        setValue(`files.${index}.title`, title, {
          shouldValidate: true,
        })

        dispatch({
          type: ActionTypes.UPDATE_TITLE,
          payload: {
            id,
            title,
          },
        })
      }),
    )

    dispatch({ type: ActionTypes.RUN_AI_SUCCESS })
  }, [setValue, uploads])

  const startUpload = useCallback(
    async (id: string) => {
      const upload = uploads.get(id)

      if (!upload) {
        return
      }

      const abortController = new AbortController()

      dispatch({
        type: ActionTypes.START_UPLOAD,
        payload: { id, abortController },
      })

      try {
        const response = await axios.post<{ url: string }>('/api/uploads', {
          videoId: id,
        })

        const uploadURL = response.data.url

        await axios.put(uploadURL, upload.file, {
          signal: abortController.signal,
          headers: {
            'Content-Type': upload.file.type,
          },
          onUploadProgress(progressEvent) {
            const progress = progressEvent.progress
              ? Math.round(progressEvent.progress * 100)
              : 0

            dispatch({
              type: ActionTypes.UPDATE_UPLOAD_PROGRESS,
              payload: { id, progress },
            })
          },
        })
      } catch {
        dispatch({
          type: ActionTypes.UPLOAD_ERROR,
          payload: { id },
        })
      }
    },
    [uploads],
  )

  const startAudioUpload = useCallback(
    async (id: string) => {
      const upload = uploads.get(id)

      if (!upload) {
        return
      }

      const abortController = new AbortController()

      dispatch({
        type: ActionTypes.START_AUDIO_UPLOAD,
        payload: { id, abortController },
      })

      try {
        const response = await axios.post<{ url: string }>(
          '/api/uploads/audio',
          {
            videoId: id,
          },
        )

        const uploadURL = response.data.url

        await axios.put(uploadURL, upload.audioFile, {
          signal: abortController.signal,
          headers: {
            'Content-Type': upload.audioFile?.type,
          },
          onUploadProgress(progressEvent) {
            const progress = progressEvent.progress
              ? Math.round(progressEvent.progress * 100)
              : 0

            dispatch({
              type: ActionTypes.UPDATE_AUDIO_UPLOAD_PROGRESS,
              payload: { id, progress },
            })
          },
        })
      } catch {
        dispatch({
          type: ActionTypes.UPLOAD_AUDIO_ERROR,
          payload: { id },
        })
      }
    },
    [uploads],
  )

  const convertNextQueueItemToAudio = useCallback(async () => {
    const [nextItemId] = audioConversionQueue

    const upload = uploads.get(nextItemId)

    if (!upload) {
      return
    }

    dispatch({
      type: ActionTypes.START_CONVERSION,
      payload: { id: nextItemId },
    })

    const file = upload.file

    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load()
    }

    ffmpeg.FS('writeFile', file.name, await fetchFile(file))

    ffmpeg.setProgress(({ ratio }) => {
      const progress = Math.round(ratio * 100)

      dispatch({
        type: ActionTypes.UPDATE_CONVERSION_PROGRESS,
        payload: { id: nextItemId, progress },
      })
    })

    await ffmpeg.run(
      '-i',
      file.name,
      '-map',
      '0:a',
      '-b:a',
      '20k',
      '-acodec',
      'libmp3lame',
      `${nextItemId}.mp3`,
    )

    const data = ffmpeg.FS('readFile', `${nextItemId}.mp3`)

    const audioFileBlob = new Blob([data.buffer], { type: 'audio/mpeg' })

    const audioFile = new File([audioFileBlob], `${nextItemId}.mp3`, {
      type: 'audio/mpeg',
    })

    dispatch({
      type: ActionTypes.END_CONVERSION,
      payload: { id: nextItemId, audioFile },
    })
  }, [uploads, audioConversionQueue])

  const updateDuration = useCallback(async (id: string, duration: number) => {
    dispatch({
      type: ActionTypes.UPDATE_DURATION,
      payload: { id, duration },
    })
  }, [])

  useEffect(() => {
    Array.from(uploads.entries())
      .filter(([, upload]) => {
        return (
          upload.uploadProgress === 0 && !upload.isUploading && !upload.hasError
        )
      })
      .forEach(([id]) => {
        startUpload(id)
      })
  }, [uploads, startUpload])

  useEffect(() => {
    Array.from(uploads.entries())
      .filter(([, upload]) => {
        return (
          upload.audioUploadProgress === 0 &&
          !upload.isUploadingAudio &&
          !upload.audioHasError &&
          upload.audioFile
        )
      })
      .forEach(([id]) => {
        console.log('oi', id)
        startAudioUpload(id)
      })
  }, [uploads, startAudioUpload])

  useEffect(() => {
    const isThereAnyConversionInProgress = Array.from(uploads.values()).some(
      (upload) => {
        return upload.isConvertingAudio
      },
    )

    if (audioConversionQueue.size > 0 && !isThereAnyConversionInProgress) {
      convertNextQueueItemToAudio()
    }
  }, [audioConversionQueue, convertNextQueueItemToAudio, uploads])

  useEffect(() => {
    const { amountOfItems, percentageSum } = Array.from(
      uploads.values(),
    ).reduce(
      (acc, upload) => {
        return {
          amountOfItems: acc.amountOfItems + 1,
          percentageSum:
            acc.percentageSum +
            (upload.uploadProgress +
              upload.audioProgress +
              upload.audioUploadProgress) /
              3,
        }
      },
      {
        amountOfItems: 0,
        percentageSum: 0,
      },
    )

    if (amountOfItems) {
      const percentage = amountOfItems
        ? Math.round(percentageSum / amountOfItems)
        : 0
      document.title = `Upload (${percentage}%) | Jupiter`
    }
  }, [uploads])

  const isThereAnyPendingUpload = useMemo(() => {
    return Array.from(uploads.entries()).some(([, upload]) => {
      return (
        upload.isUploading ||
        upload.hasError ||
        upload.isConvertingAudio ||
        upload.isUploadingAudio ||
        upload.audioHasError
      )
    })
  }, [uploads])

  const isUploadsEmpty = useMemo(() => {
    return uploads.size === 0
  }, [uploads])

  return (
    <UploadsContext.Provider
      value={{
        uploads,
        isRunningAI,
        startUpload,
        startAudioUpload,
        add,
        clear,
        remove,
        generateAITitles,
        updateDuration,
        isThereAnyPendingUpload,
        isUploadsEmpty,
        audioConversionQueue,
      }}
    >
      {children}
    </UploadsContext.Provider>
  )
}

export const useUploads = () => useContext(UploadsContext)
