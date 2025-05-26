'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Avatar from '@mui/material/Avatar'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'

import { useTicketState } from './TicketContext'
import TicketEvidence from './TicketEvidence'
import IndividualTicketButtons from './IndividualTicketButtons'
import { useLocale } from 'next-intl'


export default function IndividualTicket() {
  const { currentTicket } = useTicketState()

  return (
    <Box 
      sx={{ 
        pt: '10px',
        pb: '64px',
        px: 2,
        minHeight: '100vh',
        backgroundColor: '#f8fffe'
      }}
    >
      <Card 
        sx={{ 
          mb: 2,
          borderRadius: 4,
          background: 'linear-gradient(135deg,rgb(212, 218, 217) 0%,rgb(208, 243, 232) 100%)',
          boxShadow: '0 2px 12px rgba(0, 121, 107, 0.1)',
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{ 
            background: 'linear-gradient(135deg, #00796b 0%, #00695c 100%)',
            p: 3,
            color: 'white'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                mr: 2,
                width: 48,
                height: 48
              }}
            >
              <WarningAmberIcon sx={{ color: 'white' }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Parking Violation
              </Typography>
              <Chip 
                label="ACTIVE" 
                size="small"
                sx={{ 
                  bgcolor: '#ff5722',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  height: 24
                }}
              />
            </Box>
          </Box>
        </Box>

        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="subtitle2" 
              color="#00796b"
              fontWeight="600"
              sx={{ mb: 1 }}
            >
              VIOLATION TYPE
            </Typography>
            <Paper 
              sx={{ 
                p: 2.5,
                bgcolor: '#f5f5f5',
                borderRadius: 2,
                border: '1px solid #e0e0e0'
              }}
            >
              <Typography 
                variant="body1" 
                fontWeight="500"
                color="text.primary"
                sx={{
                  lineHeight: 1.5,
                  fontSize: '1rem',
                  color: '#333333'
                }}
              >
                {currentTicket?.violation}
              </Typography>
            </Paper>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <CalendarTodayIcon 
                sx={{ 
                  color: '#00796b', 
                  mr: 1.5, 
                  fontSize: '1.25rem' 
                }} 
              />
              <Typography variant="subtitle2" color="#00796b" fontWeight="600">
                ISSUE DATE
              </Typography>
            </Box>
            <Typography 
              variant="body1" 
              color="text.primary"
              sx={{ ml: 4.5, fontSize: '1rem' }}
            >
                {new Date(currentTicket?.issuedDate as string).toLocaleString(useLocale(), { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <TicketEvidence />
      <IndividualTicketButtons />
    </Box>
  )
}