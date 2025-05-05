'use client'

import {
  FormControl,
  InputLabel,
  Input,
  InputAdornment,
  IconButton,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useEnforcement } from './Context'

export default function ManualEntryCard() {
  const {
    manualInput,
    setManualInput,
    setPlate,
    setDetectionMethod,
    setCapturedImage,
    setCameraOn,
  } = useEnforcement()

  const handleSearch = () => {
    const trimmed = manualInput.trim()
    if (!trimmed) return
    setPlate(trimmed.toUpperCase())
    setDetectionMethod('manual')
    setCapturedImage(null)
    setCameraOn(false)
  }

  return (
    <FormControl fullWidth variant="standard">
      <InputLabel htmlFor="plate">License Plate</InputLabel>
      <Input
        id="plate"
        value={manualInput}
        onChange={(e) => setManualInput(e.target.value)}
        endAdornment={
          <InputAdornment position="end">
            <IconButton onClick={handleSearch} aria-label="Search">
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        }
        sx={{ textAlign: 'center' }}
      />
    </FormControl>
  )
}
