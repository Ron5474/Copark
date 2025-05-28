import { Box, Typography, useTheme, Stack } from '@mui/material'
import { Ticket } from '@/types'

interface UnpaidTicketsProps {
  tickets: Ticket[]
}

export function UnpaidTickets({ tickets }: UnpaidTicketsProps) {
  const theme = useTheme()

  if (tickets.length === 0) {
    return <Typography>No unpaid tickets found.</Typography>
  }

  return (
    <>
      <Typography sx={{ mb: 2 }}>Unpaid Tickets: {tickets.length}</Typography>
      <Stack spacing={2}>
        {tickets.map((ticket) => (
          <Box
            key={ticket.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              bgcolor: '#FFF4E6',
              border: `1px solid ${theme.palette.warning.light}20`,
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
              <Typography variant="h6">Vehicle: {ticket.vehicle}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="warning.main">
                  Status: {ticket.ticketStatus}
                </Typography>
                <Typography>${ticket.fine.toFixed(2)}</Typography>
              </Box>
            </Box>
            <Typography color="text.secondary" sx={{ mb: 1 }}>
              {ticket.violation}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Issued: {new Date(ticket.issuedDate).toLocaleDateString()}
            </Typography>
          </Box>
        ))}
      </Stack>
    </>
  )
}