'use client'

import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material'
import { useState } from 'react'

import LogoutButton from '../login/LogoutButton'

export default function EnforcementNavBar() {
  const [value, setValue] = useState(0)

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
      }}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => setValue(newValue)}
      >
        <BottomNavigationAction label="Plate look-up" />
        <BottomNavigationAction label="Issue Ticket" />
        <LogoutButton />
      </BottomNavigation>
    </Paper>
  )
}
