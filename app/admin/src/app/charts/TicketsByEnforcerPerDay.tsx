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
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material'
import { getTicketsByEnforcer } from '../../ticket/actions'
import { getEnforcers } from '../../enforcement/actions'
import { Ticket, User } from '../../types'

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

export default function TicketsByEnforcerPerDay() {
  const [ticketStats, setTicketStats] = useState<TicketStat[]>([])
  const [enforcers, setEnforcers] = useState<User[]>([])
  const [selectedEnforcer, setSelectedEnforcer] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch enforcers on component mount
  useEffect(() => {
    const fetchEnforcers = async () => {
      try {
        const data = await getEnforcers()
        setEnforcers(data)
        if (data.length > 0) {
          setSelectedEnforcer(data[0].id)
        }
      } catch (err) {
        setError('Failed to fetch enforcers')
      } finally {
        setLoading(false)
      }
    }
    fetchEnforcers()
  }, [])

  // Fetch tickets when enforcer is selected
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedEnforcer) return
      
      try {
        setLoading(true)
        const tickets = await getTicketsByEnforcer(selectedEnforcer)
        setTicketStats(tickets)
      } catch (err) {
        setError('Failed to fetch ticket data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedEnforcer])

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
        text: 'Daily Ticket Statistics by Enforcer'
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
    <Box>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Enforcer</InputLabel>
        <Select
          value={selectedEnforcer}
          label="Select Enforcer"
          onChange={(e) => setSelectedEnforcer(e.target.value)}
        >
          {enforcers.map((enforcer) => (
            <MenuItem key={enforcer.id} value={enforcer.id}>
              {enforcer.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Line data={chartData} options={options} />
    </Box>
  )
}