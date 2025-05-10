'use client'

import { Typography, Paper, Button, Stack } from '@mui/material'
import { useEnforcement } from '../context/Context'

export default function PermitCard() {
  const {
    plate,
    setPlate,
    setManualInput,
    setIsValidated,
    setIsIssuingViolation,
    permitResult,
    setPermitResult,
  } = useEnforcement()

  const handleNewScan = () => {
    setPlate(null)
    setManualInput('')
    setPermitResult(null)
    setIsValidated(false)
  }

  const handleIssueCitation = () => {
    console.log(`Issuing citation for ${plate}`)
    setIsIssuingViolation(true)
  }

  const isValid = permitResult?.isValid
  // const type = permitResult?.type ?? 'N/A'
  const zone = permitResult?.zone

  return (
    <Paper sx={{ p: 2, bgcolor: '#d3ffff', borderRadius: 2, mb: 2 }}>
      {isValid ? (
        <>
          <Typography fontWeight="bold" color="green">Valid Permit</Typography>
          <Typography>Valid parking permit found.</Typography>
          <Typography>Plate Number: {plate}</Typography>
          <Typography>Zone: {zone}</Typography>
        </>
      ) : (
        <>
          <Typography fontWeight="bold" color="red">Invalid Permit</Typography>
          <Typography>No valid permit found for this vehicle.</Typography>
          <Typography>Plate Number: {plate}</Typography>
          <Typography>Zone: {zone}</Typography>
        </>
      )}

      <Stack direction="row" spacing={2} mt={2}>
        <Button fullWidth sx={{ bgcolor: '#7fc9c9' }} onClick={handleNewScan} aria-label="New Scan">
          New Scan
        </Button>
        <Button fullWidth sx={{ bgcolor: '#7fc9c9' }} onClick={handleIssueCitation}>
          Issue Citation
        </Button>
      </Stack>
    </Paper>
  )
}
