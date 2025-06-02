// 'use client'

// import { Bar } from 'react-chartjs-2'
// import { useEffect, useState } from 'react'
// import { getPermitStatsByLot } from '../../permit/actions'
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js'

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// export default function PermitStatsByLot() {
//   const [lotData, setLotData] = useState<{ area: string; totalPermits: number }[]>([])

//   useEffect(() => {
//     getPermitStatsByLot(true).then(setLotData)
//   }, [])

//   const data = {
//     labels: lotData.map((lot) => `Lot ${lot.area}`),
//     datasets: [
//       {
//         label: 'Active Permits',
//         data: lotData.map((lot) => lot.totalPermits),
//         backgroundColor: '#66bb6a',
//       },
//     ],
//   }

//   const options = {
//     responsive: true,
//     plugins: {
//       legend: { display: false },
//       title: { display: true, text: 'Active Permits by Lot' },
//     },
//     scales: {
//       x: {
//         ticks: {
//           autoSkip: false,
//         },
//         grid: {
//           display: false,
//         },
//         barPercentage: 0.5,
//         categoryPercentage: 0.6,
//       },
//       y: {
//         beginAtZero: true,
//         ticks: {
//           stepSize: 1,
//           precision: 0,
//         },
//       },
//     },
//   }


//   return <Bar data={data} options={options} />
// }

'use client'

import { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { getPermitStatsByLot } from '../../permit/actions'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { LotStat } from '@/types'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const defaultColors = [
  '#42A5F5', '#EF5350', '#66BB6A', '#FFA726', '#AB47BC', '#26C6DA', '#FF7043'
]

export default function PermitStatsByLot() {
  const [lotData, setLotData] = useState<LotStat[]>([])

  useEffect(() => {
    getPermitStatsByLot(true).then(setLotData)
  }, [])

  const lots = [...new Set(lotData.map(d => d.area))]
  const durations = [...new Set(lotData.map(d => d.durationType))]

  // Assign a color to each duration type
  const durationColors: Record<string, string> = {}
  durations.forEach((type, idx) => {
    durationColors[type] = defaultColors[idx % defaultColors.length]
  })

  const datasets = durations.map((duration) => ({
    label: duration.charAt(0).toUpperCase() + duration.slice(1),
    backgroundColor: durationColors[duration],
    data: lots.map(lot =>
      lotData.find(d => d.area === lot && d.durationType === duration)?.totalPermits || 0
    ),
  }))

  const data = {
    labels: lots.map(l => `Lot ${l}`),
    datasets,
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
      },
      title: { display: true, text: 'Active Permits by Lot' },
    },
    scales: {
      x: {
        stacked: false,
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0,
        },
      },
    },
  }

  return <Bar data={data} options={options} />
}
