'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Avatar from '@mui/material/Avatar'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { useState } from 'react'

import { Payment } from '../shared/actions'
import { useTicketState } from './TicketContext'
import theme from '../theme'

export default function IndividualTicket() {
  const { currentTicket, setCurrentView } = useTicketState()
  const [imageExpanded, setImageExpanded] = useState(false)

  const handleViewChange = (view: string) => {
    setCurrentView(view)
  }

  const handleTicketPayment = async () => {
    const amount = parseFloat((currentTicket?.fine || 0).toFixed(2))*100
    const paymentDetails = {
      price: amount,
      currency: 'USD',
    }
    const permitDetails = {
      type: "ticket",
      ticketId: currentTicket?.id,
      ticketFine: amount
    }
    sessionStorage.setItem('paymentDetails', JSON.stringify(paymentDetails))
    sessionStorage.setItem('ticketDetails', JSON.stringify(permitDetails))
    await Payment("ticket", "Ticket Payment", amount, `Payment for Ticket ${currentTicket?.id.substring(0, 5)}`, "USD")
  }

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
              {currentTicket?.issueddate}
            </Typography>
          </Box>

        </CardContent>
      </Card>

      {currentTicket?.images && currentTicket.images.length > 0 && (
        <Card 
          sx={{ 
            mb: 2,
            borderRadius: 4,
            boxShadow: '0 2px 12px rgba(0, 121, 107, 0.1)',
            background: 'linear-gradient(135deg,rgb(212, 218, 217) 0%,rgb(208, 243, 232) 100%)',
            overflow: 'hidden'
          }}
        >
          <Box 
            sx={{ 
              p: 3,
              bgcolor: '#f8f9fa',
              borderBottom: '1px solid #e9ecef',
              background: 'linear-gradient(135deg,rgb(212, 218, 217) 0%,rgb(208, 243, 232) 100%)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PhotoCameraIcon 
                sx={{ 
                  color: '#00796b', 
                  mr: 1.5, 
                  fontSize: '1.5rem' 
                }} 
              />
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="h6" 
                  fontWeight="600"
                >
                  Evidence Photos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentTicket.images.length} photo{currentTicket.images.length > 1 ? 's' : ''}
                </Typography>
              </Box>
            </Box>

            {currentTicket.images.length > 1 && (
              <Button 
                fullWidth
                variant="outlined"
                onClick={() => setImageExpanded(!imageExpanded)}
                startIcon={imageExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{ 
                  borderColor: '#00796b',
                  color: '#00796b',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'rgba(0, 121, 107, 0.04)',
                    borderColor: '#00796b'
                  }
                }}
              >
                {imageExpanded ? 'Show Less' : 'View All Photos'}
              </Button>
            )}
          </Box>

          <Box sx={{ p: 3, pt: 2 }}>
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 2,
                maxHeight: imageExpanded ? 'none' : '320px',
                overflow: 'hidden'
              }}
            >
              {currentTicket.images
                .slice(0, imageExpanded ? undefined : 1)
                .map((image, index) => (
                <Paper 
                  key={index}
                  elevation={2}
                  sx={{ 
                    borderRadius: 3,
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <picture>
                    <source srcSet={image} />
                    <img
                      src={image}
                      alt={`Ticket evidence ${index + 1}`}
                      style={{
                        width: '100%',
                        maxHeight: '280px',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
                  </picture>

                  <Box 
                    sx={{ 
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      backdropFilter: 'blur(4px)'
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      fontWeight="600"
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Photo {index + 1}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>

            {!imageExpanded && currentTicket.images.length > 1 && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Chip 
                  label={`+${currentTicket.images.length - 1} more photo${currentTicket.images.length > 2 ? 's' : ''}`}
                  sx={{ 
                    bgcolor: '#e0f7f7',
                    color: '#00796b',
                    fontWeight: 600
                  }}
                />
              </Box>
            )}
          </Box>
        </Card>
      )}

      <Paper 
        sx={{ 
          p: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #fff8e1 0%, #f3e5f5 100%)',
          border: '1px solid rgba(0, 121, 107, 0.12)',
          textAlign: 'center'
        }}
      >
        <Button
          onClick={() => handleViewChange('ChallengeTicket')}
          variant="contained"
          size="large"
          fullWidth
          sx={{ 
            bgcolor: theme.palette.primary.dark,
            color: 'white',
            textTransform: 'none',
            fontWeight: 600,
            py: 1.5,
            borderRadius: 2,
          }}
        >
          Challenge Ticket
        </Button>
        <Button
          onClick={handleTicketPayment}
          variant="contained"
          size="large"
          fullWidth
          sx={{
            bgcolor: theme.palette.primary.dark,
            color: 'white',
            textTransform: 'none',
            fontWeight: 600,
            py: 1.5,
            mt: '15px',
            borderRadius: 2,
          }}
        >
          Pay Ticket
        </Button>
      </Paper>
    </Box>
  )
}