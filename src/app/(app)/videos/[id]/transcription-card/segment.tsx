export interface SegmentProps {
  value: string
  onValueChange: (value: string) => void
  onFocus: () => void
  onBlur: () => void
}

export function Segment({
  value,
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
      className="rounded p-1 outline-none hover:bg-primary/10 focus:bg-violet-500 focus:text-white"
    >
      {value}
    </span>
  )
}
