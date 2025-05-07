/**
 * Very Awesome resources. helped me do it
 * https://medium.com/@gk150899/building-a-webcam-app-with-reactjs-3111c1e90efb
 * https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API/Taking_still_photos
 */
'use client'

import { useEffect, useRef, useState } from 'react'
import { Box, Button, Typography } from '@mui/material'
import { useEnforcement } from '../context/Context'
// import { scanPlate } from '@/app/dashboard/actions'


export default function CameraCaptureCard() {
  const {
    cameraOn,
    setCameraOn,
    setCapturedImage,
    setPlate,
    setManualInput,
    setDetectionMethod
  } = useEnforcement()

  const [loadingOCR, setLoadingOCR] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stopAllTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
      streamRef.current = null
    }
  }

  useEffect(() => {
    if (cameraOn) {
      stopAllTracks()
      navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      }).catch(err => {
        console.error('Camera access denied:', err)
        setCameraOn(false)
      })
    } else {
      stopAllTracks()
    }

    return () => stopAllTracks()
  }, [cameraOn, setCameraOn])

  const handleCapture = async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
  
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    if (!context) return
  
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageDataURL = canvas.toDataURL('image/png')
    stopAllTracks()
  
    setCapturedImage(imageDataURL)
    setCameraOn(false)
    setDetectionMethod('camera')
  
    // setLoadingOCR(true)
    // try {
    //   const plateText = await scanPlate(imageDataURL)
    //   setPlate(plateText)
    //   setManualInput(plateText)
    // } catch (err) {
    //   console.error('OCR server action error:', err)
    // } finally {
    //   setLoadingOCR(false)
    // }
    setLoadingOCR(true)
    try {
      const blob = await (await fetch(imageDataURL)).blob()
      const formData = new FormData()
      formData.append('image', blob, 'capture.png')

      const response = await fetch('http://localhost:4001/api/v0/vehicle/scan', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('OCR failed:', result.error)
        return
      }

      const plateText = result.plate?.trim?.() || ''
      setPlate(plateText)
      setManualInput(plateText)
    } catch (err) {
      console.error('Local OCR call failed:', err)
    } finally {
      setLoadingOCR(false)
    }

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

      <Box sx={{ width: '100%', height: 150, borderRadius: 2, mt: 1, mb: 2, overflow: 'hidden', position: 'relative' }}>
        {cameraOn ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Box sx={{ width: '100%', height: '100%', bgcolor: '#999', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="white">Camera Off</Typography>
          </Box>
        )}
      </Box>

      <Button
        fullWidth
        disabled={!cameraOn || loadingOCR}
        onClick={handleCapture}
        sx={{ bgcolor: cameraOn ? '#d3ffff' : '#ccc', mb: 2 }}
        aria-label={`Capture License Plate ${cameraOn ? 'Enabled' : 'Disabled'}`}
      >
        {loadingOCR ? 'Analyzing...' : 'Capture License Plate'}
      </Button>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  )
}
