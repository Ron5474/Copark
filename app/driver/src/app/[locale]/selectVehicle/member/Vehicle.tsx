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
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useState } from 'react'

import AddForm from '../AddForm'
import Loader from '../../shared/Loader'
import theme from '../../theme'
import { Vehicle } from '../../types'
import { getVehicles } from '../actions'


export default function MemberVehicles({ isCheckout = false }: { isCheckout?: boolean }) {
  const [open, setOpen] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedPlate, setSelectedPlate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const fetchedVehicles = await getVehicles()
      setVehicles(fetchedVehicles)
      setLoading(false)
    })()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const handleAdd = async () => {
    setOpen(false)
    setLoading(true)
    setVehicles(await getVehicles())
    setLoading(false)
  }

  const handleButton = () => {
    const vehicle = vehicles.find((v: Vehicle) => v.plate === selectedPlate);
    if (isCheckout)
      console.log("next: ", vehicle)
    else
      console.log("edit: ", vehicle)
  };

  return (
    <Fragment>
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
          {isCheckout ? "Which Vehicle?" : "Your Vehicles"}
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
        {open && (
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
                aria-label="Close vehicle form"
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
              <AddForm close={handleAdd}/>
            </DialogContent>
          </Dialog>
        )}
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

          <RadioGroup
            name="vehicle-selection"
            value={selectedPlate}
            onChange={(event) => setSelectedPlate(event.target.value)}
            sx={{ mt: 2 }}
          >
            <Typography sx={{ textAlign: 'left', mb: 1, color: '#4b4b4b' }}>
              Vehicle Preference
            </Typography>

            {vehicles.map((v, i) => (
              <FormControlLabel
                key={i}
                value={v.plate}
                control={<Radio sx={{transform: 'scale(1.2)'}}/>}
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {v.plate}{' '}
                      <Typography component="span" variant="body1" sx={{ fontWeight: 400 }}>
                        {v.state}
                      </Typography>
                    </Typography>
                    {v.nickname && (
                      <Typography variant="body2" sx={{ textAlign: 'left', color: '#666', mt: 0.5 }}>
                        {v.nickname}
                      </Typography>
                    )}
                  </Box>
                }
                sx={{
                  width: '100%',
                  m: 0,
                  mb: 2,
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: 2,
                  alignItems: 'flex-start',
                  minHeight: '72px',
                  backgroundColor: selectedPlate === v.plate ? '#f5f5f5' : 'white',
                }}
              />
            ))}

            <Button
              fullWidth
              variant="contained"
              onClick={handleButton}
              disabled={!selectedPlate}
              sx={{
                width: '100%',
                marginTop: '5vh',
                fontSize: '1.15rem',
                color: 'white',
                backgroundColor: theme.palette.primary.main,
                textTransform: 'none',
              }}
            >
              {isCheckout ? "Continue" : "Edit"}
            </Button>
          </RadioGroup>
          
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
    </Fragment>
  )
}
