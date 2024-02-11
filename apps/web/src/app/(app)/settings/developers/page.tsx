import { Code2 } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

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
import { Separator } from '@/components/ui/separator'

import { CreateWebhook } from './create-webhook'
import { WebhookDocsButton } from './webhooks-docs-button'
import { WebhooksList } from './webhooks-list'
import WebhooksListLoading from './webhooks-list-loading'

export const metadata: Metadata = {
  title: 'Developers settings',
}

export default async function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Developers</CardTitle>
        <CardDescription>
          Integrate with Nivo using Webhooks or our API.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiUrl">API URL</Label>
            <Input
              name="apiUrl"
              id="apiUrl"
              defaultValue="https://nivo.video/api/v1"
              disabled
            />
            <p className="text-[0.8rem] text-muted-foreground">
              Access our{' '}
              <a href="#" className="underline">
                documentation
              </a>{' '}
              to understand how to use our API.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              name="apiKey"
              id="apiKey"
              defaultValue="69A13303-436F-4345-8DA4-770E6C4861EF"
              disabled
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label asChild>
                  <span>Webhooks</span>
                </Label>
                <p className="text-[0.8rem] text-muted-foreground">
                  Listen to Nivo events in your application.
                </p>
              </div>
              <CreateWebhook />
            </div>
            <Suspense fallback={<WebhooksListLoading />}>
              <WebhooksList />
            </Suspense>
          </div>

          <Separator />

          <div className="space-x-3">
            <Button size="sm" variant="outline" asChild>
              <Link href="/settings/developers/logs" prefetch={false}>
                <Code2 className="mr-2 size-4" />
                Webhook logs
              </Link>
            </Button>

            <WebhookDocsButton />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
