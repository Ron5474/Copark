'use client'

import { Bar } from 'react-chartjs-2'
import { useEffect, useState } from 'react'
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function PermitStatsByLot() {
  const [lotData, setLotData] = useState<{ area: string; totalPermits: number }[]>([])

  useEffect(() => {
    getPermitStatsByLot(true).then(setLotData)
  }, [])

  const data = {
    labels: lotData.map((lot) => `Lot ${lot.area}`),
    datasets: [
      {
        label: 'Active Permits',
        data: lotData.map((lot) => lot.totalPermits),
        backgroundColor: '#66bb6a',
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Active Permits by Lot' },
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
      },
    },
  }


  return <Bar data={data} options={options} />
}
