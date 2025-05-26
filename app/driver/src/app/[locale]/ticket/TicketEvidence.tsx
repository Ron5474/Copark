'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Paper from '@mui/material/Paper'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'


import { useTicketState } from './TicketContext'

export default function TicketEvidence() {
  const { currentTicket } = useTicketState()

  return (
  <Box>
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
                  1 photo
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ p: 3, pt: 2 }}>
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 2,
                maxHeight: '320px',
                overflow: 'hidden'
              }}
            >
            <Paper
              elevation={2}
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <picture>
                <source srcSet={currentTicket.images} />
                <img
                  src={currentTicket.images}
                  alt={`Ticket evidence 1`}
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
                  Photo 1
                </Typography>
              </Box>
            </Paper>
            </Box>
          </Box>
        </Card>
      )}
  </Box>
  )
}