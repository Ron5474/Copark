import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CardActionArea from '@mui/material/CardActionArea'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'

import { useTicketState } from './TicketContext'
import { Ticket } from '../types'
import { useLocale } from 'next-intl'

export default function TicketCard({ticket}: {ticket: Ticket}) {
  const {setCurrentTicket, setCurrentView} = useTicketState()
  const  bgColor = (ticket.ticketStatus === 'unpaid' || ticket.ticketStatus === 'active') ? 'error' : 'warning'
  console.log('TicketCard', ticket)
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea onClick={() => {
        setCurrentTicket(ticket)
        setCurrentView('IndividualTicket')
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography gutterBottom variant="h5" component="div">
              Ticket #{ticket.id.substring(0, 5)}
            </Typography>
            <Typography>
              {new Date(ticket.issuedDate).toLocaleDateString(useLocale(), { year: 'numeric', month: 'long', day: 'numeric' })}
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
