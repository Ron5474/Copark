import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Container,
  Stack,
  Divider
} from '@mui/material';

export default function ChallengeTicket() {
  const [reason, setReason] = useState<string>('');

  const handleSubmit = () => {
    console.log('Challenge submitted:', { reason });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 3,
          border: '2px solid',
          borderColor: 'primary.main',
          bgcolor: 'background.paper'
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          textAlign="center" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            // color: 'primary.main',
            mb: 3
          }}
        >
          Challenge Ticket
        </Typography>

        <Divider sx={{ mb: 4 }} />

        <Stack spacing={4}>
          <Box>
            <Typography 
              variant="h6" 
              component="h2" 
              gutterBottom
              sx={{ fontWeight: 'semibold', mb: 2 }}
            >
              Reason
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Please describe the reason for your challenge... (minimum 25 characters)"
              slotProps={{
                htmlInput: {
                  maxLength: 500,
                }
              }}
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReason(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>
        
          <Box sx={{ pt: 2 }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleSubmit}
              disabled={!reason.trim() || reason.length < 25}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
              Submit Challenge
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}