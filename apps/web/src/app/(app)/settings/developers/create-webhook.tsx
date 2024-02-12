'use client'

import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { WebhookForm } from './webhook-form'

export function CreateWebhook() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Plus className="mr-2 size-3" />
          Add webhook
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Listen to Nivo events</DialogTitle>
          <DialogDescription>
            Set up your webhook endpoint to receive live events from Nivo.
          </DialogDescription>
        </DialogHeader>

        <WebhookForm />
      </DialogContent>
    </Dialog>
  )
}
