/**
 * @file selectVehicle.test.tsx
 * @description This file contains the test cases for the Vehicle page in zone checkout.
 * @author Bryant Oliver
 */

'use client'

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
 } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { ThemeProvider } from '@mui/material/styles'
import { useState } from 'react'

import ShortTermStepper from '../../shortTerm/ProgressStepper'
import AddForm from '../AddForm'
import theme from "../../theme"

export default function MemberVehicles() {
  const [open, setOpen] = useState(false)

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  return (
    <Box sx={{ mt: '90px' }}>
      <ThemeProvider theme={theme}>
      <ShortTermStepper/>
      <Box sx={{
          maxWidth: '95%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: 'auto',
          marginTop: '1vh',
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
        >
          Which Vehicle?
        </Typography>
        <Button
          onClick={handleOpen}
          aria-label='Add a vehicle'
          sx={{
            width: '150px',
            alignSelf: 'end',
            fontSize: '1.15rem',
            color: theme.palette.primary.dark,
            backgroundColor: theme.palette.primary.light,
            textTransform: 'none',
            borderRadius: '25px',
          }}
        >
          + Add Vehicle
        </Button>
        <Dialog
          open={open}
          onClose={(event, reason) => {
            if (reason !== 'backdropClick') handleClose()
          }}
          fullWidth
        >
          <DialogContent sx={{ p: 1, pb: 2, position: 'relative' }}>
            <IconButton
              onClick={handleClose}
              aria-label="Close"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1,
                backgroundColor: 'white',
                '&:hover': {
                  backgroundColor: '#f0f0f0',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
            <AddForm />
          </DialogContent>
        </Dialog>
      </Box>
      </ThemeProvider>
    </Box>
  )
}
