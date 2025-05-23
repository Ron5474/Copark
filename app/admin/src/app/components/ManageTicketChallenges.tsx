'use client'

import { useState } from 'react'
import { 
  Box, 
  Typography, 
  Stack,
  Button,
  useTheme
} from '@mui/material'

const mockChallengedTickets = [
  {
    id: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImMxMTFkMmZmLWJiZmYtNGU5Yy1hZDNhLTgwYWU5YTkxOTI3NSJ9.TNstWQ63-iX-W01hrYZdGy4ErP-8DbRsXrPCdnG7GcA",
    vehicle: "ABC-1234",
    enforcer: "enc_5e6f7g8h9i0j1k2l3m4n5o",
    issuedDate: "2025-03-15",
    violation: "Parking in no-parking zone",
    fine: 75.00,
    ticketStatus: "challenged",
    images: ["img_front.jpg", "img_side.jpg"],
    note: "Vehicle was displaying emergency flashers",
    challengeReason: "Emergency situation - medical emergency required immediate parking"
  },
  {
    id: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjcwZDI4OGY2LTJiNzctNDZhZS1iNTc0LWQ5NmJkMzU5ODUxNiJ9.Lx01-yIXjpozcBNobxBJ3mIZGYFSGqTchQyJuIedg60",
    vehicle: "XYZ-9876",
    enforcer: "enc_8h9i0j1k2l3m4n5o6p7q8r",
    issuedDate: "2025-04-02",
    violation: "Expired meter",
    fine: 45.50,
    ticketStatus: "challenged",
    images: ["img_meter.jpg", "img_vehicle.jpg"],
    note: "Meter showed time remaining",
    challengeReason: "Meter was paid and had 15 minutes remaining when ticket was issued"
  }
]

const getShortId = (jwt: string) => jwt.slice(-8).toUpperCase();

export default function ManageTicketChallenges() {
  const theme = useTheme()
  const [challengedTickets, setChallengedTickets] = useState(mockChallengedTickets)

  void setChallengedTickets;

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
                  onClick={() => {
                    console.log('Rejecting challenge for ticket:', ticket.id)
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
                  onClick={() => {
                    console.log('Accepting challenge for ticket:', ticket.id)
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
      </Box>
    </Box>
  )
}