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
import { useFieldArray, useForm, useFormContext } from 'react-hook-form'
import { UploadsFormSchema } from '@/app/upload/upload-list'

enableMapSet()

export interface Upload {
  file: File
  title?: string
  previewURL: string
  isUploading: boolean
  isRemoving: boolean
  uploadProgress: number
  duration?: number
  hasError: boolean
  abortController?: AbortController
}

interface UploadState {
  uploads: Map<string, Upload>
  isRunningAI: boolean
}

interface UploadContextType extends UploadState {
  startUpload: (id: string) => Promise<void>
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
  UPLOAD_ERROR,
  UPDATE_TITLE,
  UPDATE_DURATION,
  UPDATE_PROGRESS,

  RUN_AI_REQUEST,
  RUN_AI_SUCCESS,
}

interface Action {
  type: ActionTypes
  payload?: any
}

export const UploadsContext = createContext({} as UploadContextType)

export function UploadsProvider({ children }: { children: ReactNode }) {
  const [{ uploads, isRunningAI }, dispatch] = useReducer(
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
                uploadProgress: 0,
                isUploading: false,
                isRemoving: false,
                hasError: false,
              })
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
          case ActionTypes.UPDATE_PROGRESS: {
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
        }
      })
    },
    {
      uploads: new Map(),
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
              type: ActionTypes.UPDATE_PROGRESS,
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
      .forEach(async ([id]) => {
        dispatch({
          type: ActionTypes.UPLOAD_ERROR,
          payload: { id },
        })

        startUpload(id)
      })
  }, [uploads, startUpload])

  const isThereAnyPendingUpload = useMemo(() => {
    return Array.from(uploads.entries()).some(([, upload]) => {
      return upload.isUploading || upload.hasError
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
        add,
        clear,
        remove,
        generateAITitles,
        updateDuration,
        isThereAnyPendingUpload,
        isUploadsEmpty,
      }}
    >
      {children}
    </UploadsContext.Provider>
  )
}

export const useUploads = () => useContext(UploadsContext)
