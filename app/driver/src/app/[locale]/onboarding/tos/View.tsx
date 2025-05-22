/*
#######################################################################
#
# Copyright (C) 2025 Copark Inc. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/

'use client'
import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { useRouter } from '@/i18n/navigation';
import { setOnBoardingState, signUp } from '../../signup/actions';
import { useLocale } from 'next-intl';

export default function OnboardView() {
  const [accepted, setAccepted] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  
  useEffect(() => {
    const handleSignup = async () => {
      await signUp(locale);
    }
    handleSignup();
  }, [locale]);

  const handleClick = async () => {
    if (accepted) {
      await setOnBoardingState("complete");
      router.push('/onboarding/add-vehicle');
      // router.push('/dashboard');
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
      }}
    >
      <Stack alignItems="center" spacing={3} sx={{ width: '100%', margin: 'auto', padding: 2 }}>
        <Typography component="h1" variant="h4" align="center">
          Terms of Service
        </Typography>
        
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            maxHeight: '350px', 
            overflow: 'auto',
            width: '100%'
          }}
        >
          <Typography variant="h6" gutterBottom>
            Welcome to Copark
          </Typography>
          
          <Typography variant="body2" component="p">
            By accessing or using Copark&apos;s parking management services, you agree to be bound by these Terms of Service.
          </Typography>
          
          <Typography variant="body2" component="p">
            1. <strong>Service Description:</strong> Copark provides parking lot management and enforcement services through our platform.
          </Typography>
          
          <Typography variant="body2" component="p">
            2. <strong>License:</strong> We grant you a limited, non-exclusive, non-transferable license to use our service for your parking management needs.
          </Typography>
          
          <Typography variant="body2" component="p">
            3. <strong>User Accounts:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
          </Typography>
          
          <Typography variant="body2" component="p">
            4. <strong>Privacy:</strong> Your use of our services is also governed by our Privacy Policy, which outlines how we collect and use your data.
          </Typography>
          
          <Typography variant="body2" component="p">
            5. <strong>Data Usage:</strong> We collect license plate data and parking information solely for enforcement purposes. This data is stored securely and used only as necessary for service operation.
          </Typography>
          
          <Typography variant="body2" component="p">
            6. <strong>Limitations:</strong> Our services are provided &quot;as is&quot; without warranties of any kind, either express or implied.
          </Typography>
          
          <Typography variant="body2" component="p">
            7. <strong>Changes:</strong> We reserve the right to modify these terms at any time. Continued use after changes constitutes acceptance of the new terms.
          </Typography>
        </Paper>
        
        <Box sx={{ width: '100%' }}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={accepted} 
                onChange={(e) => setAccepted(e.target.checked)} 
                color="primary"
              />
            }
            label="I have read and agree to the Terms of Service"
          />
        </Box>
        
        <Divider sx={{ width: '100%' }} />
        
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          disabled={!accepted}
          onClick={handleClick}
        >
          Continue
        </Button>
      </Stack>
    </Container>
  );
}