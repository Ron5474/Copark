'use client'

import {
  FormControl,
  InputLabel,
  Input,
  InputAdornment,
  IconButton,
  Typography,
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
  } = useEnforcement()

  const [inputError, setInputError] = useState(false)

  const handleSearch = async () => {
    const trimmed = manualInput.trim().toUpperCase()

    if (!trimmed) {
      setInputError(true)
      return
    }

    setInputError(false)

    try {
      const result = await checkPermit(trimmed)
      setPlate(trimmed)
      setPermitResult(result)
      setIsValidated(true)
    } catch (err) {
      console.error('Permit check failed:', err)
      setPermitResult({ isValid: false, type: 'Error', area: 'N/A' })
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

      {inputError && (
        <Typography color="error" variant="caption">
          Please enter a license plate
        </Typography>
      )}
    </>
  )
}
