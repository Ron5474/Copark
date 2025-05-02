'use client'

import {
  Container,
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Input,
  InputAdornment
} from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import Image from 'next/image'
import { useState } from 'react'

export default function EnforcementLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Both fields are required.')
      return
    }

    setLoading(true)
    setError('')

    // TODO: Replace timeout with real authentication call (POST /api/login)
    setTimeout(() => {
      setLoading(false)

      // TODO: Replace with auth logic, check credentials, store token, redirect
      setError('Invalid credentials')
    }, 1000)
  }

  return (
    <Container maxWidth="xs">
      <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
      <Image
        src="/copark-enforce-logo.png"
        alt="CoPark Enforce"
        width={80}
        height={80}
        style={{ height: 'auto', width: 'auto' }}
        priority
      />


        <Typography variant="h5" fontWeight="bold">
          Enforcement Login
        </Typography>

        <FormControl fullWidth variant="standard">
          <InputLabel htmlFor="email">Your Email</InputLabel>
          <Input
            id="email"
            type="email"
            value={email}
            // autoFocus
            onChange={(e) => setEmail(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <EmailIcon />
              </InputAdornment>
            }
          />
        </FormControl>

        <FormControl fullWidth variant="standard">
          <InputLabel htmlFor="password">Password</InputLabel>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <LockIcon />
              </InputAdornment>
            }
          />
        </FormControl>

        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}

        <Button
          variant="contained"
          fullWidth
          onClick={handleLogin}
          disabled={loading}
          sx={{ backgroundColor: '#b2f2bb', color: 'black', fontWeight: 'bold' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>

        <Typography variant="caption" sx={{ mt: 2 }}>
          Secure access for enforcement officers only
        </Typography>
      </Box>
    </Container>
  )
}
