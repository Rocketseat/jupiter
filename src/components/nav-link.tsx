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

  return <Link {...props} prefetch={false} data-current={isCurrent} />
}
