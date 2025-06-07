'use client'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import CloseIcon from '@mui/icons-material/Close'
import FlipCameraIosIcon from '@mui/icons-material/FlipCameraIos'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import SendIcon from '@mui/icons-material/Send'
import { useState, useRef, useCallback, useEffect } from 'react'

interface CameraCaptureProps {
  open: boolean
  onClose: () => void
  onSubmit: (imageDataURL: string) => void
  isProcessing?: boolean
}

export default function CameraCapture({ 
  open, 
  onClose, 
  onSubmit, 
  isProcessing = false 
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(true)

  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 }
        },
        audio: false
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error('Camera access error:', err)
      setError('Unable to access camera. Please ensure camera permissions are granted.')
    } finally {
      setIsLoading(false)
    }
  }, [facingMode])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])
  

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageDataURL = canvas.toDataURL('image/jpeg', 0.8)
    
    setCapturedImage(imageDataURL)
    setShowCamera(false)
    stopCamera()
  }, [stopCamera])

  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
    setShowCamera(true)
    startCamera()
  }, [startCamera])

  const submitPhoto = useCallback(() => {
    if (capturedImage) {
      onSubmit(capturedImage)
    }
  }, [capturedImage, onSubmit])

  const toggleCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }, [])

  useEffect(() => {
    if (open && showCamera) {
      startCamera()
    } else if (!open) {
      stopCamera()
      setCapturedImage(null)
      setShowCamera(true)
    }

    return () => {
      stopCamera()
    }
  }, [open, showCamera, startCamera, stopCamera])

  useEffect(() => {
    if (open && showCamera) {
      startCamera()
    }
  }, [facingMode, open, showCamera, startCamera])

  const handleClose = () => {
    stopCamera()
    setCapturedImage(null)
    setShowCamera(true)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">
          {showCamera ? 'Capture License Plate' : 'Review Photo'}
        </Typography>
        <IconButton onClick={handleClose} size="small" disabled={isProcessing}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16/9',
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: 'black',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {showCamera ? (
            <>
              {isLoading ? (
                <CircularProgress color="primary" />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <IconButton
                    onClick={toggleCamera}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                    }}
                  >
                    <FlipCameraIosIcon />
                  </IconButton>

                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      border: '2px solid white',
                      borderRadius: 1,
                      width: '80%',
                      height: '30%',
                      pointerEvents: 'none',
                      '&::before': {
                        content: '"Position license plate within this frame"',
                        position: 'absolute',
                        top: '-30px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        color: 'white',
                        fontSize: '14px',
                        textAlign: 'center',
                        bgcolor: 'rgba(0,0,0,0.7)',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        whiteSpace: 'nowrap'
                      }
                    }}
                  />
                </>
              )}
            </>
          ) : (
            <>
              {capturedImage && (

                <picture>
                <source srcSet={capturedImage} />
                <img
                  src={capturedImage}
                  alt={`Captured License Plate`}
                  style={{
                    width: '100%',
                    maxHeight: '280px',
                    objectFit: 'cover'
                  }}
                />
                </picture>
              )}
              <IconButton
                onClick={retakePhoto}
                disabled={isProcessing}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                }}
              >
                <RestartAltIcon />
              </IconButton>
            </>
          )}
        </Box>

        <Typography 
          variant="body2" 
          color="text.secondary" 
          textAlign="center" 
          sx={{ mt: 2 }}
        >
          {showCamera 
            ? 'Position the license plate clearly within the frame and tap capture'
            : 'Review the captured image. Retake if needed or submit for processing.'
          }
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        {showCamera ? (
          <>
            <Button 
              onClick={handleClose} 
              variant="outlined"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={capturePhoto}
              variant="contained"
              startIcon={<CameraAltIcon />}
              disabled={isLoading || error !== '' || isProcessing}
            >
              Capture Photo
            </Button>
          </>
        ) : (
          <>
            <Button 
              onClick={retakePhoto} 
              variant="outlined"
              startIcon={<RestartAltIcon />}
              disabled={isProcessing}
            >
              Retake
            </Button>
            <Button
              onClick={submitPhoto}
              variant="contained"
              startIcon={isProcessing ? <CircularProgress size={16} /> : <SendIcon />}
              disabled={!capturedImage || isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Submit for Processing'}
            </Button>
          </>
        )}
      </DialogActions>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Dialog>
  )
}
