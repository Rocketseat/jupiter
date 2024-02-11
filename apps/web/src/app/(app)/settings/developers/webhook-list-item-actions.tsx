'use client'

import { WebhookEventTrigger } from '@nivo/drizzle/schema'
import { Pencil2Icon } from '@radix-ui/react-icons'
import { Loader2, MoreHorizontal, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import { trpc } from '@/lib/trpc/react'

interface WebhookListItemActionsProps {
  companyWebhookId: string
  triggers: WebhookEventTrigger[]
}

export function WebhookListItemActions({
  companyWebhookId,
  triggers,
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
        companyWebhookId,
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
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer" asChild>
          <Button variant="outline" size="icon">
            <MoreHorizontal className="size-3" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link
              href={`/settings/developers/webhooks/${companyWebhookId}`}
              className="w-full"
            >
              <Pencil2Icon className="mr-2 size-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem disabled={isDeletingWebhook} asChild>
            <button
              className="w-full"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <X className="mr-2 size-4" />
              Delete
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
              {triggers.map((trigger) => {
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
  )
}
