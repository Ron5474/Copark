'use client'

import {  useEffect, useCallback } from 'react'
import { Box, Paper, Typography, Button } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useTicketState } from './TicketContext'


export default function SuccessMessage() {
  const { setCurrentView } = useTicketState()

  const onButtonClick = useCallback(() => {
    setCurrentView('TicketList')
  }, [setCurrentView])
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      onButtonClick()
    }, 2500)

    return () => clearTimeout(timeout)
  }, [onButtonClick, setCurrentView])

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 2,
      }}
    >
      <Paper
        sx={{
          p: 3,
          maxWidth: 'md',
          width: '100%',
          textAlign: 'center',
          borderRadius: 1,
        }}
      >
        <Box
          sx={{
            mx: 'auto',
            mb: 2,
            width: 64,
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            bgcolor: 'success.100',
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 32, color: 'success.main' }} />
        </Box>

        <Typography variant="h5" component="h2" sx={{ mb: 1, fontWeight: 'bold' }}>
          Ticket Challenged Successfully
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          We have successfully received your challenge request. Our team will review it and get back to you in 2 - 4 weeks.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Redirecting back automatically...
        </Typography>

        <Button variant="contained" fullWidth onClick={onButtonClick}>
          Go Back To Ticket
        </Button>
      </Paper>
    </Box>
  )
}
