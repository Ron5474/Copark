'use client'
import { Box, Typography, Paper, Button, Stack } from '@mui/material'

export default function PlateResult({
  plate,
  image,
  onNewScan,
  onValidate,
  showActions,
}: {
  plate: string
  image?: string
  onNewScan: () => void
  onValidate: () => void
  showActions: boolean
}) {
  return (
    <Paper sx={{ p: 2, bgcolor: '#dcdcdc', borderRadius: 2, mb: 2 }}>
      <Typography fontWeight="bold">License plate Detected</Typography>
      <Typography variant="body2" gutterBottom>plate Number: {plate}</Typography>

      {image && (
        <Box
          component="img"
          src={image}
          alt="Captured License Plate"
          sx={{ width: '100%', borderRadius: 2 }}
        />
      )}
      {showActions && (
        <Stack direction="row" spacing={2}>
          <Button fullWidth sx={{ bgcolor: '#7fc9c9' }} onClick={onNewScan}>New Scan</Button>
          <Button fullWidth sx={{ bgcolor: '#7fc9c9' }} onClick={onValidate}>Validate Permit</Button>
        </Stack>
      )}
    </Paper>
  )
}
