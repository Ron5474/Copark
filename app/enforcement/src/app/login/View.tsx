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

    setTimeout(() => {
      setLoading(false)
      setError('Invalid credentials')
    }, 1500)
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
            autoFocus
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
/*
#######################################################################
#
# Copyright (C) 2025 David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/
/*
* handling erros
* https://stackoverflow.com/questions/69577451/how-do-you-type-an-error-property-in-a-catch-block-in-typescript
*/

// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import {
//   Container,
//   Box,
//   Typography,
//   TextField,
//   Button,
//   FormControlLabel,
//   Checkbox,
// } from '@mui/material'

// import { login } from './actions'

// export default function LoginView() {
//   const [credentials, setCredentials] = useState({ email: '', password: '' })
//   const [rememberMe, setRememberMe] = useState(false)
//   const [error, setError] = useState('')
//   const [errors, setErrors] = useState({ email: false, password: false })
//   const router = useRouter()

//   useEffect(() => {
//     const storedEmail = window.localStorage.getItem('rememberedEmail')
//     if (storedEmail) {
//       setCredentials((prev) => ({ ...prev, email: storedEmail }))
//     }
//   }, [])

//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target
//     setCredentials((prev) => ({ ...prev, [name]: value }))
//     setErrors((prev) => ({ ...prev, [name]: false }))
//   }
  

//   const validateFields = () => {
//     const newErrors = {
//       email: !credentials.email.trim(),
//       password: !credentials.password.trim(),
//     }
//     setErrors(newErrors)
//     return !newErrors.email && !newErrors.password
//   }

//   const handleClick = async () => {
//     setError('')

//     if (!validateFields()) return

//       const authenticated = await login(credentials)
//       if (authenticated) {
//         window.sessionStorage.setItem('name', authenticated.name)

//         if (rememberMe) {
//           window.localStorage.setItem('rememberedEmail', credentials.email)
//         } else {
//           window.localStorage.removeItem('rememberedEmail')
//         }

//         router.push('/')
//       } else {
//         setError('Invalid credentials')
//       }
//   }

//   return (
//     <Container maxWidth="xs">
//       <Box display="flex" flexDirection="column" alignItems="center" mt={8}>
//         <Typography variant="h5" gutterBottom>Login</Typography>

//         <TextField
//           fullWidth
//           label="Email"
//           name="email"
//           value={credentials.email}
//           onChange={handleInputChange}
//           margin="normal"
//           error={errors.email}
//           helperText={errors.email ? 'Email is required' : ''}
//           autoComplete="email"
//         />

//         <TextField
//           fullWidth
//           label="Password"
//           name="password"
//           type="password"
//           value={credentials.password}
//           onChange={handleInputChange}
//           margin="normal"
//           error={errors.password}
//           helperText={errors.password ? 'Password is required' : ''}
//         />

//         <FormControlLabel
//           control={
//             <Checkbox
//               checked={rememberMe}
//               onChange={(e) => setRememberMe(e.target.checked)}
//               aria-label="check remember Me"
//             />
//           }
//           label="Remember Me"
//         />

//         {error && <Typography color="error" mt={1}>{error}</Typography>}

//         <Button
//           fullWidth
//           variant="contained"
//           color="primary"
//           onClick={handleClick}
//           sx={{ mt: 2 }}
//         >
//            Sign in
//         </Button>
//       </Box>
//     </Container>
//   )
// }
