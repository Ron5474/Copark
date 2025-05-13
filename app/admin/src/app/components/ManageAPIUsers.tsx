'use client'

import React, { useState, useEffect } from 'react'
import { 
  Box, 
  Button, 
  Paper, 
  Typography, 
  IconButton, 
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import HomeIcon from '@mui/icons-material/Home'
import AddAPIUser from './AddAPIUser'
import { getAPIUsers, APIUser } from '@/api/actions'

export default function ManageAPIUsers({ onNavigate }: { onNavigate: (page: string) => void }) {
  const theme = useTheme()
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [apiUsers, setApiUsers] = useState<APIUser[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      const users = await getAPIUsers()
      setApiUsers(users)
    } catch (error) {
      console.error('Failed to fetch API users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

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
        <img src="/admin/assets/logo-notitle.png" alt="CoPark Admin" style={{ height: 60, marginRight: 16 }} />
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
        {loading ? (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
            Loading...
          </Typography>
        ) : apiUsers.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
            No API users found
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  {/* <TableCell>API Key</TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {apiUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    {/* <TableCell>
                      <Typography 
                        sx={{ 
                          fontFamily: 'monospace',
                          fontSize: '0.875rem'
                        }}
                      >
                        {user.id}
                      </Typography>
                    </TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
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
        onUserAdded={fetchUsers}  // Add this prop
      />
    </Box>
  )
}