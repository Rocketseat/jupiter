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
import { serverClient } from '@/lib/trpc/server'

export async function WebhookDocsButton() {
  const { triggers } = await serverClient.getAvailableTriggers()

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
            {triggers.map(({ trigger, description }) => {
              return (
                <AccordionItem value={trigger} key={trigger}>
                  <AccordionTrigger>{trigger}</AccordionTrigger>
                  <AccordionContent>{description}</AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  )
}
