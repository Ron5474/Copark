'use client'

import { Container, Box, Typography, Button } from '@mui/material'
import { useState, useEffect } from 'react'
import Image from 'next/image'

import CameraCaptureCard from './CameraBox'
import ManualEntryCard from './ManualEntry'
import PlateResult from './PlateResult'

export default function EnforcementDashboardView() {
  const [plate, setPlate] = useState<string | null>(null)
  const [cameraOn, setCameraOn] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [detectionMethod, setDetectionMethod] = useState<'camera'|'manual'|null>(null)

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
    setManualInput(simulatedPlate)
    setDetectionMethod('camera')
    setCameraOn(false)
  }

  const handleNewScan = () => {
    setPlate(null)
    setManualInput('')
    setCapturedImage(null)
    setIsEditing(false)
    setDetectionMethod(null)
    
    // Turn camera on automatically for new scan
    setTimeout(() => setCameraOn(true), 100)
  }

  const handleValidate = () => {
    console.log(`Validating permit for: ${plate}`)
    // TODO: API call to validate permit
  }

  const handleManualSearch = () => {
    if (!manualInput.trim()) return
    setPlate(manualInput.toUpperCase())
    setDetectionMethod('manual')
    setCapturedImage(null)
    setCameraOn(false)
  }

  const handleEditPlate = () => {
    setIsEditing(true)
    if (plate) setManualInput(plate)
  }

  const handleSaveEdit = () => {
    if (!manualInput.trim()) return
    setPlate(manualInput.toUpperCase())
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    if (plate) setManualInput(plate)
    setIsEditing(false)
  }

  return (
    <Container maxWidth="xs" sx={{ py: 3 }}>
      {!plate && !isEditing && (
        <>
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

          <ManualEntryCard
            plate={manualInput}
            setPlate={setManualInput}
            onSearch={handleManualSearch}
          />
        </>
      )}

      {isEditing && (
        <>
          <Typography variant="h6" mb={2}>
            Edit License Plate
          </Typography>

          {capturedImage && (
            <Box 
              sx={{
                width: '100%',
                height: 200,
                mb: 2,
                display: 'flex',
                justifyContent: 'center',
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <Image
                src={capturedImage}
                alt="Captured license plate"
                width={300}
                height={200}
                style={{ height: 'auto' }} 
              />
            </Box>
          )}
          
          <ManualEntryCard
            plate={manualInput}
            setPlate={setManualInput}
            onSearch={handleSaveEdit}
          />
          
          <Box display="flex" gap={2} mt={2}>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={handleSaveEdit}
              sx={{ bgcolor: 'blue' }}
              aria-label="Save Edited Plate"
            >
              Save
            </Button>
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={handleCancelEdit}
              aria-label="Cancel Edit"
            >
              Cancel
            </Button>
          </Box>
        </>
      )}

      {plate && !isEditing && (
        <>
          <PlateResult
            plate={plate}
            capturedImage={capturedImage}
            onNewScan={handleNewScan}
            onValidate={handleValidate}
            showActions={true}
          />

          <Button 
            fullWidth 
            variant="outlined" 
            onClick={handleEditPlate}
            sx={{ mt: 2 }}
            aria-label="Edit Plate Number"
          >
            Edit Plate Number
          </Button>
          
          {detectionMethod === 'camera' && (
            <Typography variant="caption" display="block" textAlign="center" mt={1} color="text.secondary">
              Detected via camera. Tap Edit if the detection is incorrect.
            </Typography>
          )}
        </>
      )}
    </Container>
  )
}
