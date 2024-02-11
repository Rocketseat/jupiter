'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { webhookEventTrigger } from '@nivo/drizzle/schema'
import { Loader2, Plus } from 'lucide-react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
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
import { useToast } from '@/components/ui/use-toast'
import { trpc } from '@/lib/trpc/react'

import { WebhookTriggersInput } from './webhook-triggers-input'

export const createWebhookSchema = z.object({
  url: z.string().url({ message: 'Enter a valid URL.' }),
  triggers: z
    .array(webhookEventTrigger)
    .min(1, { message: 'Select at least one event trigger.' }),
})

export type CreateWebhookSchema = z.infer<typeof createWebhookSchema>

export function CreateWebhook() {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const createWebhookForm = useForm<CreateWebhookSchema>({
    resolver: zodResolver(createWebhookSchema),
    defaultValues: {
      triggers: [],
    },
  })

  const { mutateAsync: createWebhook } = trpc.createCompanyWebhook.useMutation()

  async function handleCreateWebhook({ url, triggers }: CreateWebhookSchema) {
    try {
      await createWebhook({
        url,
        triggers,
      })

      createWebhookForm.reset({
        url: '',
        triggers: [],
      })

      utils.getCompanyWebhooks.invalidate()

      toast({
        title: 'Webhook successfully created!',
        description: `Now your endpoint is listening to Nivo events!`,
        variant: 'default',
      })
    } catch {
      toast({
        title: 'Uh oh! Something went wrong.',
        description: `An error ocurred while trying to create the webhook.`,
        variant: 'destructive',
      })
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = createWebhookForm

  console.log(watch('triggers'))

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

        <FormProvider {...createWebhookForm}>
          <form
            onSubmit={handleSubmit(handleCreateWebhook)}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="url">Endpoint URL</Label>
              <Input id="url" placeholder="https://" {...register('url')} />
              {errors.url && (
                <p className="text-sm font-medium text-red-500 dark:text-red-400">
                  {errors.url.message}
                </p>
              )}
            </div>

            <WebhookTriggersInput />

            <div className="flex items-center justify-end gap-2">
              <DialogTrigger asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogTrigger>
              <Button disabled={isSubmitting} className="w-20">
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Save'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
