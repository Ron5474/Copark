/*
#######################################################################
#
# Copyright (C) 2025 David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/

'use client'

import { Fragment, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Typography,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button
 } from '@mui/material'

/**
 * All MUI components/materials taken from mui.com
 *
 * https://mui.com/material-ui/react-box/
 * https://mui.com/material-ui/react-typography/
 * https://mui.com/material-ui/react-text-field/
 * https://mui.com/material-ui/react-checkbox/
 * https://mui.com/material-ui/react-button/
 */

// import { login } from './actions'


export default function View() {
  const [plateNumber, setPlateNumber] = useState<string>('')
  const [isValidEntry, setIsValidEntry] = useState<boolean>(true)

  const submitVehicle = () => {
    setIsValidEntry(plateNumber.length > 0)
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
        'width': '80%',
        'height': '100vh',
        'maxWidth': 'calc(100vh * 0.5)',
      }}
    >
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          marginTop: '5vh',
        }}
      >
        Add Vehicle
      </Typography>
      <Box sx={{marginTop: '2vh'}}>
        <Typography
          variant="body1"
          sx={{margin: 0}}
        >
          License Plate Number
        </Typography>
        <TextField
          required
          fullWidth
          error={!isValidEntry}
          helperText={
            isValidEntry ?
            "Must be 1-10 characters" :
            "License plate number is required"
          }
          // label="Email"
          placeholder="e.g. 1ABC123"
          value={plateNumber}
          sx={textFieldStyle}
          size="small"
          slotProps={{
            input: {
              inputProps: {
                maxLength: 10,
              },
            },
          }}
          onChange={(event) => setPlateNumber(event.target.value)}
        />
      </Box>
      <Button
        onClick={submitVehicle}
        sx={{
          width: '100%',
          marginTop: '5vh',
          alignSelf: 'end',
          fontSize: '1.0rem',
          color: 'white',
          backgroundColor: '#41A9AB', //(theme) => theme.palette.primary.light
          textTransform: 'none',
        }}
      >
        Continue
      </Button>
    </Box>
  )
}
