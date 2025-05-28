'use client'

import { useState } from 'react'
import { Tabs, Tab, Box } from '@mui/material'
import TicketsByEnforcerPerDay from '../charts/TicketsByEnforcerPerDay'
import TicketsPerDay from '../charts/TicketsPerDay'
import PermitsPerDay from '../charts/PermitsPerDay'
import PermitStatsByLot from '../charts/PermitStatsByLot'
import PermitStatsByZone from '../charts/PermitStatsByZone'
import AllPermitsTable from '../charts/AllPermitsTable'
export default function ViewStatistics() {
  const [currentTab, setCurrentTab] = useState(0)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
  }

  return (
    <>
      <div className="w-full max-w-4xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Statistics</h2>
        <div className="bg-white p-4 rounded-lg shadow">
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


        </div>
      </div>
    </>
  )
}