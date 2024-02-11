'use client'

import { useTheme } from 'next-themes'
import Chart from 'react-apexcharts'
import { teal } from 'tailwindcss/colors'

export default function WebhookEventsChart() {
  const { resolvedTheme } = useTheme()

  return (
    <Chart
      type="area"
      width={140}
      height={24}
      options={{
        chart: {
          id: 'webhook-events-amount-chart',
          toolbar: {
            show: false,
          },
          parentHeightOffset: 0,
          sparkline: {
            enabled: true,
          },
        },
        grid: {
          show: false,
          padding: {
            bottom: 0,
            top: 0,
            left: 0,
            right: 0,
          },
        },
        tooltip: {
          enabled: false,
        },
        colors: [teal[400]],
        stroke: {
          curve: 'smooth',
          width: 2,
        },
        fill: {
          gradient:
            resolvedTheme === 'light'
              ? {
                  opacityFrom: 0.8,
                  opacityTo: 0.4,
                }
              : {
                  opacityFrom: 0.4,
                  opacityTo: 0.1,
                },
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          labels: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          axisBorder: {
            show: false,
          },
        },
        yaxis: {
          labels: {
            show: false,
          },
        },
      }}
      series={[
        {
          name: 'amount',
          data: [32, 8, 40, 19, 23, 40, 12],
        },
      ]}
    />
  )
}
