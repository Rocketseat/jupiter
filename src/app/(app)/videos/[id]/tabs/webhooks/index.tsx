import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  CheckCircledIcon,
  CrossCircledIcon,
  DotsHorizontalIcon,
  EyeOpenIcon,
} from '@radix-ui/react-icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { MetadataTooltip } from './metadata-tooltip'
import { Loader2 } from 'lucide-react'

dayjs.extend(relativeTime)

export interface WebhooksProps {
  videoId: string
}

export function Webhooks({ videoId }: WebhooksProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead style={{ width: 300 }}>
              <div className="flex items-center gap-2">
                <span>Webhook</span>
              </div>
            </TableHead>
            <TableHead style={{ width: 140 }}>Status</TableHead>
            <TableHead style={{ width: 120 }}>Executed At</TableHead>
            <TableHead style={{ width: 120 }}>Duration</TableHead>
            <TableHead style={{ width: 120 }}>Attempts</TableHead>
            <TableHead style={{ width: 200 }}>
              <div className="flex items-center gap-2">
                <span>Metadata</span>
                <MetadataTooltip />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium">Process video</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2 font-medium text-emerald-500">
                <CheckCircledIcon className="h-4 w-4" />
                <span>Success</span>
              </div>
            </TableCell>
            <TableCell>
              <time
                title={dayjs().subtract(1, 'h').toDate().toLocaleString()}
                className="text-muted-foreground"
              >
                {dayjs().subtract(1, 'h').fromNow()}
              </time>
            </TableCell>
            <TableCell>32 seconds</TableCell>
            <TableCell>1 attempt(s)</TableCell>
            <TableCell>
              <Textarea
                readOnly
                className="min-h-[56px] font-mono"
                defaultValue={`{"videoId": "${videoId}"}`}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium">Create Transcription</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2 font-medium text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Running</span>
              </div>
            </TableCell>
            <TableCell>
              <time
                title={dayjs().subtract(1, 'h').toDate().toLocaleString()}
                className="text-muted-foreground"
              >
                {dayjs().subtract(1, 'minute').fromNow()}
              </time>
            </TableCell>
            <TableCell>
              <DotsHorizontalIcon className="h-4 w-4 text-muted-foreground" />
            </TableCell>
            <TableCell>1 attempt(s)</TableCell>
            <TableCell>
              <Textarea
                readOnly
                className="min-h-[56px] font-mono"
                defaultValue={`{"videoId": "${videoId}"}`}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium">Upload to External Provider</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2 font-medium text-red-500 dark:text-red-400">
                <CrossCircledIcon className="h-4 w-4" />
                <span>
                  Error{' '}
                  <Button
                    variant="link"
                    className="inline p-0 text-inherit dark:text-inherit"
                  >
                    (Retry)
                  </Button>
                </span>
              </div>
            </TableCell>
            <TableCell>
              <time
                title={dayjs().subtract(1, 'h').toDate().toLocaleString()}
                className="text-muted-foreground"
              >
                {dayjs().subtract(1, 'h').fromNow()}
              </time>
            </TableCell>
            <TableCell>59 seconds</TableCell>
            <TableCell>3 attempt(s)</TableCell>
            <TableCell>
              <Textarea
                readOnly
                className="min-h-[56px] font-mono"
                defaultValue={`{"videoId": "${videoId}"}`}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
