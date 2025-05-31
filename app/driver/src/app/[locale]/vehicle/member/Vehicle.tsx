/**
 * @file Vehicle.tsx
 * @description This file contains the Vehicle page in zone member checkout.
 * @author Bryant Oliver
 */

'use client'

import { Fragment, useEffect, useState, useContext } from 'react'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

import ZoneContext from '../../zone/Context'
import AddForm from '../AddForm'
import Loader from '../../shared/Loader'
import theme from '../../theme'
import { Vehicle } from '../../types'
import { getDefaultVehicle, getVehicles, updateDefaultVehicle } from '../actions'
import { useTranslations } from 'next-intl'


export default function MemberVehicles({ isCheckout = false }: { isCheckout?: boolean }) {
  const { setVehicle, next } = useContext(ZoneContext)
  const [open, setOpen] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVID, setSelectedVID] = useState<string | null>(null)
  const [isValidSelection, setIsValidSelection] = useState<boolean>(true)
  const [loading, setLoading] = useState(true)
  const t = useTranslations('garage')

  useEffect(() => {
    (async () => {
      const fetchedVehicles = await getVehicles()
      setVehicles(fetchedVehicles)
      setLoading(false)
    })()
    let vid: string | null = null;
    (async () => {
      const res = await getDefaultVehicle()
      if (res && res.id) {
        vid = res.id
        if (isCheckout) {
          setSelectedVID(vid)
        }
      } else {
        vid = null
      }
    })()
  }, [setSelectedVID, isCheckout])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const handleAdd = async () => {
    setOpen(false)
    setLoading(true)
    setVehicles(await getVehicles())
    setLoading(false)
  }

  const setDefaultVehicle = async (vid: string) => {
    const vehicle = vehicles.find(v => v.id === vid)
    if (vehicle && vehicle.id) {
      // Assuming you have a function to set the default vehicle
      await updateDefaultVehicle(vehicle.id)
      setVehicles(await getVehicles())
    }
  }

  const handleButton = () => {
    if (!selectedVID) {
      setIsValidSelection(false)
      return
    }
    setVehicle(vehicles.find((v: Vehicle) => v.id === selectedVID))
    if (isCheckout)
      next()
    else
      console.log("edit")
  }

  return (
    <Fragment>
      <Box sx={{
          maxWidth: '92%',
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
          {isCheckout ? t("checkout.title") : t("title") }
        </Typography>
        <Button
          onClick={handleOpen}
          aria-label='Add a vehicle'
          sx={{
            padding: '8px 16px',
            alignSelf: 'end',
            fontSize: '1.15rem',
            color: theme.palette.primary.dark,
            backgroundColor: theme.palette.primary.light,
            textTransform: 'none',
            borderRadius: '25px',
          }}
        >
          + {t("add vehicle")}
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
          maxWidth: '92%',
          margin: 'auto',
          textAlign: 'center',
        }}
      >

        {

          loading ? <Box sx={{mt: '8vh'}}><Loader/></Box> :
          vehicles.length 
          
          ?

          <Box sx={{ mt: 2 }}>
            <Typography sx={{ textAlign: 'left', mb: 1, color: '#4b4b4b' }}>
              {t("subtitle")}
            </Typography>

            <Box
              sx={{
                border: '1px solid',
                borderColor: isValidSelection ? '#ccc' : 'error.main',
                borderRadius: '5px',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
            >
              <RadioGroup
                value={selectedVID}
                onChange={(event) => {
                  setSelectedVID(event.target.value)
                  setIsValidSelection(true)
                }}
              >
                {vehicles.map((v, i) => (
                  <FormControlLabel
                    key={i}
                    value={v.id}
                    control={<Radio sx={{ transform: 'scale(1.2)' }} />}
                    label={
                      <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1}}>
                            <Box sx={{ display: 'flex', alignItems: 'center'}}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {v.plate}{' '}
                              <Typography component="span" variant="body1" sx={{ fontWeight: 400 }}>
                                {v.state}
                              </Typography>
                            </Typography>
                            {v.default && v.default==true && <Chip label={t("default")} size='small' sx={{
                              backgroundColor: '#dcfce7',
                              color: '#166534',
                              fontWeight: 600,
                              marginLeft: 4
                            }}/>}
                          </Box>
                        {v.nickname && (
                          <Typography variant="body2" sx={{ textAlign: 'left', color: '#666', mt: 0.5 }}>
                            {v.nickname}
                          </Typography>
                        )}
                      </Box>
                    }
                    sx={{
                      m: 0,
                      px: 2,
                      py: 1.5,
                      width: '100%',
                      display: 'flex',
                      borderTop: i !== 0 ? '1px solid #ccc' : 'none',
                      backgroundColor: selectedVID === v.id ? '#f5f5f5' : 'white',
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        backgroundColor: '#f9f9f9',
                      },
                    }}
                  />
                ))}
              </RadioGroup>
            </Box>

            {!isValidSelection && (
              <Typography color="error" variant="body2" sx={{ mt: 1, textAlign: 'left' }}>
                {t("selectVehicleError")}
              </Typography>
            )}

            <Button
              fullWidth
              variant="contained"
              onClick={handleButton}
              sx={{
                width: '100%',
                marginTop: '5vh',
                fontSize: '1.15rem',
                color: 'white',
                backgroundColor: theme.palette.primary.main,
                textTransform: 'none',
              }}
            >
              {isCheckout ? t("checkout.continue") : t("edit")}
            </Button>
            {!isCheckout && selectedVID && (
              vehicles.find(v => v.id === selectedVID)?.default !== true
            ) && (
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setDefaultVehicle(selectedVID)}
                sx={{
                  width: '100%',
                  marginTop: '1vh',
                  fontSize: '1.15rem',
                  color: theme.palette.primary.main,
                  border: `solid  ${theme.palette.primary.main} 2px`,
                  fontWeight: 600,
                  textTransform: 'none',
                }}>
                {t("setDefault")}
                </Button>
            )}
          </Box>
          
          :

          <Fragment>
            <Typography gutterBottom sx={{fontWeight: '600', color: '#6a6a6a', mt: '8vh'}}>
              {t("noVehicles")}
            </Typography>
            <Typography gutterBottom sx={{color: '#6a6a6a'}}>
              {t("prompt")}
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
              {t("add vehicle")}
            </Button>
          </Fragment>

        }

      </Box>
    </Fragment>
  )
}
