'use client'

import { Box, Card, CardContent, Typography, Grid, CircularProgress, } from '@mui/material'
import { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js'
import { getPermitReport } from '../../permit/actions'
import { PermitReport } from '../../types'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title)

export default function PermitReportView() {
  const [report, setReport] = useState<PermitReport | null>(null)

  useEffect(() => {
    getPermitReport().then(setReport)
  }, [])

  if (!report) {
    return <CircularProgress />
  }

  const summaryStats = [
    { label: 'Total Permits', value: report.totalPermits },
    { label: 'Active Permits', value: report.activePermits },
    { label: 'Expired Permits', value: report.expiredPermits },
    { label: 'Total Revenue ($)', value: (report.totalRevenue / 100).toFixed(2) },
  ]

  const zoneChartData = {
    labels: report.zoneBreakdown.map((z) => `Zone ${z.area}`),
    datasets: [{ label: 'Permits', data: report.zoneBreakdown.map((z) => z.totalPermits), backgroundColor: '#42a5f5' }],
  }

  const lotChartData = {
    labels: report.lotBreakdown.map((l) => `Lot ${l.area}`),
    datasets: [{ label: 'Permits', data: report.lotBreakdown.map((l) => l.totalPermits), backgroundColor: '#66bb6a' }],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  }

  return (
    <Box sx={{ px: 3, py: 4 }}>
      <Typography variant="h5" gutterBottom>Permit Report</Typography>

      <Grid container spacing={3}>
        {summaryStats.map((stat) => (
          <Grid key={stat.label}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">{stat.label}</Typography>
                <Typography variant="h6">{stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box mt={6}>
        <Typography variant="h6" gutterBottom>Zone Breakdown</Typography>
        <Bar data={zoneChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Permits by Zone' } } }} />
      </Box>

      <Box mt={6}>
        <Typography variant="h6" gutterBottom>Lot Breakdown</Typography>
        <Bar data={lotChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Permits by Lot' } } }} />
      </Box>
    </Box>
  )
}
