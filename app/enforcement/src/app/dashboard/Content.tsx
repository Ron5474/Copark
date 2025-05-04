'use client'

import { Container, Box, Typography } from '@mui/material'
import { useState, useEffect } from 'react'
import CameraCaptureCard from './CameraBox'
import ManualEntryCard from './ManualEntry'
import PlateResult from './PlateResult'

export default function EnforcementDashboardView() {
  const [plate, setPlate] = useState<string | null>(null)
  const [cameraOn, setCameraOn] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      setCameraOn(false)
    }
  }, [])

  const handleCapture = (image: string) => {
    // TODO: Replace with real OCR response
    // TODO: send image to server for license plate detection
    // Simulate detection from image
    console.log('Captured image base64:', image)
    setCapturedImage(image)
    const simulatedPlate = 'ABC123'
    setPlate(simulatedPlate)
    setCameraOn(false)
  }

  const handleNewScan = () => {
    setPlate(null)
    setManualInput('')
    setCapturedImage(null)
  }

  const handleValidate = () => {
    console.log(`Validating permit for: ${plate}`)
    // TODO: Add permit validation logic
  }

  const handleManualSearch = () => {
    if (!manualInput.trim()) return
    // TODO: search API call or route to results
    setPlate(manualInput.toUpperCase())
    setCameraOn(false)
  }

  return (
    <Container maxWidth="xs" sx={{ py: 3 }}>
      {!plate && (
        <CameraCaptureCard
          cameraOn={cameraOn}
          setCameraOn={setCameraOn}
          onCapture={handleCapture}
        />
      )}

      {plate && (
        <PlateResult
          plate={plate}
          image={capturedImage ?? undefined}
          onNewScan={handleNewScan}
          onValidate={handleValidate}
          showActions={true}
        />
      )}

      <Box display="flex" alignItems="center" mt={3} mb={1}>
        <Box sx={{ flex: 1, height: 1, bgcolor: 'red' }} />
        <Typography variant="body2" sx={{ mx: 2, fontWeight: 'bold', color: 'red' }}>
          OR Manual Entry
        </Typography>
        <Box sx={{ flex: 1, height: 1, bgcolor: 'red' }} />
      </Box>

      <ManualEntryCard
        plate={manualInput}
        setPlate={setManualInput}
        onSearch={handleManualSearch}
      />
    </Container>
  )
}
