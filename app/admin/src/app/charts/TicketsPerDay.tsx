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
import { Ticket } from '../../types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface TicketStat {
  date: string;
  tickets: Ticket[];
}

export default function TicketsPerDay() {
  const [ticketStats, setTicketStats] = useState<TicketStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rawData = await getTicketsByDay();
        const formattedData: TicketStat[] = Array.isArray(rawData)
          ? rawData.map(item => ({
            date: item.date || new Date(item.created_at).toLocaleDateString(),
            tickets: Array.isArray(item.tickets) ? item.tickets : []
          }))
          : [];

        setTicketStats(formattedData);
      } catch (err) {
        void err;
        setError('Failed to fetch ticket data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  const chartData = {
    labels: ticketStats.map(stat => stat.date),
    datasets: [
      {
        label: 'Number of Tickets Issued',
        data: ticketStats.map(stat => stat.tickets.length),
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
    <Line data={chartData} options={options} />
  )
}