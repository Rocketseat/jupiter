import { BookText } from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function WebhookDocsButton() {
  return (
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
            Listen to events that happen inside Nivo in your application.
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
                Yes. It&apos;s animated by default, but you can disable it if
                you prefer.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  )
}
