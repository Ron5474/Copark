'use client'

import {
  FormControl,
  InputLabel,
  Input,
  InputAdornment,
  IconButton,
  Typography,
  TextField,
} from '@mui/material'
import { useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import { useEnforcement } from '../context/Context'
import { checkPermit } from '../permit/actions'

export default function ManualEntryCard({
  showSearchButton = true,
}: {
  showSearchButton?: boolean
}) {
  const {
    manualInput,
    setManualInput,
    setPlate,
    setIsValidated,
    setPermitResult,
    zone,
    setZone,
  } = useEnforcement()

  const [inputError, setInputError] = useState(false)

  const handleSearch = async () => {
    const trimmed = manualInput.trim()
    const trimmedZone = zone.trim()

    if (!trimmed || !trimmedZone) {
      setInputError(true)
      return
    }

    setInputError(false)

    try {
      const result = await checkPermit(trimmed.toUpperCase(), trimmedZone.toUpperCase())
      setPlate(trimmed.toUpperCase())
      setPermitResult(result)
      setIsValidated(true)
    } catch (err) {
      console.error('Permit check failed:', err)
      setPermitResult({ isValid: false, type: 'N/A', zone: trimmedZone })
      setIsValidated(true)
    }
  }

  return (
    <>
      <FormControl fullWidth variant="standard">
        <InputLabel htmlFor="plate">License Plate</InputLabel>
        <Input
          id="plate"
          value={manualInput}
          onChange={(e) => {
            setManualInput(e.target.value)
            setInputError(false)
          }}
          endAdornment={
            showSearchButton && (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch} aria-label="Search">
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            )
          }
          sx={{ textAlign: 'center' }}
        />
      </FormControl>

      <TextField
        label="Zone"
        variant="standard"
        fullWidth
        sx={{ mt: 2 }}
        value={zone}
        onChange={(e) => setZone(e.target.value)}
      />
      {inputError && (
          <Typography color="error" variant="caption">
            Please enter a license plate and zone
          </Typography>
      )}
    </>
  )
}
