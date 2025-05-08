'use client'

import { useState, useContext } from 'react'
import {
  Box,
  Button,
  Typography,
  TextField,
} from '@mui/material'

import ZoneContext from './Context'
import theme from '../theme'


export default function Zone() {
  const { zoneNumber, setZoneNumber, next } = useContext(ZoneContext)
  const [isValidEntry, setIsValidEntry] = useState<boolean>(true)

  const submitZone = async () => {
    setIsValidEntry(zoneNumber.length > 0)
    if (zoneNumber.length > 0) next()
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
        'height': '100vh',
        'maxWidth': 'calc(100vh * 0.5)',
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
          helperText={
            isValidEntry ?
            null :
            "Zone number is required"
          }
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
    </Box>
  )
}