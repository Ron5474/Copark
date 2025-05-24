'use client'

import {
  Typography,
  TextField,
  Button,
  MenuItem,
  Stack,
  IconButton,
  Paper,
} from '@mui/material'
import Image from 'next/image'
import DeleteIcon from '@mui/icons-material/Delete'
import { useState, useEffect } from 'react'
import { useEnforcement } from '../context/Context'
import { issueTicket } from './actions'
import { toBase64 } from './toBase64'

const reasons = [
  'No Valid Permit',
  'Expired Permit',
  'Parked in Reserved Zone',
  'Blocking Driveway',
  'Other',
]

export default function IssueViolationForm({ onCancel }: { onCancel: () => void }) {
  const { plate, setShowSuccess, setPlate, setTitle } = useEnforcement()
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({ plate: false, reason: false })

  useEffect(() => {
      setTitle('Issue Violation')
  }, [setTitle])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0])
    }
  }

  const removePhoto = () => {
    setPhoto(null)
  }

  const handleSubmit = async () => {
    const newErrors = { plate: !plate, reason: !reason }
    setErrors(newErrors)
    if (newErrors.plate || newErrors.reason) return

    setLoading(true)

    try {
      const base64Image = photo ? await toBase64(photo) : null

      await issueTicket({
        plate: plate as string,
        reason,
        note: reason === 'Other' ? note : '',
        images: base64Image,
      })

      setShowSuccess(true)
    } catch (err) {
      console.error('Ticket issuing failed:', err)
      alert('Failed to issue ticket.')
    }

    setLoading(false)
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2, borderRadius: 3 }}>
      <Typography variant="h6" gutterBottom>
        Issue Violation
      </Typography>

      <Stack spacing={2}>
        <TextField
          id="license-plate"
          name="plate"
          label="License Plate"
          value={plate ?? ''}
          onChange={(e) => {
            const value = e.target.value
            setPlate(value)
            if (errors.plate && value) setErrors((prev) => ({ ...prev, plate: false }))
          }}
          fullWidth
          error={errors.plate}
          helperText={errors.plate ? 'License plate is required.' : ''}
        />

        <TextField
          id="reason"
          name="reason"
          label="Reason"
          select
          value={reason}
          onChange={(e) => {
            const value = e.target.value
            setReason(value)
            if (errors.reason && value) setErrors((prev) => ({ ...prev, reason: false }))
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
            id="custom-note"
            name="customNote"
            label="Custom Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
            rows={3}
            fullWidth
          />
        )}

        <Button variant="outlined" component="label" aria-label="Upload or Take Photo">
          Upload or Take Photo (1 Max)
          <input
            hidden
            accept="image/*"
            type="file"
            id="violation-photo"
            name="violationPhoto"
            onChange={handlePhotoUpload}
          />
        </Button>

        {photo && (
          <Paper
            elevation={1}
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: 300,
              borderRadius: 2,
            }}
          >
            <Image
              src={URL.createObjectURL(photo)}
              alt="Violation photo"
              width={300}
              height={180}
              style={{ borderRadius: '8px', width: '100%', height: 'auto' }}
            />
            <IconButton
              size="small"
              color='error'
              onClick={removePhoto}
              sx={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'background.paper' }}
              aria-label="Remove photo"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Paper>
        )}

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            onClick={onCancel}
            aria-label="Cancel"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSubmit}
            disabled={loading}
            aria-label="Submit Violation"
          >
            {loading ? 'Issuing...' : 'Submit Violation'}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}
