'use client'

import {
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { useUploads } from '@/hooks/useUploads'
import { MagicWandIcon, TextIcon } from '@radix-ui/react-icons'
import { ChevronDownIcon, Loader2 } from 'lucide-react'
import { useFormContext } from 'react-hook-form'

export function Header() {
  const {
    formState: { isSubmitting },
  } = useFormContext()

  const {
    uploads,
    clear,
    isThereAnyPendingUpload,
    isUploadsEmpty,
    isRunningAI,
    generateAITitles,
  } = useUploads()

  return (
    <div className="flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
        Upload
        {isThereAnyPendingUpload && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </h2>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="flex gap-2"
              disabled={isUploadsEmpty || isSubmitting}
            >
              {isRunningAI ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <MagicWandIcon className="h-3 w-3" />
              )}
              AI Tools
              <ChevronDownIcon className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              disabled={isRunningAI}
              onSelect={generateAITitles}
            >
              <TextIcon className="mr-2 h-4 w-4" />
              <span>Generate titles</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-6" />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              disabled={isUploadsEmpty || isSubmitting}
            >
              Clear all
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action can't be undone and all uploads will be deleted from the server.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={clear}>Prosseguir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          type="submit"
          size="sm"
          className="w-32"
          disabled={isUploadsEmpty || isThereAnyPendingUpload || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>Create all ({uploads.size})</>
          )}
        </Button>
      </div>
    </div>
  )
}
