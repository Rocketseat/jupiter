import { SymbolIcon } from '@radix-ui/react-icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Cable, CopyIcon, ReceiptText } from 'lucide-react'
import { Metadata } from 'next'
import { unstable_noStore } from 'next/cache'
import { headers } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { z } from 'zod'

import { CopyButton } from '@/components/copy-button'
import { TranscriptionPreview } from '@/components/transcription-preview'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { UploadItemActions } from '@/components/upload-item-actions'
import { api } from '@/lib/eden'
import { formatBytes } from '@/utils/format-bytes'
import { formatSecondsToMinutes } from '@/utils/format-seconds-to-minutes'

import { UploadsPagination } from './uploads-pagination'

dayjs.extend(relativeTime)

export const metadata: Metadata = {
  title: 'Uploads',
}

const uploadsPageSearchParams = z.object({
  pageIndex: z.coerce.number().default(0),
  pageSize: z.coerce.number().default(10),
  tagsFilter: z
    .union([z.array(z.string()), z.string()])
    .transform((value) => (Array.isArray(value) ? value : [value]))
    .optional(),
  titleFilter: z.string().default(''),
})

type UploadsPageSearchParams = z.infer<typeof uploadsPageSearchParams>

export default async function UploadsPage({
  searchParams,
}: {
  searchParams: UploadsPageSearchParams
}) {
  unstable_noStore()

  const query = uploadsPageSearchParams.parse(searchParams)

  const { data, error } = await api.videos.get({
    $query: query,
    $fetch: {
      headers: Object.fromEntries(headers().entries()),
    },
  })

  if (error) {
    throw error
  }

  const { videos, pageCount } = data

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Video</TableHead>
              <TableHead style={{ width: 120 }}>Duration</TableHead>
              <TableHead style={{ width: 140 }}>Size</TableHead>
              <TableHead style={{ width: 200 }}>
                <div className="flex items-center gap-2">
                  <ReceiptText className="size-4" />
                  Transcription
                </div>
              </TableHead>
              <TableHead style={{ width: 200 }}>
                <div className="flex items-center gap-2">
                  <Cable className="size-4" />
                  External ID
                </div>
              </TableHead>
              <TableHead style={{ width: 200 }} />
              <TableHead style={{ width: 64 }} />
            </TableRow>
          </TableHeader>

          <TableBody>
            {videos && videos.length > 0 ? (
              videos.map((video) => {
                return (
                  <TableRow
                    key={video.id}
                    className="has-[a:focus-visible]:bg-muted"
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <Link
                          href={`/videos/${video.id}`}
                          prefetch={false}
                          className="font-medium text-primary outline-none hover:underline"
                        >
                          {video.title}
                        </Link>

                        <span className="text-xs text-muted-foreground">
                          {video.id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatSecondsToMinutes(video.duration)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatBytes(video.sizeInBytes)}
                    </TableCell>
                    <TableCell>
                      {video.transcription ? (
                        <TranscriptionPreview videoId={video.id} />
                      ) : (
                        <div className="flex items-center font-medium">
                          <SymbolIcon className="mr-2 h-3 w-3 animate-spin" />

                          <span className="text-muted-foreground">
                            Processing
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {video.externalProviderId ? (
                        <div className="flex items-center gap-2 font-medium">
                          <span className="truncate text-xs text-muted-foreground">
                            {video.externalProviderId}
                          </span>
                          <CopyButton
                            size="xs"
                            variant="outline"
                            textToCopy={video.externalProviderId}
                          >
                            <CopyIcon className="mr-1 h-3 w-3" />
                            Copy
                          </CopyButton>
                        </div>
                      ) : (
                        <div className="flex items-center font-medium">
                          <SymbolIcon className="mr-2 h-3 w-3 animate-spin" />
                          <span className="text-muted-foreground">
                            Processing
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
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
                                <TooltipContent>
                                  {video.author?.name}
                                </TooltipContent>
                              )}
                            </div>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <UploadItemActions videoId={video.id} />
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Suspense fallback={null}>
        <UploadsPagination
          pageSize={query.pageSize}
          pageIndex={query.pageIndex}
          pageCount={pageCount}
        />
      </Suspense>
    </>
  )
}
