import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CardActionArea from '@mui/material/CardActionArea'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'

interface Ticket {
  id: string
  ticketStatus: string
  issueddate: string
}

export default function TicketView({ticket}: {ticket: Ticket}) {
  const  bgColor = ticket.ticketStatus === 'paid' ? 'success' : ((ticket.ticketStatus === 'unpaid') ? 'error' : 'warning')
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea onClick={() => {console.log('Clicked on this card', ticket.id)}}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography gutterBottom variant="h5" component="div">
              Ticket #{ticket.id.substring(0, 5)}
            </Typography>
            <Typography>
              {ticket.issueddate}
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
