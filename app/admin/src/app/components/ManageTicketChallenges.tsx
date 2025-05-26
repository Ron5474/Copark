'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Stack,
  Button,
  useTheme,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material'

import { getChallengedTickets, acceptTicketChallenge, rejectTicketChallenge, getAcceptedTickets } from '../../ticket/actions'
import { ChallengedTicket, Ticket } from '@/types'

const getShortId = (jwt: string) => jwt.slice(-8).toUpperCase()

export default function ManageTicketChallenges() {
  const theme = useTheme()
  const [currentTab, setCurrentTab] = useState(0)
  const [challengedTickets, setChallengedTickets] = useState<ChallengedTicket[]>([])
  const [acceptedTickets, setAcceptedTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChallengedTickets = async () => {
    try {
      setLoading(true)
      const tickets = await getChallengedTickets()
      setChallengedTickets(tickets)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch challenged tickets')
    } finally {
      setLoading(false)
    }
  }

  const fetchAcceptedTickets = async () => {
    try {
      setLoading(true)
      const tickets = await getAcceptedTickets()
      setAcceptedTickets(tickets)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch accepted tickets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentTab === 0) {
      fetchChallengedTickets()
    } else {
      fetchAcceptedTickets()
    }
  }, [currentTab])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    )
  }

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
          Manage Ticket Challenges
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
        </Tabs>
      </Box>

      {/* Content */}
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
          <>
            <Typography sx={{ mb: 2 }}>Active Challenges: {challengedTickets.length}</Typography>
            <Stack spacing={2}>
              {challengedTickets.map((ticket) => (
                <Box
                  key={ticket.id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: '#E8F4F4',
                    border: `1px solid ${theme.palette.primary.light}20`,
                    p: 3,
                    borderRadius: '15px',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography
                        sx={{
                          fontSize: '20px',
                          fontWeight: 500,
                          color: theme.palette.primary.dark
                        }}
                      >
                        Ticket #{getShortId(ticket.id)}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: theme.palette.warning.main,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {ticket.ticketStatus}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ mb: 1 }}><strong>Vehicle:</strong> {ticket.vehicle}</Typography>
                    <Typography sx={{ mb: 1 }}><strong>Violation:</strong> {ticket.violation}</Typography>
                    <Typography sx={{ mb: 1 }}><strong>Fine:</strong> ${ticket.fine.toFixed(2)}</Typography>
                    <Typography><strong>Issue Date:</strong> {new Date(ticket.issuedDate).toLocaleDateString()}</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography
                      sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: 500,
                        mb: 1
                      }}
                    >
                      Challenge Reason:
                    </Typography>
                    <Typography sx={{ pl: 2 }}>
                      {ticket.challengeReason}
                    </Typography>
                  </Box>

                  {ticket.note && (
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        sx={{
                          color: theme.palette.text.secondary,
                          fontWeight: 500,
                          mb: 1
                        }}
                      >
                        Original Note:
                      </Typography>
                      <Typography sx={{ pl: 2 }}>
                        {ticket.note}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      sx={{
                        color: theme.palette.secondary.main,
                        borderColor: theme.palette.secondary.main,
                        '&:hover': {
                          bgcolor: theme.palette.secondary.main,
                          color: '#ffffff'
                        }
                      }}
                      onClick={async () => {
                        try {
                          await rejectTicketChallenge(ticket.id);
                          // Refresh the list of challenged tickets
                          const tickets = await getChallengedTickets();
                          setChallengedTickets(tickets);
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Failed to reject challenge');
                        }
                      }}
                    >
                      Reject Challenge
                    </Button>
                    <Button
                      variant="contained"
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        color: '#ffffff',
                        '&:hover': {
                          bgcolor: theme.palette.primary.dark
                        }
                      }}
                      onClick={async () => {
                        try {
                          await acceptTicketChallenge(ticket.id);
                          // Refresh the list of challenged tickets
                          const tickets = await getChallengedTickets();
                          setChallengedTickets(tickets);
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Failed to accept challenge');
                        }
                      }}
                    >
                      Accept Challenge
                    </Button>
                  </Box>
                </Box>
              ))}

              {challengedTickets.length === 0 && (
                <Typography variant="body1" textAlign="center">
                  No challenged tickets found.
                </Typography>
              )}
            </Stack>
          </>
        ) : (
          <>
            <Typography sx={{ mb: 2 }}>Accepted Tickets: {acceptedTickets.length}</Typography>
            <Stack spacing={2}>
              {acceptedTickets.map((ticket) => (
                <Box
                  key={ticket.id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: '#E8F4F4',
                    border: `1px solid ${theme.palette.primary.light}20`,
                    p: 3,
                    borderRadius: '15px'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography sx={{ fontSize: '20px', fontWeight: 500, color: theme.palette.primary.dark }}>
                        Ticket #{getShortId(ticket.id)}
                      </Typography>
                      <Typography sx={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: theme.palette.success.main,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {ticket.ticketStatus}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ mb: 1 }}><strong>Vehicle:</strong> {ticket.vehicle}</Typography>
                    <Typography sx={{ mb: 1 }}><strong>Violation:</strong> {ticket.violation}</Typography>
                    <Typography sx={{ mb: 1 }}><strong>Fine:</strong> ${ticket.fine.toFixed(2)}</Typography>
                    <Typography><strong>Issue Date:</strong> {new Date(ticket.issuedDate).toLocaleDateString()}</Typography>
                  </Box>

                  {ticket.note && (
                    <Box sx={{ mb: 2 }}>
                      <Typography sx={{ color: theme.palette.text.secondary, fontWeight: 500, mb: 1 }}>
                        Note:
                      </Typography>
                      <Typography sx={{ pl: 2 }}>
                        {ticket.note}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ))}

              {acceptedTickets.length === 0 && (
                <Typography variant="body1" textAlign="center">
                  No accepted tickets found.
                </Typography>
              )}
            </Stack>
          </>
        )}
      </Box>
    </Box>
  )
}