'use client'

import { useState, useEffect } from 'react'
import { Tabs, Tab, Box, Grid, Card, CardContent, Typography, CircularProgress, useTheme } from '@mui/material'
import TicketsByEnforcerPerDay from '../charts/TicketsByEnforcerPerDay'
import TicketsPerDay from '../charts/TicketsPerDay'
import PermitsPerDay from '../charts/PermitsPerDay'
import PermitStatsByLot from '../charts/PermitStatsByLot'
import PermitStatsByZone from '../charts/PermitStatsByZone'
import AllPermitsTable from '../charts/AllPermitsTable'
import { getPermitReport } from '../../permit/actions'
import { PermitReport } from '../../types'

export default function ViewStatistics() {
  const theme = useTheme()
  const [currentTab, setCurrentTab] = useState(0)
  const [report, setReport] = useState<PermitReport | null>(null)

  useEffect(() => {
    getPermitReport().then(setReport)
  }, [])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
  }

  const summaryStats = report ? [
    { label: 'Total Permits', value: report.totalPermits },
    { label: 'Active Permits', value: report.activePermits },
    { label: 'Expired Permits', value: report.expiredPermits },
    { label: 'Total Revenue ($)', value: (report.totalRevenue / 100).toFixed(2) },
  ] : []

  return (
    <Box sx={{ p: 4, bgcolor: '#ffffff' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 4,
          borderBottom: `2px solid ${theme.palette.primary.main}`,
          pb: 2
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/admin/assets/logo-notitle.png"
          alt="CoPark Admin"
          style={{ height: 60, marginRight: 16 }}
        />
        <Typography
          variant="h4"
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 700,
            fontSize: '32px'
          }}
        >
          Statistics
        </Typography>
      </Box>

      <Box
        sx={{
          p: 3,
          background: '#ffffff',
          mx: 'auto',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          borderRadius: '15px'
        }}
      >
        {!report ? (
          <CircularProgress />
        ) : (
          <Grid container spacing={3} sx={{ mb: 4 }}>
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
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={currentTab}
            onChange={handleTabChange}
            aria-label="statistics tabs"
          >
            <Tab label="Tickets by Day" />
            <Tab label="Tickets by Enforcer" />
            <Tab label="Permits by Day" />
            <Tab label="Permits by Zone" />
            <Tab label="Permits by Lot" />
            <Tab label="All Permits" />
          </Tabs>
        </Box>

        {currentTab === 0 && <TicketsPerDay />}
        {currentTab === 1 && <TicketsByEnforcerPerDay />}
        {currentTab === 2 && <PermitsPerDay />}
        {currentTab === 3 && <PermitStatsByZone />}
        {currentTab === 4 && <PermitStatsByLot />}
        {currentTab === 5 && <AllPermitsTable />}
      </Box>
    </Box>
  )
}