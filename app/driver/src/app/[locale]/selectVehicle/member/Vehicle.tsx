/**
 * @file Vehicle.tsx
 * @description This file contains the Vehicle page in zone member checkout.
 * @author Bryant Oliver
 */

'use client'

import { Fragment, useEffect } from 'react'
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
import Loader from '../../shared/Loader'
import theme from "../../theme"

export default function MemberVehicles() {
  const [open, setOpen] = useState(false)
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
    setVehicles([])
  }, [])

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
      <Box
        sx={{
          mt: '2vh',
          maxWidth: '95%',
          margin: 'auto',
          textAlign: 'center',
        }}
      >
        {
          loading ? <Box sx={{mt: '12vh'}}><Loader/></Box> :
          vehicles.length

          ?

          <></>
          
          :

          <Fragment>
            <Typography gutterBottom sx={{fontWeight: '600', color: '#6a6a6a', mt: '8vh'}}>
              No vehicles yet
            </Typography>
            <Typography gutterBottom sx={{color: '#6a6a6a'}}>
              Add your vehicle information to start parking
            </Typography>
            <Button
              onClick={handleOpen}
              aria-label='Add a vehicle'
              sx={{
                width: '100%',
                marginTop: '8vh',
                fontSize: '1.15rem',
                color: 'white',
                backgroundColor: theme.palette.primary.main,
                textTransform: 'none',
              }}
            >
              Add Vehicle
            </Button>
          </Fragment>
        }
      </Box>
      </ThemeProvider>
    </Box>
  )
}
