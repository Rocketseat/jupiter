import { useForm } from 'react-hook-form'
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
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useToast } from './ui/use-toast'

const newTagFormSchema = z.object({
  tag: z
    .string({
      required_error: 'The tag name is required.',
    })
    .regex(/^[a-zA-Z]+(-[a-zA-Z]+)*$/, {
      message: 'Use only contains letters and hyphens.',
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

  const { mutateAsync: createTag } = useMutation(
    async (tag: string) => {
      await axios.post('/api/tags', {
        tag,
      })
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(['tags'])
      },
    },
  )

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
    <DialogContent className="outline-none sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Create new tag</DialogTitle>
        <DialogDescription>
          Remember to avoid creating tags unnecessarily and to keep a maximum of
          three tags per video.
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
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Create'
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
