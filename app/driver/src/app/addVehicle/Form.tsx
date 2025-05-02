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

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'

/**
 * All MUI components/materials taken from mui.com
 *
 * https://mui.com/material-ui/react-box/
 * https://mui.com/material-ui/react-typography/
 * https://mui.com/material-ui/react-text-field/
 * https://mui.com/material-ui/react-checkbox/
 * https://mui.com/material-ui/react-button/
 */

// import { login } from './actions'


export default function View() {
  const [authenticated, setAuthenticated] = useState<boolean|null>(null)
  const [credentials, setCredentials] = useState({email: '', password: ''})
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()

  const textFieldStyle = {
    '& .MuiInputLabel-root': {fontSize: '0.8rem'},
    '& .MuiFormLabel-asterisk': {display: 'none'},
    '& input::placeholder': {opacity: '0'}, // hides placeholder text
  }

  return (
    <Box
      sx={{
        'display': 'flex',
        'flexDirection': 'column',
        'alignItems': 'center',
        'margin': 'auto',
        'width': '80%',
        'height': '100vh',
        'maxWidth': 'calc(100vh * 0.5)',
      }}
    >
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          textAlign: 'center',
          marginTop: '15vh',
        }}
      >
        CSE187 Assignment 3
      </Typography>
      <TextField
        required
        fullWidth
        error={authenticated === false}
        variant="standard"
        margin="normal"
        label="Email"
        placeholder="Email"
        value={credentials.email}
        sx={textFieldStyle}
        // onChange={(event) => setCredentials({...credentials, email: event.target.value})}
      />
      <TextField
        required
        fullWidth
        error={authenticated === false}
        helperText={authenticated === false ? 'Invalid credentials' : ''}
        variant="standard"
        margin="normal"
        label="Password"
        placeholder="Password"
        type="password"
        sx={textFieldStyle}
        // onChange={(event) => setCredentials({...credentials, password: event.target.value})}
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%', // Ensures the children take up full width
        }}
      >
        <FormGroup sx={{'marginTop': '5vh'}}>
          <FormControlLabel
            control={
              <Checkbox
                aria-label={
                rememberMe ?
                'Disable remember me' :
                'Enable remember me'
                }
                onChange={() => setRememberMe(!rememberMe)}
                sx={{'& .MuiSvgIcon-root': {fontSize: 28}}}
              />
            }
            label="Remember me"
          />
        </FormGroup>
        <Button
          // onClick={authenticate}
          sx={{
            'width': '40%',
            'marginTop': '5vh',
            'alignSelf': 'end',
            'fontSize': '1.0rem',
          }}
        >
          Sign in
        </Button>
      </Box>
    </Box>
  )
}
