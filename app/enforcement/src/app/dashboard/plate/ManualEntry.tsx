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

export default function ManualEntryCard({
  showSearchButton = true,
  inputError,
  setInputError,
}: {
  showSearchButton?: boolean
  inputError?: boolean
  setInputError?: (val: boolean) => void
}) {
  const {
    manualInput,
    setManualInput,
    setPlate,
    setIsValidated,
  } = useEnforcement()

  const [internalError, setInternalError] = useState(false)

  const error = inputError ?? internalError
  const setError = setInputError ?? setInternalError

  const handleSearch = () => {
    const trimmed = manualInput.trim()
    if (!trimmed) {
      setError(true)
      return
    }
    setError(false)
    setPlate(trimmed.toUpperCase())
    setIsValidated(true)
  }

  return (
    <FormControl fullWidth variant="standard">
      <InputLabel htmlFor="plate">License Plate</InputLabel>
      <Input
        id="plate"
        value={manualInput}
        onChange={(e) => {
          setManualInput(e.target.value)
          setError(false)
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
      {error && (
        <Typography color="error" variant="caption">
          Please enter a license plate
        </Typography>
      )}

    </FormControl>
  )
}
