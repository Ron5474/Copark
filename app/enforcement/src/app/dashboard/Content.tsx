'use client'

import {
  Box,
  Button,
  Container,
  Typography,
  FormControl,
  InputLabel,
  Input,
  InputAdornment,
  IconButton,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useState } from 'react'

export default function EnforcementDashboardView() {
  const [plate, setPlate] = useState('')
  const [scanFailed, setScanFailed] = useState(false)

  const handleScan = () => {
    setTimeout(() => setScanFailed(true), 500)
  }

  const handleRetry = () => {
    // Simulate scan attempt
    setScanFailed(false)
    setPlate('')
  }

  const handleSearch = () => {
    console.log('Searching for plate:', plate)
    // TODO: search API call or route to results
  }

  return (
    // <Box sx={{ bgcolor: '#90caf9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <Container maxWidth="xs" sx={{ py: 3 }}>
      <Typography align="center" fontWeight="bold" mt={2} mb={1}>
        Camera Feed
      </Typography>

      <Box sx={{ width: '100%', height: 180, bgcolor: '#ccc', borderRadius: 2 }} />

      <Button fullWidth sx={{ mt: 2, bgcolor: '#e0ffff' }} onClick={handleScan}>
        Scan License Plate
      </Button>

      {scanFailed && (
        <Button fullWidth sx={{ mt: 2, bgcolor: '#e0ffff' }} onClick={handleRetry}>
          Retry
        </Button>
      )}

      <Box display="flex" alignItems="center" mt={3} mb={1}>
        <Box sx={{ flex: 1, height: 1, bgcolor: 'red' }} />
        <Typography variant="body2" sx={{ mx: 2, fontWeight: 'bold', color: 'red' }}>
          OR
        </Typography>
        <Box sx={{ flex: 1, height: 1, bgcolor: 'red' }} />
      </Box>

      <FormControl fullWidth variant="standard">
        <InputLabel htmlFor="plate">License Plate</InputLabel>
        <Input
          id="plate"
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
          endAdornment={
            <InputAdornment position="end">
              <IconButton onClick={handleSearch}>
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          }
          sx={{ textAlign: 'center' }}
        />
      </FormControl>
    </Container>
  )
}
