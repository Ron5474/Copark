import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CardActionArea from '@mui/material/CardActionArea'
import Chip from '@mui/material/Chip'

interface Ticket {
  id: string;
  ticketStatus: string;
}

export default function TicketView({ticket}: {ticket: Ticket}) {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            Ticket #{ticket.id.substring(0, 5)}
          </Typography>
          <Chip
            label='Pending'
            variant='filled'
            sx={{color: 'white', bgcolor: 'error.main', fontWeight: 'bold'}} 
          />
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
