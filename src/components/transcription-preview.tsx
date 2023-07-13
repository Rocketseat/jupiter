'use client'

import { useState } from 'react'
import axios from 'axios'
import { Link1Icon } from '@radix-ui/react-icons'
import { useQuery } from '@tanstack/react-query'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Button } from './ui/button'
import { Edit2 } from 'lucide-react'
import Link from 'next/link'

export interface TranscriptionPreviewProps {
  videoId: string
}

export function TranscriptionPreview({ videoId }: TranscriptionPreviewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: transcription, isLoading: isLoadingTranscription } = useQuery(
    ['transcription', videoId],
    async () => {
      const response = await axios.get(`/api/videos/${videoId}/transcription`)

      return response.data.transcription
    },
    {
      enabled: isDialogOpen,
    },
  )

  return (
    <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center font-medium text-violet-500 hover:text-violet-600">
          <Link1Icon className="mr-2 h-4 w-4" />
          <span>View transcription</span>
        </button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Transcrição</DialogTitle>
        </DialogHeader>
        {isLoadingTranscription ? (
          <div className="space-y-2">
            {Array.from({ length: 20 }).map((_, i) => {
              return <Skeleton key={i} className="h-3 w-full" />
            })}
          </div>
        ) : (
          <>
            <Textarea
              lang="pt"
              className="h-[480px] hyphens-auto text-sm leading-relaxed"
              value={transcription.text}
              readOnly
              autoFocus
            />
            <Button variant="secondary" asChild>
              <Link href={`/transcriptions/${transcription.id}`}>
                <Edit2 className="mr-2 h-3 w-3" />
                Review
              </Link>
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
