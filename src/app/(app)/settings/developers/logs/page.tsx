import { ChevronDown, Code2, X } from 'lucide-react'
import { Metadata } from 'next'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { WebhookLogsFilters } from './webhook-logs-filters'

export const metadata: Metadata = {
  title: 'Webhook logs',
}

export default async function WebhookLogsPage() {
  return (
    <div className="space-y-4">
      <WebhookLogsFilters />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Execution ID</TableHead>
              <TableHead style={{ width: 160 }}>HTTP Status</TableHead>
              <TableHead style={{ width: 160 }}>Event</TableHead>
              <TableHead style={{ width: 160 }}>Executed At</TableHead>
              <TableHead style={{ width: 160 }}>Duration</TableHead>
              <TableHead style={{ width: 140 }}></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-mono text-xs">
                clsd5tjb3000008kzglvfeet6
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-teal-400" />
                  <span>204</span>
                </div>
              </TableCell>
              <TableCell className="font-mono">
                <code className="rounded-md bg-accent px-2 py-1.5 text-xs text-accent-foreground">
                  video.created
                </code>
              </TableCell>
              <TableCell className="text-muted-foreground">
                2 minutes ago
              </TableCell>
              <TableCell className="text-muted-foreground">6 seconds</TableCell>
              <TableCell>
                <Button size="xs" variant="secondary">
                  View details <ChevronDown className="ml-2 size-3" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
