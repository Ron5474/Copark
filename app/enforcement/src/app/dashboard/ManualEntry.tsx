'use client'

import {
  FormControl,
  InputLabel,
  Input,
  InputAdornment,
  IconButton,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

export default function ManualEntryCard({
  plate,
  setPlate,
  onSearch,
}: {
  plate: string
  setPlate: (val: string) => void
  onSearch: () => void
}) {
  return (
    <FormControl fullWidth variant="standard">
      <InputLabel htmlFor="plate">License Plate</InputLabel>
      <Input
        id="plate"
        value={plate}
        onChange={(e) => setPlate(e.target.value)}
        endAdornment={
          <InputAdornment position="end">
            <IconButton onClick={onSearch} aria-label="Search">
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        }
        sx={{ textAlign: 'center' }}
      />
    </FormControl>
  )
}
