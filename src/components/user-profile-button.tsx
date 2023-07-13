'use client'

import { UserButton } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { useTheme } from 'next-themes'

export function UserProfileButton() {
  const { resolvedTheme } = useTheme()

  const isDarkTheme = resolvedTheme === 'dark'

  return (
    <UserButton appearance={{ baseTheme: isDarkTheme ? dark : undefined }} />
  )
}
