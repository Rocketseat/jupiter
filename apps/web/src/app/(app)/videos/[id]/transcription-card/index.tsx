'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Fragment, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { trpc } from '@/lib/trpc/react'

import { Segment } from './segment'
import { TranscriptionSkeleton } from './transcription-skeleton'

interface TranscriptionCardProps {
  videoId: string
  shouldDisplayVideo: boolean
}

const transcriptionSegmentsFormSchema = z.object({
  segments: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
    }),
  ),
})

type TranscriptionSegmentsFormSchema = z.infer<
  typeof transcriptionSegmentsFormSchema
>

export function TranscriptionCard({
  videoId,
  shouldDisplayVideo,
}: TranscriptionCardProps) {
  const [shouldFollowUserFocus, setShouldFollowUserFocus] = useState(true)

  const { data: videoDownloadData } = trpc.requestMediaDownloadUrl.useQuery({
    videoId,
    media: 'video',
  })

  const { data } = trpc.getUploadTranscription.useQuery(
    {
      videoId,
    },
    {
      refetchInterval(data) {
        const isTranscriptionAlreadyLoaded = !!data

        if (isTranscriptionAlreadyLoaded) {
          return false
        }

        return 15 * 1000 // 15 seconds
      },
      refetchOnWindowFocus: false,
    },
  )

  const videoRef = useRef<HTMLVideoElement>(null)

  const {
    register,
    control,
    formState: { isSubmitting },
  } = useForm<TranscriptionSegmentsFormSchema>({
    resolver: zodResolver(transcriptionSegmentsFormSchema),
  })

  function handleSegmentFocused({ start }: { start: number }) {
    if (videoRef.current && shouldFollowUserFocus) {
      videoRef.current.currentTime = start
      videoRef.current.play()
    }
  }

  return (
    <div className="relative">
      <Card
        data-video-displayed={shouldDisplayVideo}
        className="absolute bottom-0 left-0 right-0 top-0 grid grid-rows-[min-content_1fr_min-content] data-[video-displayed=false]:grid-rows-[1fr_min-content]"
      >
        {shouldDisplayVideo && videoDownloadData?.downloadUrl && (
          <video
            ref={videoRef}
            crossOrigin="anonymous"
            controls
            preload="metadata"
            src={videoDownloadData?.downloadUrl}
            className="aspect-video w-full"
          />
        )}

        <ScrollArea className="h-full w-full">
          {data?.transcription ? (
            <CardContent className="p-4 leading-relaxed">
              {data.transcription.segments.map((segment, index) => {
                return (
                  <Fragment key={segment.id}>
                    <input
                      type="hidden"
                      value={segment.id}
                      {...register(`segments.${index}.id`)}
                    />

                    <Controller
                      name={`segments.${index}.text`}
                      control={control}
                      defaultValue={segment.text}
                      render={({ field }) => {
                        return (
                          <Segment
                            /**
                             * We don't use `field.value` here because it would
                             * cause new rerenders on every input.
                             */
                            value={segment.text}
                            start={Number(segment.start)}
                            onValueChange={field.onChange}
                            onBlur={field.onBlur}
                            onFocus={() =>
                              handleSegmentFocused({
                                start: Number(segment.start),
                              })
                            }
                          />
                        )
                      }}
                    />
                  </Fragment>
                )
              })}
            </CardContent>
          ) : (
            <TranscriptionSkeleton />
          )}
        </ScrollArea>
        <CardFooter className="flex items-center justify-between border-t p-4">
          {shouldDisplayVideo ? (
            <div className="flex items-center space-x-2">
              <Switch
                checked={shouldFollowUserFocus}
                onCheckedChange={setShouldFollowUserFocus}
              />
              <Label htmlFor="airplane-mode">Sync video & clicks</Label>
            </div>
          ) : (
            <div />
          )}

          <Button variant="secondary" className="w-20" disabled>
            {isSubmitting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <span>Save</span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
