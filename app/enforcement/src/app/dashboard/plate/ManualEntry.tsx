'use client'

import {
  FormControl,
  InputLabel,
  Input,
  Typography,
  Button,
  Stack,
} from '@mui/material'
import { useState } from 'react'
import { useEnforcement } from '../context/Context'
import { checkPermit } from '../permit/actions'
import { useEffect } from 'react'

export default function ManualEntryCard() {
  const {
    manualInput,
    setManualInput,
    setPlate,
    setIsValidated,
    setPermitResult,
    setTitle,
  } = useEnforcement()

  useEffect(() => {
    setTitle('Dashboard')
  }, [setTitle])

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
      setPermitResult(null)
      setIsValidated(true)
    }
  }

  return (
    <Stack spacing={2}>
      <FormControl fullWidth variant="standard">
        <InputLabel htmlFor="plate">License Plate</InputLabel>
        <Input
          id="plate"
          value={manualInput}
          onChange={(e) => {
            setManualInput(e.target.value)
            setInputError(false)
          }}
          sx={{ textAlign: 'center' }}
        />
      </FormControl>

      {inputError && (
        <Typography color="error" variant="caption">
          Please enter a license plate
        </Typography>
      )}

      <Button
        variant="contained"
        fullWidth
        onClick={handleSearch}
        aria-label="Search License Plate"
      >
        Search
      </Button>
    </Stack>
  )
}
