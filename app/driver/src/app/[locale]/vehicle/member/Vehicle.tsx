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
import EditForm from '../EditForm'
import Loader from '../../shared/Loader'
import theme from '../../theme'
import { Vehicle } from '../../types'
import { getDefaultVehicle, getVehicles, updateDefaultVehicle } from '../actions'
import { useTranslations } from 'next-intl'


export default function MemberVehicles({ isCheckout = false }: { isCheckout?: boolean }) {
  const { setVehicle, next } = useContext(ZoneContext)
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVID, setSelectedVID] = useState<string | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
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

  const handleAddOpen = () => setAddOpen(true)
  const handleAddClose = () => setAddOpen(false)
  const handleAdd = async () => {
    setAddOpen(false)
    setLoading(true)
    setVehicles(await getVehicles())
    setLoading(false)
  }

  const handleEditOpen = () => setEditOpen(true)
  const handleEditClose = () => setEditOpen(false)
  const handleEdit = async () => {
    const res = await getVehicles()
    setEditOpen(false)
    setLoading(true)
    setVehicles(res)
    setSelectedVehicle(res.find((v: Vehicle) => v.id === (selectedVehicle as Vehicle).id) || null)
    setLoading(false)
  }

  const handleDelete = async () => {
    const res = await getVehicles()
    setEditOpen(false)
    setLoading(true)
    setVehicles(res)
    setLoading(false)
  }

  const setDefaultVehicle = async (vid: string) => {
    const vehicle = vehicles.find(v => v.id === vid)
    if (vehicle && vehicle.id) {

      await updateDefaultVehicle(vehicle.id)
      setVehicles(await getVehicles())
    }
  }

  const handleButton = () => {
    if (!selectedVID) {
      setIsValidSelection(false)
      return
    }

    if (isCheckout)
      next()
    else {
      handleEditOpen()
    }
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
          onClick={handleAddOpen}
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
        {(addOpen && (
          <Dialog
            open={addOpen}
            onClose={(event, reason) => {
              if (reason !== 'backdropClick') handleAddClose()
            }}
            fullWidth
          >
            <DialogContent sx={{ p: 1, pb: 2, position: 'relative' }}>
              <IconButton
                onClick={handleAddClose}
                aria-label="Close form to add vehicle"
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
        )) || (editOpen && (
          <Dialog
            open={editOpen}
            onClose={(event, reason) => {
              if (reason !== 'backdropClick') handleEditClose()
            }}
            fullWidth
          >
            <DialogContent sx={{ p: 1, pb: 2, position: 'relative' }}>
              <IconButton
                onClick={handleEditClose}
                aria-label="Close form to edit vehicle"
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
              <EditForm
                close={{
                  edit: handleEdit,
                  delete: handleDelete
                }}
                vehicle={selectedVehicle as Vehicle}
              />
            </DialogContent>
          </Dialog>
        ))}
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
                  setVehicle(vehicles.find((v: Vehicle) => v.id === event.target.value) as Vehicle)
                  setSelectedVehicle(vehicles.find((v: Vehicle) => v.id === event.target.value) as Vehicle)
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
              onClick={handleAddOpen}
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
