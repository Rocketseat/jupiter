import { BookText, Code2 } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'

import { WebhookUrlInput } from './webhook-url-input'

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

          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Suspense fallback={<Skeleton className="h-10 w-full" />}>
              <WebhookUrlInput />
            </Suspense>
            <p className="text-[0.8rem] text-muted-foreground">
              Each organization can have{' '}
              <span className="font-semibold">one webhook URL</span>.
            </p>
          </div>

          <div className="space-x-3">
            <Button size="sm" variant="outline" asChild>
              <Link href="/settings/developers/logs" prefetch={false}>
                <Code2 className="mr-2 size-4" />
                Webhook logs
              </Link>
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <BookText className="mr-2 size-4" />
                  Documentation
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Webhook events</DialogTitle>
                  <DialogDescription>
                    Listen to events that happen inside Nivo in your
                    application.
                  </DialogDescription>
                </DialogHeader>

                <div className="max-h-[400px]">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>
                        <code className="rounded-md bg-accent px-1.5 py-0.5 text-xs text-accent-foreground">
                          upload.created
                        </code>
                      </AccordionTrigger>
                      <AccordionContent>
                        <pre className="whitespace-pre-wrap rounded bg-accent p-4 text-sm text-accent-foreground">
                          {`{
  "event": "upload.created",
  "payload": {
    "id": "5B02C6A6-ECC3-48F6-A7FE-0B70434A4E73",
    "title": "Building a React application from scratch",
    "duration": 120,
    "description": null,
    "tags": ["react", "ignite"],
  }
}`}
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>
                        <code className="rounded-md bg-accent px-1.5 py-0.5 text-xs text-accent-foreground">
                          tag.created
                        </code>
                      </AccordionTrigger>
                      <AccordionContent>
                        Yes. It comes with default styles that matches the other
                        components&apos; aesthetic.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>
                        <code className="rounded-md bg-accent px-1.5 py-0.5 text-xs text-accent-foreground">
                          upload.transcription.created
                        </code>
                      </AccordionTrigger>
                      <AccordionContent>
                        Yes. It&apos;s animated by default, but you can disable
                        it if you prefer.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
