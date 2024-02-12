import { twMerge } from 'tailwind-merge'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge(
        'animate-pulse rounded-md bg-slate-100 dark:bg-slate-800',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
