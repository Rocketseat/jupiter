'use client'

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
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

        <Bar
          className="fill-rose-500 stroke-rose-500 dark:fill-rose-950"
          dataKey="plays"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          className="fill-violet-500 stroke-violet-500 dark:fill-violet-950"
          dataKey="unique"
          radius={[4, 4, 0, 0]}
        />

        <Tooltip
          cursor={{ fill: 'none' }}
          labelStyle={{ color: 'black' }}
          contentStyle={{ borderRadius: 6 }}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
