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

// 'use client'
// import {useState} from 'react'

import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import GitHubIcon from '@mui/icons-material/GitHub';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import { signIn } from "next-auth/react"
// import {login} from './actions'


export default function LoginView() {
  // const { data: session } = useSession()
  const handleClick = async (provider: string) => {
    const locale = window.location.pathname.split("/")[1]
    await signIn(provider, { callbackUrl: `/${locale}` })
  }

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '65vh',
      }}
    >
      <Stack alignItems="center" spacing={2} sx={{ width: '100%', maxWidth: 300, margin: 'auto', paddingTop: 4 }}>
        <Typography component="h1" variant="h3" sx={{mb: 3}}>
            Log In
        </Typography>
        <Button
          variant="outlined"
          startIcon={<GitHubIcon />}
          fullWidth
          sx={{color: 'black', borderColor: 'black'}}
          onClick={() => {
            console.log('Logging In')
            // login()
            handleClick('github')
          }}
        >
          Sign In With GitHub
        </Button>
        <Button
          variant="outlined"
          startIcon={<GoogleIcon />}
          fullWidth
          sx={{color: 'black', borderColor: 'black'}}
          onClick={() => {
            console.log('Logging In')
            // login()
            handleClick('google')
          }}
        >
          Sign In With Google
        </Button>
        <Button
          variant="outlined"
          startIcon={<FacebookIcon />}
          fullWidth
          sx={{color: 'black', borderColor: 'black'}}
          onClick={() => {
            console.log('Logging In')
            // login()
            handleClick('facebook')
          }}
        >
          Sign In With Facebook
        </Button>
      </Stack>
    </Container>
  );
}