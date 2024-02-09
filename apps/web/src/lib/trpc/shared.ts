import { AppRouter } from '@nivo/trpc'
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>
