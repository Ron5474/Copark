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
import React from 'react'

import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import GitHubIcon from '@mui/icons-material/GitHub';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';


export default function LoginView() {
  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <Stack alignItems="center" spacing={2} sx={{ width: '100%', maxWidth: 300, margin: 'auto', paddingTop: 4 }}>
        <Typography component="h1" variant="h5" sx={{mb: 3}}>
            Login
        </Typography>
        <Button
          variant="outlined"
          startIcon={<GitHubIcon />}
          fullWidth
        >
          Sign In With GitHub
        </Button>
        <Button
          variant="outlined"
          startIcon={<GoogleIcon />}
          fullWidth
        >
          Sign In With Google
        </Button>
        <Button
          variant="outlined"
          startIcon={<FacebookIcon />}
          fullWidth
        >
          Sign In With Facebook
        </Button>
      </Stack>
    </Container>
  );
}