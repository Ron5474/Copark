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

const reasons = [
  'No Valid Permit',
  'Expired Permit',
  'Parked in Reserved Zone',
  'Blocking Driveway',
  'Other',
]

export default function IssueViolationForm({
  onCancel,
}: {
  onCancel: () => void
}) {
  const { plate } = useEnforcement()
  const officer = 'John Wick'
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [photos, setPhotos] = useState<File[]>([])

  const date = new Date().toLocaleDateString()

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files))
    }
  }

  const handleSubmit = () => {
    const data = {
      officer,
      plate,
      date,
      reason,
      note: reason === 'Other' ? note : '',
      photos,
    }

    console.log('Submitting Violation:', data)
    onCancel()
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', p: 3, borderRadius: 2, mt: 2 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Issue Violation
      </Typography>

      <Stack spacing={2}>
        <TextField label="Officer" value={officer} InputProps={{ readOnly: true }} fullWidth />
        <TextField label="License Plate" value={plate ?? ''} InputProps={{ readOnly: true }} fullWidth />
        <TextField label="Date" value={date} InputProps={{ readOnly: true }} fullWidth />

        <TextField
          label="Reason"
          select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          fullWidth
        >
          {reasons.map((r) => (
            <MenuItem key={r} value={r}>{r}</MenuItem>
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
            multiple type="file" 
            onChange={handlePhotoUpload} />
        </Button>

        {photos.length > 0 && (
          <Typography variant="body2">{photos.length} file(s) selected</Typography>
        )}

        <Stack direction="row" spacing={2}>
          <Button variant="contained" color="error" fullWidth onClick={onCancel}>Cancel</Button>
          <Button variant="contained" fullWidth onClick={handleSubmit}>Submit Violation</Button>
        </Stack>
      </Stack>
    </Box>
  )
}
