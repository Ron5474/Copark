'use client'

import { Box, Typography, Paper, Button } from '@mui/material'
import Image from 'next/image'
import { useEnforcement } from './Context'

export default function PlateResult({
  showActions = true,
}: {
  showActions?: boolean
}) {
  const {
    plate,
    capturedImage,
    setPlate,
    setCapturedImage,
    setManualInput,
    setCameraOn,
    setDetectionMethod,
    setIsEditing,
  } = useEnforcement()

  if (!plate) return null

  const handleNewScan = () => {
    setPlate(null)
    setCapturedImage(null)
    setManualInput('')
    setDetectionMethod(null)
    setIsEditing(false)
    setTimeout(() => setCameraOn(true), 100)
  }

  const handleValidate = () => {
    console.log(`Validating permit for: ${plate}`)
    // TODO: replace with backend API call
  }

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        bgcolor: '#dcdcdc',
        borderRadius: 2,
        textAlign: 'center',
      }}
    >
      {capturedImage && (
        <Box 
          sx={{ 
            width: '100%', 
            height: 150, 
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

      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        License Plate Detected
      </Typography>
      
      <Typography variant="h4" fontWeight="bold" mb={3}>
        {plate}
      </Typography>

      {showActions && (
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            onClick={handleValidate}
            fullWidth
            sx={{ bgcolor: 'green', color: 'white' }}
            aria-label="Validate Permit"
          >
            Validate
          </Button>
          <Button
            variant="outlined"
            onClick={handleNewScan}
            fullWidth
            aria-label="New Scan"
          >
            New Scan
          </Button>
        </Box>
      )}
    </Paper>
  )
}
