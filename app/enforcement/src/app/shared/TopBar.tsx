'use client'

import { AppBar, Toolbar, Typography } from '@mui/material'
import Image from 'next/image'

export default function EnforcementAppBar() {
  return (
    <AppBar position="fixed" 
      sx={{ 
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#0B1120',
        color: 'white',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        elevation={2}
    >
      <Toolbar>
        <Image
          src="/enforcement/copark-enforce-logo.png"
          alt="CoPark Enforce"
          width={40}
          height={40}
          style={{ width: 'auto', height: '100%' }}
        />
        <Typography variant="h6" sx={{ ml: 2, fontWeight: 'bold' }}>
          Enforcement Dashboard
        </Typography>
      </Toolbar>
    </AppBar>
  )
}
