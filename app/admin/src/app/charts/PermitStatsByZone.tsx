'use client'

import { Bar } from 'react-chartjs-2'
import { useEffect, useState } from 'react'
import { getPermitStatsByZone } from '../../permit/actions'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function PermitStatsByZone() {
  const [zoneData, setZoneData] = useState<{ area: string; totalPermits: number }[]>([])

  useEffect(() => {
    getPermitStatsByZone(true).then(setZoneData)
  }, [])

  const data = {
    labels: zoneData.map((zone) => `Zone ${zone.area}`),
    datasets: [
      {
        label: 'Active Permits',
        data: zoneData.map((zone) => zone.totalPermits),
        backgroundColor: '#42a5f5',
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Active Permits by Zone' },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: false,
        },
        grid: {
          display: false,
        },
        barPercentage: 0.5,
        categoryPercentage: 0.6,
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0,
        },
        suggestedMax: 5,
      },
    },
  }



  return <Bar data={data} options={options} />
}
