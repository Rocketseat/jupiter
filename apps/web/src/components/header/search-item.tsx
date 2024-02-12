import { dayjs } from '@nivo/dayjs'
import { RouterOutput } from '@nivo/trpc'
import { Loader2, Video } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useTransition } from 'react'

import { CommandItem } from '../ui/command'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

interface SearchItemProps {
  video: RouterOutput['getUploads']['videos'][number]
  onRequestClose: () => void
}

export function SearchItem({ video, onRequestClose }: SearchItemProps) {
  const router = useRouter()
  const [isPendingNavigation, startTransition] = useTransition()
  const lastIsPendingNavigation = useRef<boolean>(false)

  function handleNavigate() {
    startTransition(() => {
      router.push(`/videos/${video.id}`)
    })
  }

  /**
   * Close dialog when navigation ends
   */
  useEffect(() => {
    const hasNavigationTransitionFinished =
      !isPendingNavigation && lastIsPendingNavigation.current

    if (hasNavigationTransitionFinished) {
      onRequestClose()
    }

    lastIsPendingNavigation.current = isPendingNavigation
  }, [isPendingNavigation, onRequestClose])

  return (
    <CommandItem onSelect={handleNavigate} key={video.id} value={video.id}>
      {isPendingNavigation ? (
        <Loader2 className="mr-2 size-3 animate-spin" />
      ) : (
        <Video className="mr-2 size-3" />
      )}

      <span>{video.title}</span>
      <div className="ml-auto flex items-center gap-1 text-muted-foreground">
        <time title={video.createdAt.toLocaleString()}>
          {dayjs(video.createdAt).fromNow()}
        </time>
        {video.author?.image && (
          <Tooltip>
            <div className="flex items-center gap-2">
              <span>by</span>
              <TooltipTrigger asChild>
                <Image
                  src={video.author?.image}
                  className="size-5 rounded-full"
                  width={20}
                  height={20}
                  alt=""
                />
              </TooltipTrigger>
              {video.author?.name && (
                <TooltipContent align="end">
                  {video.author?.name}
                </TooltipContent>
              )}
            </div>
          </Tooltip>
        )}
      </div>
    </CommandItem>
  )
}
