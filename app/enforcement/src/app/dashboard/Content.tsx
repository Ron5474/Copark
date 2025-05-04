'use client'

import { Container, Box, Typography } from '@mui/material'
import { useState } from 'react'
import CameraCaptureCard from './CameraBox'
import ManualEntryCard from './ManualEntry'

export default function EnforcementDashboardView() {
  const [plate, setPlate] = useState('')
  const [cameraOn, setCameraOn] = useState(false)

  const handleCapture = (image: string) => {
    console.log('Captured image base64:', image)
    // TODO: send `image` to server for license plate detection
  }

  const handleSearch = () => {
    console.log('Searching for plate:', plate)
    // TODO: search API call or route to results
  }

  return (
    <Container maxWidth="xs" sx={{ py: 3 }}>
      <CameraCaptureCard
        cameraOn={cameraOn}
        setCameraOn={setCameraOn}
        onCapture={handleCapture}
      />

      <Box display="flex" alignItems="center" mt={3} mb={1}>
        <Box sx={{ flex: 1, height: 1, bgcolor: 'red' }} />
        <Typography variant="body2" sx={{ mx: 2, fontWeight: 'bold', color: 'red' }}>
          OR Manual Entry
        </Typography>
        <Box sx={{ flex: 1, height: 1, bgcolor: 'red' }} />
      </Box>

      <ManualEntryCard plate={plate} setPlate={setPlate} onSearch={handleSearch} />
    </Container>
  )
}
