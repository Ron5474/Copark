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
import { useRouter } from 'next/navigation'

import { login } from './actions'

export default function EnforcementLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    setLoading(true)
    setError('')

    const authenticated = await login({ email, password })
    if (authenticated) {
      window.sessionStorage.setItem('name', authenticated.name);
      router.push('/');
    } else {
      setError('Invalid credentials')
    }
    
    setLoading(false);
  
  }

  return (
    <Container maxWidth="xs">
      <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
      <Image
        src="/enforcement/assets/copark-enforce-logo.png"
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
          aria-label='login-button'
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
