import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CardActionArea from '@mui/material/CardActionArea'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useFormatter, useTranslations } from 'next-intl'

import { useTicketState } from './TicketContext'
import { Ticket } from '../types'

export default function TicketCard({ticket}: {ticket: Ticket}) {
  const {setCurrentTicket, setCurrentView} = useTicketState()
  const bgColor = (ticket.ticketStatus === 'unpaid' || ticket.ticketStatus === 'active') ? '#ff5722' : '#ff9800'
  const formatter = useFormatter()
  const t = useTranslations('ticket')

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const correctedDate = new Date(date.getTime() - (7 * 60 * 60 * 1000))
    return formatter.dateTime(correctedDate, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return formatter.number(amount, {
      style: 'currency',
      currency: 'USD'
    })
  }

  return (
    <Card 
      sx={{ 
        maxWidth: 400,
        width: '100%',
        borderRadius: 4,
        background: 'linear-gradient(135deg,rgb(212, 218, 217) 0%,rgb(208, 243, 232) 100%)',
        boxShadow: '0 2px 12px rgba(0, 121, 107, 0.1)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
    >
      <CardActionArea 
        onClick={() => {
          setCurrentTicket(ticket)
          setCurrentView('IndividualTicket')
        }}
      >
        <Box 
          sx={{ 
            background: 'linear-gradient(135deg, #00796b 0%, #00695c 100%)',
            p: 2.5,
            color: 'white'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  mr: 2,
                  width: 40,
                  height: 40
                }}
              >
                <WarningAmberIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
                  {t("ticket")} #{ticket.id.substring(ticket.id.length - 5, ticket.id.length)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
                  {formatDate(ticket.issuedDate)}
                </Typography>
              </Box>
            </Box>
            <Chip 
              label={ticket.ticketStatus.toUpperCase()} 
              size="small"
              sx={{ 
                bgcolor: bgColor,
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.7rem',
                height: 22,
                textTransform: 'uppercase'
              }}
            />
          </Box>
        </Box>

        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="body1" 
                color="text.primary"
                fontWeight="500"
                sx={{ 
                  fontSize: '0.95rem',
                  color: '#333333',
                  mb: 0.5
                }}
              >
                {ticket.violation}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: '0.85rem' }}
              >
                {ticket.vehicle}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              <Typography 
                variant="h6" 
                color="#00796b"
                fontWeight="bold"
                sx={{ fontSize: '1.2rem', mr: 1 }}
              >
                {formatCurrency(ticket.fine)}
              </Typography>
              <ChevronRightIcon 
                sx={{ 
                  color: '#00796b', 
                  fontSize: '1.5rem',
                  opacity: 0.7
                }} 
              />
            </Box>
          </Box>
          
          <Box 
            sx={{ 
              mt: 2,
              pt: 1.5,
              borderTop: '1px solid rgba(0, 121, 107, 0.1)',
              textAlign: 'center'
            }}
          >
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                fontSize: '0.75rem',
                fontStyle: 'italic',
                opacity: 0.8
              }}
            >
              Tap to view details
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
