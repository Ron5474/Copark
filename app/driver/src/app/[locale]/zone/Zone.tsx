'use client'

import { useState, useContext } from 'react'
import {
  Box,
  Button,
  Typography,
  TextField,
} from '@mui/material'

import { getZoneDetails } from './actions'
import ZoneContext from './Context'
import theme from '../theme'


export default function Zone() {
  const { zoneNumber, setZoneNumber, setZoneDetails, next } = useContext(ZoneContext)
  const [zoneExists, setZoneExists] = useState<boolean>(true)
  const [isValidEntry, setIsValidEntry] = useState<boolean>(true)
  const [isFree, setIsFree] = useState<boolean>(false)

  const submitZone = async () => {
    setIsValidEntry(zoneNumber.length > 0)
    if (zoneNumber.length > 0) {
      try {
        const zoneDetails = await getZoneDetails(zoneNumber)
        setZoneDetails(zoneDetails)
        setZoneExists(true)

        const now = new Date()
        const nowStr = now.toTimeString().slice(0, 5)
        const isOpen = zoneDetails?.openTime && zoneDetails?.closeTime 
          ? nowStr >= zoneDetails.openTime && nowStr < zoneDetails.closeTime 
          : true

        if ((zoneDetails?.hourly) && isOpen)
          next()
        else
          setIsFree(true)
      } catch {
        setZoneExists(false)
      }
    }
  }

  const textFieldStyle = {
    margin: 0,
    mt: '5px',
    '& .MuiInputLabel-root': {fontSize: '0.8rem'},
    '& .MuiFormHelperText-root': {
      textAlign: 'left',
      margin: 0,
      mt: '5px',
    },
  }

  return (
    <Box
      sx={{
        width: '92%',
        display: 'flex',
        flexDirection: 'column',
        margin: 'auto',
        maxWidth: 'calc(100vh * 0.5)',
      }}
    >
      <Typography
        variant="h3"
        gutterBottom
        sx={{
          marginTop: '1vh',
        }}
      >
        Where are you parking?
      </Typography>
      <Box sx={{marginTop: '1vh'}}>
        <Typography
          variant="body1"
          sx={{margin: 0}}
        >
          Zone #
        </Typography>
        <TextField
          required
          fullWidth
          error={!isValidEntry}
          value={zoneNumber}
          sx={textFieldStyle}
          size="small"
          slotProps={{
            input: {
              inputProps: {
                'aria-label': 'Enter parking zone number',
              },
            },
          }}
          onChange={(event) => setZoneNumber(event.target.value)}
        />
        {
          !isValidEntry && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              Zone number is required
            </Typography>
          )

          ||

          !zoneExists && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              Zone does not exist
            </Typography>
          )
        }
      </Box>
      <Button
        onClick={submitZone}
        sx={{
          width: '100%',
          marginTop: '5vh',
          alignSelf: 'end',
          fontSize: '1.15rem',
          color: 'white',
          backgroundColor: theme.palette.primary.main,
          textTransform: 'none',
        }}
      >
        Confirm Zone
      </Button>
      {isFree && <FreeAlert/>}
    </Box>
  )
}



import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import { DashboardContext } from "../dashboard/context";

function FreeAlert() {
  const { zoneDetails } = useContext(ZoneContext)
  const { setCurrentPage } = useContext(DashboardContext)
  const [open, setOpen] = useState<boolean>(true)

  const isFreeDay = !zoneDetails?.openTime && !zoneDetails?.closeTime
  // TODO tell user when next charge will be

  const handleClose = () => {
    setCurrentPage('dashboard')
    setOpen(false)
  }

  return (
      <Dialog
        open={open}
        onClose={handleClose}
      >
        <DialogContent>
          <Typography variant='body1'>
            { isFreeDay
            
              ?

              `This zone is not charging today. Check back tomorrow!` 

              :

              `This zone is currently closed. No payment is currently necessary. Please check our hours.`
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            autoFocus
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              fontSize: 15,
              textTransform: 'none'
            }}
          >
            Okay
          </Button>
        </DialogActions>
      </Dialog>
  )
}