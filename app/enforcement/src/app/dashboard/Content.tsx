'use client'

import {
  Container,
  Box,
  Typography,
  Paper,
} from '@mui/material'
import EditNoteIcon from '@mui/icons-material/Search'
import ManualEntryCard from './plate/ManualEntry'
import PermitCard from './permit/Card'
import IssueViolationForm from './violation/IssueViolationForm'
import { useEnforcement } from './context/Context'
import SuccessMessage from './violation/SuccessMessage'

export default function EnforcementDashboardView() {
  const {
    plate,
    isValidated,
    isIssuingViolation,
    setIsIssuingViolation,
    showSuccess,
    setShowSuccess,
    setPlate,
    setIsValidated,
    setPermitResult,
    setManualInput,
  } = useEnforcement()

  if (showSuccess) {
    return (
      <SuccessMessage
        title="Violation Submitted"
        message="The violation has been recorded successfully."
        buttonText="Back to Search"
        onButtonClick={() => {
          setShowSuccess(false)
          setIsIssuingViolation(false)
          setPlate(null)
          setManualInput('')
          setIsValidated(false)
          setPermitResult(null)
        }}
      />
    )
  }

  return (
    <Container maxWidth="xs" sx={{ py: 3, mt: 8 }}>
      {!plate && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            px: 2,
            backgroundColor: 'background.default',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              boxShadow: 3,
            }}
          >
            <EditNoteIcon sx={{ fontSize: 42, color: 'primary.main' }} />
          </Box>

          <Typography variant="h5" sx={{ mb: 1 }}>
            Manual License Plate Entry
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, maxWidth: 300, textAlign: 'center' }}
          >
            Type in the license plate below to view permit information or issue a citation.
          </Typography>

          <Paper
            elevation={3}
            sx={{
              width: '100%',
              maxWidth: 400,
              px: 3,
              py: 4,
              borderRadius: 3,
            }}
          >
            <Typography
              variant="subtitle1"
              textAlign="center"
              mb={2}
            >
              Enter Plate Details
            </Typography>

            <ManualEntryCard />
          </Paper>
        </Box>
      )}

      {plate && isValidated && !isIssuingViolation && <PermitCard />}

      {plate && isIssuingViolation && (
        <IssueViolationForm onCancel={() => setIsIssuingViolation(false)} />
      )}
    </Container>
  )
}

