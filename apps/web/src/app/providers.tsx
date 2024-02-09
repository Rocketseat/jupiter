'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider as JotaiProvider } from 'jotai'
import { ThemeProvider } from 'next-themes'
import { ReactNode, useState } from 'react'

import { TooltipProvider } from '@/components/ui/tooltip'
import { reactClient } from '@/lib/trpc/client'
import { TRPCProvider } from '@/lib/trpc/react'

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() => reactClient)

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TRPCProvider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <JotaiProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </JotaiProvider>
        </QueryClientProvider>
      </TRPCProvider>
    </ThemeProvider>
  )
}
