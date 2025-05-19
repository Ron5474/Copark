'use client'

import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Stack,
} from '@mui/material'
import { useState } from 'react'
import { useEnforcement } from '../context/Context'
import { issueTicket } from './actions'

const reasons = [
  'No Valid Permit',
  'Expired Permit',
  'Parked in Reserved Zone',
  'Blocking Driveway',
  'Other',
]

const toBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
  })
}

export default function IssueViolationForm({
  onCancel,
}: {
  onCancel: () => void
}) {
  const {
    plate,
    setShowSuccess,
    zone,
    setPlate,
  } = useEnforcement()

  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({
    plate: false,
    reason: false,
  })

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files))
    }
  }

  const handleSubmit = async () => {
    const newErrors = {
      plate: !plate,
      reason: !reason,
    }

    setErrors(newErrors)

    if (newErrors.plate || newErrors.reason) {
      return
    }

    setLoading(true)

    try {
      const base64Images = await Promise.all(photos.map(toBase64))

      await issueTicket({
        plate: plate as string,
        reason,
        note: reason === 'Other' ? note : '',
        images: base64Images[0] ?? null,
      })

      setShowSuccess(true)
    } catch (err) {
      console.error('Ticket issuing failed:', err)
      alert('Failed to issue ticket.')
    }

    setLoading(false)
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', p: 3, borderRadius: 2, mt: 2 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Issue Violation
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="License Plate"
          value={plate ?? ''}
          onChange={(e) => {
          const value = e.target.value
          setPlate(value)
          if (errors.plate && value) {
            setErrors((prev) => ({ ...prev, plate: false }))
          }
        }}
          fullWidth
          error={errors.plate}
          helperText={errors.plate ? 'License plate is required.' : ''}
        />

        <TextField
          label="Current Location"
          value={`Zone ${zone}`}
          fullWidth
          disabled
        />

        <TextField
          label="Reason"
          select
          value={reason}
          onChange={(e) => {
            const value = e.target.value
            setReason(value)
            if (errors.reason && value) {
              setErrors((prev) => ({ ...prev, reason: false }))
            }
          }}
          fullWidth
          error={errors.reason}
          helperText={errors.reason ? 'Reason is required.' : ''}
        >
          {reasons.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </TextField>

        {reason === 'Other' && (
          <TextField
            label="Custom Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
            rows={3}
            fullWidth
          />
        )}

        <Button variant="outlined" component="label">
          Upload Violation Photos
          <input
            aria-label="Upload Violation Photos"
            hidden
            accept="image/*"
            multiple
            type="file"
            onChange={handlePhotoUpload}
          />
        </Button>

        {photos.length > 0 && (
          <Typography variant="body2">
            {photos.length} file(s) selected
          </Typography>
        )}

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="error"
            fullWidth
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Issuing...' : 'Submit Violation'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
