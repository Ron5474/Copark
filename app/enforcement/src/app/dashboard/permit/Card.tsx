'use client'

import {
  Typography,
  Paper,
  Button,
  Box,
  Stack,
  Chip,
} from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
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
    setIsIssuingViolation(true)
  }

  const permitExists = permitResult && permitResult.area !== 'N/A'

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '75vh',
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 3,
          width: '100%',
          maxWidth: 420,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          {permitExists ? (
            <>
              <CheckIcon sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
              <Typography variant="h5">
                Permit Found
              </Typography>
            </>
          ) : (
            <>
              <CloseIcon sx={{ fontSize: 32, color: 'error.main', mb: 1 }} />
              <Typography variant="h5">
                No Permit Found
              </Typography>
            </>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              pb: 1,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              License Plate:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
              }}
            >
              {plate}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              pb: 1,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Permit Type:
            </Typography>
            <Chip
              label={
                permitResult
                  ? `${permitResult.type} - ${permitResult.area}`
                  : 'N/A'
              }
              color="info"
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
        </Box>

        <Stack direction="row" spacing={2} mt={4}>
          <Button
            color="primary"
            fullWidth
            variant="contained"
            onClick={handleNewScan}
            aria-label="New Search"
          >
            New Search
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="error"
            onClick={handleIssueCitation}
            aria-label="Issue Citation"
          >
            Issue Citation
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}
