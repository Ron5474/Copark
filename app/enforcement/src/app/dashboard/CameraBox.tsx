/**
 * Very Awesome resources. helped me do it
 * https://medium.com/@gk150899/building-a-webcam-app-with-reactjs-3111c1e90efb
 * https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API/Taking_still_photos
 */

'use client'

import { useEffect, useRef } from 'react'
import { Box, Button, Typography } from '@mui/material'

export default function CameraCaptureCard({
  cameraOn,
  setCameraOn,
  onCapture,
}: {
  cameraOn: boolean
  setCameraOn: (on: boolean) => void
  onCapture: (image: string) => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (cameraOn && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          streamRef.current = stream
          videoRef.current!.srcObject = stream
        })
        .catch((err) => {
          console.error('Error accessing camera:', err)
          setCameraOn(false)
        })
    } else {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      if (videoRef.current) videoRef.current.srcObject = null
    }
  }, [cameraOn, setCameraOn])

  const handleCapture = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    if (!context) return

    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageDataURL = canvas.toDataURL('image/png')
    onCapture(imageDataURL)
  }

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

      <Box
        sx={{
          width: '100%', height: 150,
          borderRadius: 2, mt: 1, mb: 2,
          overflow: 'hidden', position: 'relative'
        }}
      >
        {cameraOn ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              width: '100%', height: '100%',
              bgcolor: '#999',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <Typography color="white">Camera Off</Typography>
          </Box>
        )}
      </Box>

      <Button
        fullWidth
        disabled={!cameraOn}
        onClick={handleCapture}
        sx={{ bgcolor: cameraOn ? '#d3ffff' : '#ccc', mb: 2 }}
      >
        Capture License Plate
      </Button>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  )
}
