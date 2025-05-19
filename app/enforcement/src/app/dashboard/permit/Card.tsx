// 'use client'

// import { Typography, Paper, Button, Stack } from '@mui/material'
// import { useEnforcement } from '../context/Context'

// export default function PermitCard() {
//   const {
//     plate,
//     setPlate,
//     setManualInput,
//     setIsValidated,
//     setIsIssuingViolation,
//     permitResult,
//     setPermitResult,
//     zone,
//   } = useEnforcement()

//   const handleNewScan = () => {
//     setPlate(null)
//     setManualInput('')
//     setPermitResult(null)
//     setIsValidated(false)
//   }

//   const handleIssueCitation = () => {
//     console.log(`Issuing citation for ${plate}`)
//     setIsIssuingViolation(true)
//   }

//   const isValid = permitResult?.isValid
//   // const type = permitResult?.type ?? 'N/A'
//   // const zone = permitResult?.zone

//   return (
//     <Paper sx={{ p: 2, bgcolor: '#d3ffff', borderRadius: 2, mb: 2 }}>
//       {isValid ? (
//         <>
//           <Typography fontWeight="bold" color="green">Valid Permit</Typography>
//           <Typography>Valid parking permit found.</Typography>
//           <Typography>Plate Number: {plate}</Typography>
//           <Typography>Current Location: Zone {zone}</Typography>
//         </>
//       ) : (
//         <>
//           <Typography fontWeight="bold" color="red">Invalid Permit</Typography>
//           <Typography>No valid permit found for this vehicle.</Typography>
//           <Typography>Plate Number: {plate}</Typography>
//           <Typography>Current Location: Zone {zone}</Typography>
//         </>
//       )}

//       <Stack direction="row" spacing={2} mt={2}>
//         <Button fullWidth sx={{ bgcolor: '#7fc9c9' }} onClick={handleNewScan} aria-label="New Scan">
//           New Scan
//         </Button>
//         <Button fullWidth sx={{ bgcolor: '#7fc9c9' }} onClick={handleIssueCitation}>
//           Issue Citation
//         </Button>
//       </Stack>
//     </Paper>
//   )
// }

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
    zone,
  } = useEnforcement()

  const handleNewScan = () => {
    setPlate(null)
    setManualInput('')
    setPermitResult(null)
    setIsValidated(false)
  }

  const handleIssueCitation = () => {
    console.log(`Issuing citation for ${plate}`)
    setIsIssuingViolation(true)
  }

  const isValid = permitResult?.isValid

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '75vh' }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, width: '100%', maxWidth: 420 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            color={isValid ? 'success.main' : 'error.main'}
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap={1}
          >
            {isValid ? (
              <>
                <CheckIcon sx={{ fontSize: 32 }} />
                Valid Permit
              </>
            ) : (
              <>
                <CloseIcon sx={{ fontSize: 32 }} />
                No Valid Permit
              </>
            )}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              License Plate:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 'medium',
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
              }}
            >
              {plate}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              Current Location:
            </Typography>
            <Chip
              label={`Zone ${zone}`}
              color="info"
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
        </Box>

        <Stack direction="row" spacing={2} mt={4}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleNewScan}
            aria-label="New Scan"
          >
            New Scan
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="error"
            onClick={handleIssueCitation}
            sx={{ fontWeight: 'bold' }}
            aria-label="Issue Citation"
          >
            Issue Citation
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}
