import { Box, Typography, useTheme, List, ListItem, ListItemText, Chip, Stack } from '@mui/material'
import { Ticket } from '@/types'
import { useState } from 'react'

const getShortId = (jwt: string) => jwt.slice(-8).toUpperCase()

const truncateVehicle = (vehicle: string) => {
  return vehicle.length > 16 ? `${vehicle.slice(0, 16)}...` : vehicle;
};

interface UnpaidTicketsProps {
  tickets: Ticket[]
}

export function UnpaidTickets({ tickets }: UnpaidTicketsProps) {
  const theme = useTheme()
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  return (
    <Box sx={{
      display: 'flex',
      gap: 3,
      height: '80vh',
      maxWidth: '1400px',
      width: '100%',
      mx: 'auto',
      p: 2
    }}>
      {/* Left side - List view */}
      <Box sx={{
        width: '35%',
        borderRight: 1,
        borderColor: 'divider',
        pl: 1,
        pr: 2,
        py: 2
      }}>
        <Typography sx={{ mb: 2 }}>Unpaid Tickets: {tickets.length}</Typography>
        <List sx={{ overflowY: 'auto', maxHeight: '100%' }}>
          {tickets.map((ticket) => (
            <ListItem
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              sx={{
                cursor: 'pointer',
                bgcolor: selectedTicket?.id === ticket.id ? '#FFF4E6' : 'transparent',
                borderRadius: 1,
                border: selectedTicket?.id === ticket.id
                  ? `1px solid ${theme.palette.warning.main}`
                  : `1px solid ${theme.palette.grey[300]}`,
                mb: 1,
                '&:hover': {
                  bgcolor: '#FFF8F0',
                }
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography component="span" sx={{ fontWeight: 500 }}>
                      Ticket #{getShortId(ticket.id)}
                    </Typography>
                    <Chip
                      label="UNPAID"
                      size="small"
                      sx={{
                        bgcolor: theme.palette.warning.main,
                        color: 'white'
                      }}
                    />
                  </Box>
                }
                secondary={
                  <Typography component="div" variant="body2" color="text.secondary">
                    Vehicle: {truncateVehicle(ticket.vehicle)}
                    <br />
                    Fine: ${ticket.fine.toFixed(2)}
                  </Typography>
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
                label="UNPAID"
                size="small"
                sx={{
                  bgcolor: theme.palette.warning.main,
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

              {selectedTicket.note && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Note</Typography>
                  <Typography sx={{ pl: 0 }}>{selectedTicket.note}</Typography>
                </Box>
              )}

              {selectedTicket.images && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Evidence</Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {<img
                      src={selectedTicket.images}
                      alt="Evidence"
                      style={{
                        maxWidth: '200px',
                        height: 'auto',
                        borderRadius: '8px'
                      }}
                    />}
                  </Box>
                </Box>
              )}
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
              Select a ticket from the list to view its details
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}