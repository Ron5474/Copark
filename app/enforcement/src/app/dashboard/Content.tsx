'use client'

import { Container, Box, Typography } from '@mui/material'
import ManualEntryCard from './plate/ManualEntry'
import PermitCard from './permit/Card'
import IssueViolationForm from './violation/IssueViolationForm'
import { useEnforcement } from './context/Context'

export default function EnforcementDashboardView() {
  const {
    plate,
    isValidated,
    isIssuingViolation,
    setIsIssuingViolation,
  } = useEnforcement()

  return (
    <Container maxWidth="xs" sx={{ py: 3, mt: 8 }}>
      {!plate && (
        <>
          <Box display="flex" alignItems="center" mt={3} mb={1}>
            <Box sx={{ flex: 1, height: 1, bgcolor: 'red' }} />
            <Typography variant="body2" sx={{ mx: 2, fontWeight: 'bold', color: 'red' }}>
              Manual Entry
            </Typography>
            <Box sx={{ flex: 1, height: 1, bgcolor: 'red' }} />
          </Box>

          <ManualEntryCard />
        </>
      )}

      {plate && isValidated && !isIssuingViolation && <PermitCard />}

      {plate && isIssuingViolation && (
        <IssueViolationForm onCancel={() => setIsIssuingViolation(false)} />
      )}
    </Container>
  )
}
