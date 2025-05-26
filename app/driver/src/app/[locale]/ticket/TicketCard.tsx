import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CardActionArea from '@mui/material/CardActionArea'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import { useFormatter } from 'next-intl'

import { useTicketState } from './TicketContext'
import { Ticket } from '../types'

export default function TicketCard({ticket}: {ticket: Ticket}) {
  const {setCurrentTicket, setCurrentView} = useTicketState()
  const  bgColor = (ticket.ticketStatus === 'unpaid' || ticket.ticketStatus === 'active') ? 'error' : 'warning'
  const formatter = useFormatter()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return formatter.dateTime(date, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea onClick={() => {
        setCurrentTicket(ticket)
        setCurrentView('IndividualTicket')
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography gutterBottom variant="h5" component="div">
              Ticket #{ticket.id.substring(ticket.id.length - 5, ticket.id.length)}
            </Typography>
            <Typography>
              {formatDate(ticket.issuedDate)}
            </Typography>
          </Box>
          <Chip
            label={ticket.ticketStatus}
            variant='filled'
            sx={{color: 'white', bgcolor: `${bgColor}.main`, fontWeight: 'bold'}} 
          />
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
