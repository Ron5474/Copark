'use client'

import { Container, Box, Typography, Button } from '@mui/material'
import { useEffect } from 'react'

import CameraCaptureCard from './CameraBox'
import ManualEntryCard from './ManualEntry'
import PlateResult from './PlateResult'
import EditPlateCard from './EditPlateCard'
import { useEnforcement } from './Context'

export default function EnforcementDashboardView() {
  const {
    plate,
    setManualInput,
    setCameraOn,
    detectionMethod,
    isEditing,
    setIsEditing
  } = useEnforcement()

  useEffect(() => {
    return () => {
      setCameraOn(false)
    }
  }, [setCameraOn])

  const handleEditPlate = () => {
    setIsEditing(true)
    if (plate) setManualInput(plate)
  }

  return (
    <Container maxWidth="xs" sx={{ py: 3 }}>
      {!plate && !isEditing && (
        <>
          <CameraCaptureCard />

          <Box display="flex" alignItems="center" mt={3} mb={1}>
            <Box sx={{ flex: 1, height: 1, bgcolor: 'red' }} />
            <Typography variant="body2" sx={{ mx: 2, fontWeight: 'bold', color: 'red' }}>
              OR Manual Entry
            </Typography>
            <Box sx={{ flex: 1, height: 1, bgcolor: 'red' }} />
          </Box>

          <ManualEntryCard />
        </>
      )}

      {isEditing && <EditPlateCard />}

      {plate && !isEditing && (
        <>
          <PlateResult showActions={true} />

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
