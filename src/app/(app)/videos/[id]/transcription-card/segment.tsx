import { Badge } from '@/components/ui/badge'
import { formatSecondsToMinutes } from '@/utils/format-seconds-to-minutes'

export interface SegmentProps {
  value: string
  start: number
  onValueChange: (value: string) => void
  onFocus: () => void
  onBlur: () => void
}

export function Segment({
  value,
  start,
  onValueChange,
  onFocus,
  onBlur,
}: SegmentProps) {
  return (
    <span
      contentEditable
      suppressContentEditableWarning={true}
      onFocus={onFocus}
      onBlur={onBlur}
      onInput={(e) => onValueChange(e.currentTarget.textContent ?? '')}
      className="group rounded p-1 outline-none hover:bg-accent focus:bg-violet-500 focus:text-white"
    >
      <Badge
        variant="outline"
        className="px-1.5 py-0 transition-none group-hover:border-white/40 group-focus:border-white/60"
      >
        {formatSecondsToMinutes(start)}
      </Badge>
      {value}
    </span>
  )
}
