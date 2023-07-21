import axios from 'axios'
import { useState } from 'react'

function useGenerateAITitles() {
  const [isLoading, setIsLoading] = useState(false)

  async function run(titles: string[]) {
    setIsLoading(true)

    await Promise.allSettled(
      titles.map(async (title) => {
        const response = await axios.get('/api/ai/generate/title', {
          params: {
            slug: title,
          },
        })

        return response.data
      }),
    )

    setIsLoading(false)
  }

  return {
    isLoading,
  }
}

// const generateAITitles = useCallback(async () => {
//   dispatch({ type: ActionTypes.RUN_AI_REQUEST })

//   await Promise.allSettled(
//     Array.from(uploads.entries()).map(async ([id, upload], index) => {
//       if (upload.title !== undefined) {
//         return
//       }

//       const fileName = upload.file.name

//       const { title } = response.data

//       setValue(`files.${index}.title`, title, {
//         shouldValidate: true,
//       })

//       dispatch({
//         type: ActionTypes.UPDATE_TITLE,
//         payload: {
//           id,
//           title,
//         },
//       })
//     }),
//   )

//   dispatch({ type: ActionTypes.RUN_AI_SUCCESS })
// }, [setValue, uploads])
