'use client'

import React, { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material'
import { addAPIUser } from '../../api/actions'

const API_ROLES = ['payroll', 'registrar', 'campusPolice'] as const
type APIRole = typeof API_ROLES[number]

export default function AddAPIUser({ open, onClose }: { open: boolean, onClose: () => void }) {
  const theme = useTheme()
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'payroll' as APIRole // Default role
  })

  const handleSubmit = async () => {
    await addAPIUser(newUser)
    setNewUser({
      name: '',
      email: '',
      role: 'payroll'
    })
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '15px',
          p: 2
        }
      }}
    >
      <DialogTitle sx={{ 
        color: theme.palette.primary.main,
        fontWeight: 700 
      }}>
        Add API User
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Enter organization details
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Organization Name"
            fullWidth
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Organization Email"
            fullWidth
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={newUser.role}
              label="Role"
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value as APIRole })}
            >
              {API_ROLES.map((role) => (
                <MenuItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose}
          sx={{ color: theme.palette.secondary.main }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          sx={{
            bgcolor: theme.palette.primary.main,
            color: '#ffffff',
            '&:hover': {
              bgcolor: theme.palette.primary.dark
            }
          }}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  )
}