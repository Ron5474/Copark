'use client'

import {
  Box,
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
import { useState } from 'react'
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
  const { plate, setShowSuccess, setPlate } = useEnforcement()

  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({ plate: false, reason: false })

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
            if (errors.plate && value) setErrors((prev) => ({ ...prev, plate: false }))
          }}
          fullWidth
          error={errors.plate}
          helperText={errors.plate ? 'License plate is required.' : ''}
        />

        <TextField
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
            label="Custom Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
            rows={3}
            fullWidth
          />
        )}

        <Button variant="outlined" component="label">
          Upload Photo (1 Max)
          <input
            hidden
            accept="image/*"
            type="file"
            onChange={handlePhotoUpload}
          />
        </Button>

        {photo && (
          <Paper elevation={1} sx={{ position: 'relative', width: '100%', maxWidth: 300 }}>
            <Image
              src={URL.createObjectURL(photo)}
              alt="Violation photo"
              width={300}
              height={180}
              style={{ borderRadius: 4, width: '100%', height: 'auto' }}
            />
            <IconButton
              size="small"
              onClick={removePhoto}
              sx={{ position: 'absolute', top: 2, right: 2, background: '#fff' }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Paper>
        )}

        <Stack direction="row" spacing={2}>
          <Button variant="contained" color="error" fullWidth onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="contained" fullWidth onClick={handleSubmit} disabled={loading}>
            {loading ? 'Issuing...' : 'Submit Violation'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
