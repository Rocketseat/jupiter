'use client'

import { RouterOutput } from '@nivo/trpc'
import { Pencil2Icon } from '@radix-ui/react-icons'
import { Loader2, MoreHorizontal, X } from 'lucide-react'
import { useState } from 'react'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import { trpc } from '@/lib/trpc/react'

import { WebhookForm } from './webhook-form'

interface WebhookListItemActionsProps {
  webhook: RouterOutput['getCompanyWebhooks']['companyWebhooks'][number]
}

export function WebhookListItemActions({
  webhook,
}: WebhookListItemActionsProps) {
  const { toast } = useToast()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const utils = trpc.useUtils()

  const { mutateAsync: deleteCompanyWebhook, isPending: isDeletingWebhook } =
    trpc.deleteCompanyWebhook.useMutation({
      onSuccess() {
        utils.getCompanyWebhooks.invalidate()
      },
    })

  async function handleDeleteWebhook() {
    try {
      await deleteCompanyWebhook({
        companyWebhookId: webhook.id,
      })

      setIsDeleteDialogOpen(false)
    } catch {
      toast({
        title: 'Uh oh! Something went wrong.',
        description: `An error ocurred while trying to delete the webhook.`,
        variant: 'destructive',
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer" asChild>
        <Button variant="outline" size="xs">
          <MoreHorizontal className="size-3" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <Dialog>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Pencil2Icon className="mr-2 size-4" />
              Edit
            </DropdownMenuItem>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Listen to Nivo events</DialogTitle>
              <DialogDescription>
                Set up your webhook endpoint to receive live events from Nivo.
              </DialogDescription>
            </DialogHeader>

            <WebhookForm webhookToEdit={webhook} />
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              disabled={isDeletingWebhook}
              onSelect={(e) => e.preventDefault()}
            >
              <X className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  This action can&apos;t be undone and the webhook will be
                  permanently deleted from the server.
                </p>
                <p>This webhook is listening to the following events:</p>
                <ol className="list-disc space-y-2 pl-4">
                  {webhook.triggers.map((trigger) => {
                    return (
                      <li key={trigger}>
                        <Badge className="px-1" variant="secondary">
                          {trigger}
                        </Badge>
                      </li>
                    )
                  })}
                </ol>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                disabled={isDeletingWebhook}
                variant="destructive"
                className="w-20"
                onClick={handleDeleteWebhook}
              >
                {isDeletingWebhook ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  'Delete'
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
