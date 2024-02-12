'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { webhookEventTrigger } from '@nivo/drizzle/schema'
import { RouterOutput } from '@nivo/trpc'
import { Loader2 } from 'lucide-react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { DialogTrigger } from '@/components/ui/dialog'
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

interface WebhookFormProps {
  webhookToEdit?: RouterOutput['getCompanyWebhooks']['companyWebhooks'][number]
}

export function WebhookForm({ webhookToEdit }: WebhookFormProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const webhookForm = useForm<CreateWebhookSchema>({
    resolver: zodResolver(createWebhookSchema),
    defaultValues: {
      url: webhookToEdit?.url ?? '',
      triggers: webhookToEdit?.triggers ?? [],
    },
  })

  const { mutateAsync: createWebhook } = trpc.createCompanyWebhook.useMutation()
  const { mutateAsync: updateWebhook } = trpc.updateCompanyWebhook.useMutation()

  async function handleSaveWebhook({ url, triggers }: CreateWebhookSchema) {
    try {
      const isEditingWebhook = webhookToEdit !== undefined

      if (isEditingWebhook) {
        await updateWebhook({
          companyWebhookId: webhookToEdit.id,
          url,
          triggers,
        })
      } else {
        await createWebhook({
          url,
          triggers,
        })
      }

      if (!isEditingWebhook) {
        webhookForm.reset({
          url: '',
          triggers: [],
        })
      }

      utils.getCompanyWebhooks.invalidate()

      toast({
        title: 'Webhook successfully saved!',
        description: `Now your endpoint is listening to Nivo events!`,
        variant: 'default',
      })
    } catch {
      toast({
        title: 'Uh oh! Something went wrong.',
        description: `An error ocurred while trying to save the webhook.`,
        variant: 'destructive',
      })
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = webhookForm

  return (
    <FormProvider {...webhookForm}>
      <form onSubmit={handleSubmit(handleSaveWebhook)} className="space-y-6">
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
  )
}
