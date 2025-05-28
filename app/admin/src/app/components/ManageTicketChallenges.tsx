'use client'

import { useState, useEffect, memo } from 'react'
import {
  Box,
  Typography,
  useTheme,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material'

import { ChallengedTickets } from './tickets/ChallengedTickets'
import { AcceptedTickets } from './tickets/AcceptedTickets'
import { UnpaidTickets } from './tickets/UnpaidTickets'
import { getChallengedTickets, getAcceptedTickets, getUnpaidTickets } from '../../ticket/actions'
import { ChallengedTicket, Ticket } from '@/types'

const TicketContent = memo(function TicketContent({ 
  currentTab, 
  challengedTickets, 
  acceptedTickets,
  unpaidTickets, 
  setChallengedTickets, 
  setError 
}: { 
  currentTab: number
  challengedTickets: ChallengedTicket[]
  acceptedTickets: Ticket[]
  unpaidTickets: Ticket[]
  setChallengedTickets: (tickets: ChallengedTicket[]) => void
  setError: (error: string) => void
}) {
  return (
    <Box
      sx={{
        p: 3,
        background: '#ffffff',
        maxWidth: 900,
        mx: 'auto',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        borderRadius: '15px'
      }}
    >
      {currentTab === 0 ? (
        <ChallengedTickets 
          tickets={challengedTickets}
          onTicketsUpdate={setChallengedTickets}
          onError={setError}
        />
      ) : currentTab === 1 ? (
        <AcceptedTickets tickets={acceptedTickets} />
      ) : (
        <UnpaidTickets tickets={unpaidTickets} />
      )}
    </Box>
  )
})

export default function ManageTicketChallenges() {
  const theme = useTheme()
  const [currentTab, setCurrentTab] = useState(0)
  const [challengedTickets, setChallengedTickets] = useState<ChallengedTicket[]>([])
  const [acceptedTickets, setAcceptedTickets] = useState<Ticket[]>([])
  const [unpaidTickets, setUnpaidTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChallengedTickets = async () => {
    try {
      setLoading(true)
      const tickets = await getChallengedTickets()
      setChallengedTickets(tickets)
    } catch /*(err)*/ {
      setError('Failed to fetch challenged tickets')
    } finally {
      setLoading(false)
    }
  }

  const fetchAcceptedTickets = async () => {
    try {
      setLoading(true)
      const tickets = await getAcceptedTickets()
      setAcceptedTickets(tickets)
    } catch /*(err)*/ {
      setError('Failed to fetch accepted tickets')
    } finally {
      setLoading(false)
    }
  }

  const fetchUnpaidTickets = async () => {
    try {
      setLoading(true)
      const tickets = await getUnpaidTickets()
      setUnpaidTickets(tickets)
    } catch {
      setError('Failed to fetch unpaid tickets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentTab === 0) {
      fetchChallengedTickets()
    } else if (currentTab === 1) {
      fetchAcceptedTickets()
    } else {
      fetchUnpaidTickets()
    }
  }, [currentTab])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
  }

  return (
    <Box sx={{ p: 4, bgcolor: '#ffffff' }}>
      {/* Header */}
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
          Manage Tickets
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="ticket management tabs"
        >
          <Tab label="Challenged Tickets" />
          <Tab label="Accepted Tickets" />
          <Tab label="Unpaid Tickets" />
        </Tabs>
      </Box>

      {!loading && !error && (
        <TicketContent
          currentTab={currentTab}
          challengedTickets={challengedTickets}
          acceptedTickets={acceptedTickets}
          unpaidTickets={unpaidTickets}
          setChallengedTickets={setChallengedTickets}
          setError={setError}
        />
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Box sx={{ p: 4 }}>
          <Typography color="error">Error: {error}</Typography>
        </Box>
      )}
    </Box>
  )
}