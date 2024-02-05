import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { api } from '@/lib/eden'

import { Badge } from './ui/badge'
import { Button } from './ui/button'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useToast } from './ui/use-toast'

const newTagFormSchema = z.object({
  tag: z
    .string({
      required_error: 'The tag name is required.',
    })
    .regex(/^[a-zA-Z]+(-[a-zA-Z]+)*$/, {
      message: 'Use only letters and hyphens.',
    }),
})

type NewTagFormSchema = z.infer<typeof newTagFormSchema>

interface CreateNewTagDialogProps {
  onRequestClose: () => void
}

export function CreateNewTagDialog({
  onRequestClose,
}: CreateNewTagDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    reset,
  } = useForm<NewTagFormSchema>({
    resolver: zodResolver(newTagFormSchema),
    defaultValues: {
      tag: '',
    },
  })

  const { mutateAsync: createTag } = useMutation({
    mutationFn: async (tag: string) => {
      await api.tags.post({ tag })
    },
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ['tags'],
        exact: true,
      })
    },
  })

  async function handleCreateTag({ tag }: NewTagFormSchema) {
    try {
      await createTag(tag)

      reset()
      onRequestClose()
    } catch (err) {
      toast({
        title: 'Uh oh! Something went wrong.',
        description: `An error ocurred while trying to create the tag. Maybe you're trying to create a duplicated tag.`,
        variant: 'destructive',
      })
    }
  }

  return (
    <DialogContent className="outline-none sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Create new tag</DialogTitle>
        <DialogDescription className="space-y-3">
          <p>
            Remember to avoid creating tags unnecessarily and to keep a maximum
            of{' '}
            <span className="font-semibold text-accent-foreground">
              3 tags per video
            </span>
            .
          </p>
          <p className="flex items-center">
            <AlertCircle className="mr-2 inline h-4 w-4" />
            <span>
              Use the{' '}
              <span className="font-semibold text-accent-foreground">
                following examples
              </span>{' '}
              to name your tags:
            </span>
          </p>
          <ol className="space-y-2">
            <li>
              <Badge variant="outline">ignite</Badge> - reference to the product
            </li>
            <li>
              <Badge variant="outline">react</Badge> - reference to the main
              technology
            </li>
            <li>
              <Badge variant="outline">fundamentos-do-react</Badge> - reference
              to the course
            </li>
          </ol>
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(handleCreateTag)} className="w-full">
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-baseline gap-4">
            <Label htmlFor="tag" className="text-right">
              New tag
            </Label>
            <div className="col-span-3 space-y-4">
              <Input
                id="tag"
                placeholder="your-new-tag"
                disabled={isSubmitting}
                {...register('tag')}
              />
              {errors.tag && (
                <p className="text-sm font-medium text-red-500 dark:text-red-400">
                  {errors.tag.message}
                </p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogTrigger asChild>
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </DialogTrigger>
          <Button className="w-24" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Create'
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
