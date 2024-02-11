'use client'

import { Globe, KeyRound } from 'lucide-react'
import dynamic from 'next/dynamic'

import { Button } from '@/components/ui/button'
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
import { trpc } from '@/lib/trpc/react'

import { WebhookListItemActions } from './webhook-list-item-actions'

const WebhookEventsChart = dynamic(() => import('./webhook-events-chart'), {
  ssr: false,
})

export async function WebhooksList() {
  const { data } = trpc.getCompanyWebhooks.useQuery(undefined, {
    suspense: true,
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>URL</TableHead>
            <TableHead style={{ width: 120 }}>Triggers</TableHead>
            <TableHead style={{ width: 164 }}>Last 7 days</TableHead>
            <TableHead style={{ width: 96 }} className="text-right">
              Error rate
            </TableHead>
            <TableHead style={{ width: 96 }}>Status</TableHead>
            <TableHead style={{ width: 220 }}></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.companyWebhooks.map((webhook) => {
            return (
              <TableRow key={webhook.id}>
                <TableCell className="py-1">
                  <div className="flex items-center gap-2">
                    <Globe className="size-4 flex-shrink-0" />
                    <span className="truncate whitespace-nowrap font-medium">
                      {webhook.url}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-1">
                  <Tooltip>
                    <TooltipTrigger className="underline">
                      {webhook.triggers.length} event(s)
                    </TooltipTrigger>
                    <TooltipContent className="max-w-96 text-center font-mono text-xs leading-relaxed">
                      {webhook.triggers.join(', ')}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="py-1">
                  <WebhookEventsChart />
                </TableCell>
                <TableCell className="py-1 text-right">3%</TableCell>
                <TableCell className="py-1">
                  <div className="flex items-center gap-2">
                    <span className="size-2 shrink-0 rounded-full bg-teal-400" />
                    <span className="text-xs font-semibold">ACTIVE</span>
                  </div>
                </TableCell>
                <TableCell className="py-1">
                  <div className="flex items-center justify-end">
                    <Button variant="link">
                      <KeyRound className="mr-2 size-3" />
                      Signing key
                    </Button>

                    <WebhookListItemActions
                      companyWebhookId={webhook.id}
                      triggers={webhook.triggers}
                    />
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
