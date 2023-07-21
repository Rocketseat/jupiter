'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ComponentProps } from 'react'

export type NavLinkProps = ComponentProps<typeof Link>

export function NavLink(props: NavLinkProps) {
  const pathName = usePathname()

  return (
    <Link
      {...props}
      prefetch={false}
      data-current={pathName === props.href}
      className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary data-[current=true]:text-primary"
    />
  )
}
