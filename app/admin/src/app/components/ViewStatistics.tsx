'use client'

import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { getTicketsByDay } from '../../ticket/actions'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function ViewStatistics() {
  const [ticketStats, setTicketStats] = useState<{[key: string]: number}>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session?.user?.token) {
          const data = await getTicketsByDay(session.user.token)
          // Convert data to counts per day
          const stats = Object.entries(data).reduce((acc, [date, tickets]) => {
            acc[date] = tickets.length
            return acc
          }, {} as {[key: string]: number})
          setTicketStats(stats)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch ticket data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  const chartData = {
    labels: Object.keys(ticketStats),
    datasets: [
      {
        label: 'Number of Tickets Issued',
        data: Object.values(ticketStats),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Daily Ticket Statistics'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Ticket Statistics</h2>
      <div className="bg-white p-4 rounded-lg shadow">
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}