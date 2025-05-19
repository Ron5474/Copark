'use client'

import { useEffect } from 'react'
import { Box, Paper, Typography, Button } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

type SuccessMessageProps = {
  title: string
  message: string
  buttonText: string
  onButtonClick: () => void
}

export default function SuccessMessage({
  title,
  message,
  buttonText,
  onButtonClick,
}: SuccessMessageProps) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onButtonClick()
    }, 2500)

    return () => clearTimeout(timeout)
  }, [onButtonClick])

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
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
          {title}
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {message}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Redirecting back automatically...
        </Typography>

        <Button variant="contained" fullWidth onClick={onButtonClick}>
          {buttonText}
        </Button>
      </Paper>
    </Box>
  )
}
