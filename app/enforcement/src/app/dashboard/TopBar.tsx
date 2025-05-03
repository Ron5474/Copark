'use client'

import { AppBar, Toolbar, Typography } from '@mui/material'
import Image from 'next/image'

export default function EnforcementAppBar() {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#ffffff', color: 'black' }} elevation={2}>
      <Toolbar>
        <Image
          src="/copark-enforce-logo.png"
          alt="CoPark Enforce"
          width={40}
          height={40}
          style={{ height: 'auto' }}
        />
        <Typography variant="h6" sx={{ ml: 2, fontWeight: 'bold' }}>
          Enforcement Dashboard
        </Typography>
      </Toolbar>
    </AppBar>
  )
}
