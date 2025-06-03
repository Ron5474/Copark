'use client'

import {
  FormControl,
  InputLabel,
  Input,
  Typography,
  Button,
  Stack,
  // Divider,
  TextField,
  MenuItem,
  Box,
  Alert,
} from '@mui/material'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import SearchIcon from '@mui/icons-material/Search'
import { useState, useEffect } from 'react'
import { useEnforcement } from '../context/Context'
import { checkPermit } from '../permit/actions'
import { scanPlate } from '../camera/actions'
import CameraCapture from './CameraCapture'

export default function ManualEntryCard() {
  const {
    manualInput,
    setManualInput,
    setPlate,
    setIsValidated,
    setPermitResult,
    setTitle,
    setPlateState
  } = useEnforcement()

  useEffect(() => {
    setTitle('Dashboard')
  }, [setTitle])

  const [inputError, setInputError] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [isProcessingCamera, setIsProcessingCamera] = useState(false)
  const [cameraError, setCameraError] = useState<string>('')
  const [state, setState] = useState<string>('')
  const allStates = Object.values(locations).flat()

  const handleSearch = async () => {
    const trimmed = manualInput.trim().toUpperCase()

    if (!trimmed) {
      setInputError(true)
      return
    }

    setInputError(false)

    try {
      const result = await checkPermit(trimmed, state)
      setPlate(trimmed)
      setPlateState(state)
      setPermitResult(result)
      setIsValidated(true)
    } catch (err) {
      console.error('Permit check failed:', err)
      setPermitResult(null)
      setIsValidated(true)
    }
  }

  const handleCameraSubmit = async (imageDataURL: string) => {
    setIsProcessingCamera(true)
    setCameraError('')

    try {
      const detectedData = await scanPlate(imageDataURL)
      
      if (!detectedData.plate || detectedData.plate.trim() === '') {
        throw new Error('No license plate detected in the image. Please try again or enter manually.')
      }

      setManualInput(detectedData.plate)
      setState(`${detectedData.state[0]}${detectedData.state.substring(1,).toLowerCase()}`)
      setPlateState(detectedData.state)
      console.log('state: ', state)
      
      setCameraOpen(false)
      
    } catch (error) {
      setCameraOpen(false)
      console.error('License plate detection failed:', error)
      setCameraError(
        error instanceof Error 
          ? error.message 
          : 'Failed to detect license plate. Please try again or enter manually.'
      )

    } finally {
      setIsProcessingCamera(false)
    }
  }

  const openCamera = () => {
    setCameraError('')
    setCameraOpen(true)
  }

  const closeCamera = () => {
    setCameraOpen(false)
    setIsProcessingCamera(false)
    setCameraError('')
  }

  return (
    <>
      <Stack spacing={3}>
        {cameraError && (
          <Alert 
            severity="error" 
            onClose={() => setCameraError('')}
            sx={{ mb: 1 }}
          >
            {cameraError}
          </Alert>
        )}

        <Button
          variant="outlined"
          fullWidth
          startIcon={<CameraAltIcon />}
          onClick={openCamera}
          size="large"
          sx={{
            py: 1.5,
            borderStyle: 'dashed',
            borderWidth: 2,
            fontSize: '1rem',
          }}
        >
          Scan Plate Using Camera
        </Button>

        <Box>
          <Typography 
            variant="subtitle2" 
            sx={{ mb: 2, textAlign: 'center', color: 'text.secondary' }}
          >
            Edit/Enter Details
          </Typography>
          
          <FormControl fullWidth variant="standard">
            <InputLabel htmlFor="plate">License Plate Number</InputLabel>
            <Input
              id="plate"
              aria-label='License Plate'
              value={manualInput}
              onChange={(e) => {
                setManualInput(e.target.value.toUpperCase())
                setInputError(false)
              }}
              sx={{ 
                textAlign: 'center',
                fontSize: '1.2rem',
                fontFamily: 'monospace',
                letterSpacing: '0.15em',
                fontWeight: 'bold'
              }}
              placeholder="ABC1234"
              inputProps={{
                maxLength: 10,
                style: { textTransform: 'uppercase' }
              }}
            />
          </FormControl>

          {inputError && (
            <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
              Please enter a license plate number
            </Typography>
          )}

          <TextField
            select
            fullWidth
            sx={{mt: 4}}
            onChange={(e) => setState(e.target.value)}
            label='Select State'
            value={allStates.includes(state) ? state : ''}
            slotProps={{
              input: {
                inputProps: {
                  'aria-label': 'Select a state',
                }
              },
            }}
            size="small"
          >
            {allStates.map((state) => (
              <MenuItem key={state} value={state}>
                {state}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            fullWidth
            onClick={handleSearch}
            startIcon={<SearchIcon />}
            sx={{ mt: 2, py: 1.2 }}
            aria-label="Search License Plate"
            disabled={!manualInput.trim() || !state}
          >
            Search License Plate
          </Button>
        </Box>
      </Stack>

      <CameraCapture
        open={cameraOpen}
        onClose={closeCamera}
        onSubmit={handleCameraSubmit}
        isProcessing={isProcessingCamera}
      />
    </>
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