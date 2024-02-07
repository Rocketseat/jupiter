'use client'

import { useMemo } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts'
import { sky, teal } from 'tailwindcss/colors'

interface ViewsCountDataPerMonth {
  date: string
  plays: number
  unique: number
}

export interface ViewsCountChartProps {
  data: ViewsCountDataPerMonth[]
}

function CustomTooltip({ active, payload, label }: TooltipProps<any, any>) {
  const formatter = new Intl.NumberFormat('pt-BR')

  if (active && payload && payload.length) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 text-slate-950 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50">
        <span className="text-base font-semibold">{label}</span>
        <div className="flex flex-col gap-1">
          <span className="">
            <span className="font-medium">Plays:</span>{' '}
            {formatter.format(payload[0].value)}
          </span>
          <span className="">
            <span className="font-medium">Unique:</span>{' '}
            {formatter.format(payload[1].value)}
          </span>
        </div>
      </div>
    )
  }

  return null
}

export function ViewsCountChart({ data }: ViewsCountChartProps) {
  const clearedData = useMemo(() => {
    return data.filter((item) => item.plays !== 0)
  }, [data])

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={clearedData} style={{ fontSize: 12 }}>
        <XAxis
          dataKey="date"
          stroke="#888888"
          tickLine={false}
          axisLine={false}
        />

        <YAxis stroke="#888888" tickLine={false} axisLine={false} />

        <CartesianGrid className="!stroke-muted" vertical={false} />

        <Tooltip cursor={{ strokeOpacity: 0.3 }} content={<CustomTooltip />} />

        <Line
          type="monotone"
          stroke={teal[500]}
          dataKey="plays"
          dot={{
            className: 'stroke-0 fill-teal-500',
          }}
        />

        <Line
          type="monotone"
          stroke={sky[500]}
          dataKey="unique"
          dot={{
            className: 'stroke-0 fill-sky-500',
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
