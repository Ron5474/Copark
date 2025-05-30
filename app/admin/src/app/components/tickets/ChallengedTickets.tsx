import { Stack, Box, Typography, Button, useTheme } from '@mui/material'
import { ChallengedTicket } from '@/types'
import { acceptTicketChallenge, rejectTicketChallenge, getChallengedTickets } from '../../../ticket/actions'

const getShortId = (jwt: string) => jwt.slice(-8).toUpperCase()

interface ChallengedTicketsProps {
  tickets: ChallengedTicket[]
  onTicketsUpdate: (tickets: ChallengedTicket[]) => void
  onError: (error: string) => void
}

export function ChallengedTickets({ tickets, onTicketsUpdate, onError }: ChallengedTicketsProps) {
  const theme = useTheme()

  return (
    <>
      <Typography sx={{ mb: 2 }}>Active Challenges: {tickets.length}</Typography>
      <Stack spacing={2}>
        {tickets.map((ticket) => (
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
                <Typography sx={{ fontSize: '20px', fontWeight: 500, color: theme.palette.primary.dark }}>
                  Ticket #{getShortId(ticket.id)}
                </Typography>
                <Typography sx={{ color: theme.palette.warning.main, fontWeight: 600 }}>
                  {ticket.ticketStatus.toUpperCase()}
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
              <Typography sx={{ color: theme.palette.text.secondary, fontWeight: 500, mb: 1 }}>
                Challenge Reason:
              </Typography>
              <Typography sx={{ pl: 2, color: theme.palette.text.primary }}>
                {ticket.challengeReason}
              </Typography>
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

            {ticket.images && (
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ color: theme.palette.text.secondary, fontWeight: 500, mb: 1 }}>
                  Evidence:
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {Array.isArray(ticket.images) ? ticket.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Violation evidence ${index + 1}`}
                      style={{
                        maxWidth: '200px',
                        height: 'auto',
                        borderRadius: '8px'
                      }}
                    />
                  )) : (
                    <img
                      src={ticket.images}
                      alt="Violation evidence"
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        borderRadius: '8px'
                      }}
                    />
                  )}
                </Box>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={async () => {
                  try {
                    await rejectTicketChallenge(ticket.id);
                    const tickets = await getChallengedTickets();
                    onTicketsUpdate(tickets);
                  } catch (err) {
                    onError(`${(err as Error).message}`);
                  }
                }}
              >
                Reject Challenge
              </Button>
              <Button
                variant="contained"
                onClick={async () => {
                  try {
                    await acceptTicketChallenge(ticket.id);
                    const tickets = await getChallengedTickets();
                    onTicketsUpdate(tickets);
                  } catch (err) {
                    onError(`${(err as Error).message}`);
                  }
                }}
              >
                Accept Challenge
              </Button>
            </Box>
          </Box>
        ))}

        {tickets.length === 0 && (
          <Typography variant="body1" textAlign="center">
            No challenged tickets found.
          </Typography>
        )}
      </Stack>
    </>
  )
}