import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { InfoCircledIcon } from '@radix-ui/react-icons'

export function MetadataTooltip() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <InfoCircledIcon className="h-4 w-4 cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-[280px]">
          <p className="text-center text-xs text-slate-600 dark:text-slate-400">
            Request body sent to the webhook
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
