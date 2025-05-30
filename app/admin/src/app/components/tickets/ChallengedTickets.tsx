import { Stack, Box, Typography, Button, useTheme, List, ListItem, ListItemText, Chip } from '@mui/material'
import { useState } from 'react'
import { ChallengedTicket } from '@/types'
import { acceptTicketChallenge, rejectTicketChallenge, getChallengedTickets } from '../../../ticket/actions'

const getShortId = (jwt: string) => jwt.slice(-8).toUpperCase()

const truncateVehicle = (vehicle: string) => {
  return vehicle.length > 16 ? `${vehicle.slice(0, 16)}...` : vehicle;
};

interface ChallengedTicketsProps {
  tickets: ChallengedTicket[]
  onTicketsUpdate: (tickets: ChallengedTicket[]) => void
  onError: (error: string) => void
}

export function ChallengedTickets({ tickets, onTicketsUpdate, onError }: ChallengedTicketsProps) {
  const theme = useTheme()
  const [selectedTicket, setSelectedTicket] = useState<ChallengedTicket | null>(null)

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 3, 
      height: '80vh',
      maxWidth: '1400px',
      width: '100%',
      mx: 'auto',         
      p: 2                // Reduced from 3 to 2
    }}>
      {/* Left side - List view */}
      <Box sx={{ 
        width: '35%', 
        borderRight: 1, 
        borderColor: 'divider',
        pl: 1,            // Reduced left padding
        pr: 2,            // Keep right padding
        py: 2             // Keep vertical padding
      }}>
        <Typography sx={{ mb: 2 }}>Active Challenges: {tickets.length}</Typography>
        <List sx={{ overflowY: 'auto', maxHeight: '100%' }}>
          {tickets.map((ticket) => (
            <ListItem 
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              sx={{
                cursor: 'pointer',
                bgcolor: selectedTicket?.id === ticket.id ? '#E8F4F4' : 'transparent',
                borderRadius: 1,
                border: selectedTicket?.id === ticket.id 
                  ? `1px solid ${theme.palette.primary.main}` 
                  : `1px solid ${theme.palette.grey[300]}`,  // Add grey border for unselected
                mb: 1,
                '&:hover': {
                  bgcolor: '#F5F5F5',
                }
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontWeight: 500 }}>
                      Ticket #{getShortId(ticket.id)}
                    </Typography>
                    <Chip 
                      label="CHALLENGED"
                      size="small"
                      sx={{ 
                        bgcolor: theme.palette.warning.dark,
                        color: 'white'
                      }}
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2">Vehicle: {truncateVehicle(ticket.vehicle)}</Typography>
                    <Typography variant="body2">Fine: ${ticket.fine.toFixed(2)}</Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Right side - Detail view */}
      <Box sx={{ width: '65%', p: 2 }}>
        {selectedTicket ? (
          <Box>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3
            }}>
              <Typography variant="h5">
                Ticket #{getShortId(selectedTicket.id)}
              </Typography>
              <Chip 
                label="CHALLENGED"
                size="small"
                sx={{ 
                  bgcolor: theme.palette.warning.dark,
                  color: 'white'
                }}
              />
            </Box>

            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Vehicle</Typography>
                <Typography>{selectedTicket.vehicle}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Violation</Typography>
                <Typography>{selectedTicket.violation}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Fine</Typography>
                <Typography>${selectedTicket.fine.toFixed(2)}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Issue Date</Typography>
                <Typography>{new Date(selectedTicket.issuedDate).toLocaleDateString()}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Challenge Reason</Typography>
                <Typography sx={{ pl: 0 }}>{selectedTicket.challengeReason}</Typography>
              </Box>

              {selectedTicket.images && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Evidence</Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {Array.isArray(selectedTicket.images) ? selectedTicket.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Evidence ${index + 1}`}
                        style={{
                          maxWidth: '200px',
                          height: 'auto',
                          borderRadius: '8px'
                        }}
                      />
                    )) : (
                      <img
                        src={selectedTicket.images}
                        alt="Evidence"
                        style={{
                          maxWidth: '200px',
                          height: 'auto',
                          borderRadius: '8px'
                        }}
                      />
                    )}
                  </Box>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={async () => {
                    try {
                      await rejectTicketChallenge(selectedTicket.id);
                      const tickets = await getChallengedTickets();
                      onTicketsUpdate(tickets);
                      setSelectedTicket(null);
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
                      await acceptTicketChallenge(selectedTicket.id);
                      const tickets = await getChallengedTickets();
                      onTicketsUpdate(tickets);
                      setSelectedTicket(null);
                    } catch (err) {
                      onError(`${(err as Error).message}`);
                    }
                  }}
                >
                  Accept Challenge
                </Button>
              </Box>
            </Stack>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            gap: 2
          }}>
            <Typography variant="h6" color="text.secondary">No Ticket Selected</Typography>
            <Typography color="text.secondary">
              Select a ticket from the list to view its details and manage the challenge
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}