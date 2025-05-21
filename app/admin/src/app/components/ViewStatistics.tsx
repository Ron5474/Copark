'use client'

import { useState } from 'react'
import { Tabs, Tab, Box } from '@mui/material'
import TicketsByEnforcerPerDay from '../charts/TicketsByEnforcerPerDay'
import TicketsPerDay from '../charts/TicketsPerDay'

export default function ViewStatistics() {
  const [currentTab, setCurrentTab] = useState(0)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
  }

  return (
    <>
      <div className="w-full max-w-4xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Ticket Statistics</h2>
        <div className="bg-white p-4 rounded-lg shadow">
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs 
              value={currentTab}
              onChange={handleTabChange}
              aria-label="ticket statistics tabs"
            >
              <Tab label="Tickets by Day" />
              <Tab label="Tickets by Enforcer" />
            </Tabs>
          </Box>

          {currentTab === 0 && <TicketsPerDay />}
          {currentTab === 1 && <TicketsByEnforcerPerDay />}
        </div>
      </div>
    </>
  )
}