'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ComponentProps } from 'react'

export type NavLinkProps = ComponentProps<typeof Link>

export function NavLink(props: NavLinkProps) {
  const pathName = usePathname()

  const isCurrent =
    props.href === '/'
      ? pathName === props.href
      : pathName.startsWith(props.href.toString())

  return (
    <Link
      {...props}
      prefetch={false}
      data-current={isCurrent}
      className="flex h-14 items-center border-b-2 border-transparent px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-border data-[current=true]:border-teal-400 data-[current=true]:text-accent-foreground"
    />
  )
}
