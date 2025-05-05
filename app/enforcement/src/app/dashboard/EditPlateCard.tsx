'use client'

import { Box, Typography, Button } from '@mui/material'
import Image from 'next/image'
import ManualEntryCard from './ManualEntry'
import { useEnforcement } from './Context'

export default function EditPlateCard() {
  const {
    plate,
    manualInput, setManualInput,
    setPlate,
    capturedImage,
    setIsEditing
  } = useEnforcement()

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

      <ManualEntryCard />

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
  )
}
