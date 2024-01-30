'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider as JotaiProvider } from 'jotai'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { ReactNode, useState } from 'react'

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <JotaiProvider>{children}</JotaiProvider>
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
