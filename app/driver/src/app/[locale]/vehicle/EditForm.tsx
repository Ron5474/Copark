'use client'

import { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button
 } from '@mui/material'

/**
 * All MUI components/materials taken from mui.com
 *
 * https://mui.com/material-ui/react-box/
 * https://mui.com/material-ui/react-typography/
 * https://mui.com/material-ui/react-text-field/
 * https://mui.com/material-ui/react-button/
 */

import theme from '../theme'
import { Vehicle } from '../types'
import { editVehicle, deleteVehicle } from './actions'
import { useTranslations } from 'next-intl'


export default function EditForm({ vehicle, close }: { vehicle: Vehicle, close: () => void }) {
  const [isValidEntry, setIsValidEntry] = useState<boolean>(true)
  const [nickname, setNickname] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null) // new
  const [deleting, setDeleting] = useState<boolean>(false)
  const t = useTranslations('garage.edit')

  // new
  const submitEdit = async () => {
    setIsValidEntry(nickname !== vehicle?.nickname)
    setErrorMessage(null)

    try {
      if (!isValidEntry) throw new Error('You can not enter the same nickname')
      await editVehicle({ id: vehicle.id as string, nickname })
      close()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setErrorMessage(message)
      setIsLoading(false)
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
        'display': 'flex',
        'flexDirection': 'column',
        'margin': 'auto',
        'width': '95%',
        // 'height': '100vh',
        'maxWidth': 'calc(100vh * 0.5)',
      }}
    >
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          marginTop: '1vh',
        }}
      >
       {t('edit') + ' - ' + (vehicle?.nickname || `${vehicle.state} ${vehicle.plate}`)}
      </Typography>
        <Box sx={{marginTop: '2vh'}}>
          <Box sx={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
            <Typography variant="body1" sx={{ margin: 0 }}>
              {t('nickname')}
            </Typography>
          </Box>
          <TextField
            required
            fullWidth
            value={nickname || ''}
            error={!!errorMessage}
            helperText={
              errorMessage
            }
            slotProps={{
              input: {
                inputProps: {
                  'aria-label': 'Enter nickname',
                }
              },
            }}
            sx={textFieldStyle}
            size="small"
            onChange={(event) => setNickname(event.target.value)}
          />
        </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          marginTop: '5vh',
          gap: 2,
        }}
      >
        <Button
          onClick={() => {
            setDeleting(true)
          }}
          aria-label='Delete vehicle'
          sx={{
            flex: 1,
            fontSize: '1.15rem',
            textTransform: 'none',
            color: 'white',
            backgroundColor: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.error.dark,
            },
          }}
        >
          {t('delete')}
        </Button>

        <Button
          onClick={(e) => {
            e.preventDefault()
            setIsLoading(true)
            submitEdit()
          }}
          disabled={isLoading}
          aria-label='Save changes'
          sx={{
            flex: 1,
            fontSize: '1.15rem',
            color: 'white',
            backgroundColor: theme.palette.primary.main,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          {t('save')}
        </Button>
      </Box>
      {deleting && <DeleteAlert close={() => setDeleting(false)}
        onDelete={async () => {
          try {
            await deleteVehicle(vehicle.plate, vehicle.state)
            close()
          } catch (error) {
            setErrorMessage("Error deleting vehicle: " + error.message)
            setDeleting(false)
          }
        }}
      />}
    </Box>
  )
}


import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'

function DeleteAlert({ close, onDelete }: { close: () => void, onDelete: () => void }) {
  const t = useTranslations('garage.edit')
  const [open, setOpen] = useState<boolean>(true)

  const handleClose = () => {
    setOpen(false)
    close()
  }

  return (
      <Dialog
        open={open}
        onClose={handleClose}
      >
        <DialogContent>
          <Typography gutterBottom variant='h5' /*sx={{ fontWeight: 500 }}*/>
            {t('warning.title')}
          </Typography>
          <Typography variant='body1'>
          {t('warning.message')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              marginTop: '5vh',
              gap: 2,
            }}
          >
            <Button
              onClick={handleClose}
              autoFocus
              aria-label='Cancel delete'
              sx={{
                flex: 1,
                fontSize: '1.15rem',
                textTransform: 'none',
                color: 'white',
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              {t('cancel')}
            </Button>

            <Button
              onClick={(e) => {
                e.preventDefault()
                onDelete()
              }}
              aria-label='Delete vehicle'
              sx={{
                flex: 1,
                fontSize: '1.15rem',
                textTransform: 'none',
                color: 'white',
                backgroundColor: theme.palette.error.main,
                '&:hover': {
                  backgroundColor: theme.palette.error.dark,
                },
              }}
            >
              {t('delete')}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
  )
}
