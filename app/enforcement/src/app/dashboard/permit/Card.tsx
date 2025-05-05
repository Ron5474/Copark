'use client'

import { Typography, Paper, Button, Stack } from '@mui/material'
import { useEnforcement } from '../context/Context'

export default function PermitCard() {
  const {
    plate,
    setPlate,
    setCapturedImage,
    setManualInput,
    setCameraOn,
    setIsValidated,
    setIsIssuingViolation 
  } = useEnforcement()

   // Replace this with real validation logic
  const valid = plate?.toUpperCase() !== 'XYZ'
  const type = 'Residential'

  const handleNewScan = () => {
    setPlate(null)
    setCapturedImage(null)
    setManualInput('')
    setIsValidated(false)
    setTimeout(() => setCameraOn(true), 100)
  }

  const handleIssueCitation = () => {
    console.log(`Issuing citation for ${plate}`)
    setIsIssuingViolation(true)
  }

  return (
    <Paper sx={{ p: 2, bgcolor: '#d3ffff', borderRadius: 2, mb: 2 }}>
      {valid ? (
        <>
          <Typography fontWeight="bold" color="green">Valid Permit</Typography>
          <Typography>Valid parking permit found.</Typography>
          <Typography>Plate Number : {plate}</Typography>
          <Typography>Permit type: {type}</Typography>
        </>
      ) : (
        <>
          <Typography fontWeight="bold" color="red">Invalid Permit</Typography>
          <Typography>No valid permit found for this vehicle.</Typography>
          <Typography>Plate Number : {plate}</Typography>
        </>
      )}

      <Stack direction="row" spacing={2} mt={2}>
        <Button fullWidth sx={{ bgcolor: '#7fc9c9' }} onClick={handleNewScan} aria-label="New Scan" >New Scan</Button>
        <Button fullWidth sx={{ bgcolor: '#7fc9c9' }} onClick={handleIssueCitation}>Issue Citation</Button>
      </Stack>
    </Paper>
  )
}
