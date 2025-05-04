'use client'
import { Box, Button, Typography } from '@mui/material'

export default function CameraCaptureCard({ cameraOn, setCameraOn, onCapture }: {
  cameraOn: boolean
  setCameraOn: (on: boolean) => void
  onCapture: () => void
}) {
  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
        <Typography>Camera Feed</Typography>
        <Button
          aria-label={cameraOn ? 'Camera On' : 'Camera Off'}
          variant="contained"
          size="small"
          onClick={() => setCameraOn(!cameraOn)}
          sx={{
            bgcolor: cameraOn ? 'black' : 'gray',
            color: 'white',
            textTransform: 'none',
            px: 2, py: 0.5, borderRadius: 2, fontSize: '0.75rem',
          }}
        >
          {cameraOn ? 'Camera On' : 'Camera Off'}
        </Button>
      </Box>

      <Box sx={{
        width: '100%', height: 150,
        bgcolor: cameraOn ? '#ccc' : '#999',
        borderRadius: 2, mt: 1, mb: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Typography color="white">{cameraOn ? 'Camera Preview' : 'Camera Off'}</Typography>
      </Box>

      <Button
        fullWidth
        disabled={!cameraOn}
        onClick={onCapture}
        sx={{ bgcolor: cameraOn ? '#d3ffff' : '#ccc', mb: 2 }}
      >
        Capture License Plate
      </Button>
    </>
  )
}
