'use client'

import { ComponentProps } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts'

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

function CustomCursor({ x, y, width, height }: ComponentProps<'svg'>) {
  return (
    <rect
      className="fill-primary/10"
      x={x}
      y={y}
      width={width}
      height={height}
    />
  )
}

export function ViewsCountChart({ data }: ViewsCountChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} style={{ fontSize: 12 }}>
        <XAxis
          dataKey="date"
          stroke="#888888"
          tickLine={false}
          axisLine={false}
        />
        <YAxis stroke="#888888" tickLine={false} axisLine={false} />

        <CartesianGrid className="!stroke-muted" vertical={false} />

        <Bar
          className="fill-teal-400 stroke-teal-500 dark:fill-emerald-950"
          dataKey="plays"
          radius={[6, 6, 0, 0]}
        />
        <Bar
          className="fill-violet-400 stroke-violet-500 dark:fill-violet-950"
          dataKey="unique"
          radius={[6, 6, 0, 0]}
        />

        <Tooltip cursor={<CustomCursor />} content={<CustomTooltip />} />
      </BarChart>
    </ResponsiveContainer>
  )
}
