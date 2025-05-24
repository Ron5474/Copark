'use client'

import { AppBar, Toolbar, Typography, Box } from '@mui/material'
import Image from 'next/image'
import LogoutButton from '../login/LogoutButton'
import { useEnforcement } from '../dashboard/context/Context'

export default function EnforcementAppBar() {
  const { title } = useEnforcement()
  return (
    <AppBar
      color="primary"
      position="fixed"
      sx={{
        top: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
      elevation={2}
    >
      <Toolbar>
        <Image
          src="/enforcement/assets/copark-enforce-logo.png"
          alt="CoPark Enforce"
          width={40}
          height={40}
          style={{ width: 'auto', height: '100%' }}
        />
        <Typography variant="h6" sx={{ ml: 2, fontWeight: 'bold' }}>
          {title}
        </Typography>

        <Box sx={{ ml: 'auto' }}>
          <LogoutButton />
        </Box>
      </Toolbar>
    </AppBar>
  )
}
