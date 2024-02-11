import { Controller, useFormContext } from 'react-hook-form'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { trpc } from '@/lib/trpc/react'

import { CreateWebhookSchema } from './create-webhook'

export function WebhookTriggersInput() {
  const { data, isLoading } = trpc.getAvailableTriggers.useQuery()

  const {
    control,
    formState: { errors },
  } = useFormContext<CreateWebhookSchema>()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-x-3 gap-y-4">
        {Array.from({ length: 6 }).map((_, i) => {
          return (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-x-3 gap-y-4">
        {data &&
          data.triggers.map(({ trigger, description }) => {
            return (
              <div key={trigger} className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Controller
                    control={control}
                    name="triggers"
                    render={({ field }) => {
                      return (
                        <Checkbox
                          checked={field.value.includes(trigger)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, trigger])
                              : field.onChange(
                                  field.value?.filter(
                                    (value) => value !== trigger,
                                  ),
                                )
                          }}
                        />
                      )
                    }}
                  />
                  <Badge className="px-1" variant="secondary">
                    {trigger}
                  </Badge>
                </Label>
                <p className="text-[0.8rem] leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            )
          })}
      </div>
      {errors.triggers && (
        <p className="text-sm font-medium text-red-500 dark:text-red-400">
          {errors.triggers.message}
        </p>
      )}
    </div>
  )
}
