'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  MenuItem,
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

// import { login } from './actions'


export default function View() {
  const [plateNumber, setPlateNumber] = useState<string>('')
  const [isValidEntry, setIsValidEntry] = useState<boolean>(true)
  const [country, setCountry] = useState<string>(Object.keys(locations)[0])
  const [state, setState] = useState<string>(Object.values(locations)[0][0])

  const submitVehicle = () => {
    setIsValidEntry(plateNumber.length > 0)
  }

  useEffect(() => {
    setState(locations[country][0])
  }, [country])

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
      <Box sx={{marginTop: '2vh'}}>
        <Typography
          variant="body1"
          sx={{margin: 0}}
        >
          Country
        </Typography>
        <TextField
          select
          fullWidth
          value={country}
          size="small"
        >
          {Object.keys(locations).map((country) => (
            <MenuItem key={country} value={country} onClick={() => setCountry(country)}>
              {country}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      <Box sx={{marginTop: '2vh'}}>
        <Typography
          variant="body1"
          sx={{margin: 0}}
        >
          State
        </Typography>
        <TextField
          select
          fullWidth
          value={state}
          size="small"
        >
          {locations[country].map((state) => (
            <MenuItem key={state} value={state} onClick={() => setState(state)}>
              {state}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      <Button
        onClick={submitVehicle}
        sx={{
          width: '100%',
          marginTop: '5vh',
          alignSelf: 'end',
          fontSize: '1.0rem',
          color: 'white',
          backgroundColor: (theme) => theme.palette.primary.main,
          textTransform: 'none',
        }}
      >
        Continue
      </Button>
    </Box>
  )
}


const locations = {
  "United States": [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming"
  ],
  "Canada": [
    "Alberta",
    "Manitoba",
    "New Brunswick",
    "Newfoundland and Labrador",
    "Northwest Territories",
    "Nova Scotia",
    "Nunavut",
    "Ontario",
    "Prince Edward Island",
    "Quebec",
    "Saskatchewan",
    "Yukon"
  ],
  "Mexico": [
    "Aguascalientes",
    "Baja California",
    "Baja California Sur",
    "Campeche",
    "Chiapas",
    "Chihuahua",
    "Coahuila",
    "Colima",
    "Durango",
    "Guanajuato",
    "Guerrero",
    "Hidalgo",
    "Jalisco",
    "Mexico",
    "Michoacan",
    "Morelos",
    "Nayarit",
    "Nuevo Leon",
    "Oaxaca",
    "Puebla",
    "Queretaro",
    "Quintana Roo",
    "San Luis Potosi",
    "Sinaloa",
    "Sonora",
    "Tabasco",
    "Tamaulipas",
    "Tlaxcala",
    "Veracruz",
    "Yucatan",
    "Zacatecas"
  ]
} as Record<string, string[]>
