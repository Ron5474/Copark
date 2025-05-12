'use client'

import React, { useState } from 'react'
import { 
  Box, 
  Button, 
  Paper, 
  Typography, 
  IconButton, 
  useTheme 
} from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import HomeIcon from '@mui/icons-material/Home'
import AddAPIUser from './AddAPIUser'

export default function ManageAPIUsers({ onNavigate }: { onNavigate: (page: string) => void }) {
  const theme = useTheme()
  const [openAddDialog, setOpenAddDialog] = useState(false)

  return (
    <Box sx={{ 
      p: 4,
      bgcolor: '#ffffff'
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 4,
        borderBottom: `2px solid ${theme.palette.primary.main}`,
        pb: 2
      }}>
        <img src="/assets/admin_logo.png" alt="CoPark Admin" style={{ height: 60, marginRight: 16 }} />
        <Typography 
          variant="h4" 
          sx={{ 
            color: theme.palette.primary.main,
            fontWeight: 700,
            fontSize: "32px"
          }}
        >
          Manage API Users
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setOpenAddDialog(true)}
          sx={{
            bgcolor: theme.palette.primary.main,
            color: '#ffffff',
            '&:hover': {
              bgcolor: theme.palette.primary.dark
            }
          }}
        >
          Add API User
        </Button>
      </Box>

      <Paper sx={{
        p: 3,
        background: '#ffffff',
        maxWidth: 900,
        mx: 'auto',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        borderRadius: '15px'
      }}>
        <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
          No API users found
        </Typography>
      </Paper>

      <IconButton
        onClick={() => onNavigate('home')}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: theme.palette.primary.main,
          color: '#ffffff',
          '&:hover': {
            bgcolor: theme.palette.primary.dark
          }
        }}
      >
        <HomeIcon />
      </IconButton>

      <AddAPIUser 
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
      />
    </Box>
  )
}