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
import { setOnBoardingState } from '../../signup/actions';
import { useLocale, useTranslations } from 'next-intl';

export default function OnboardView() {
  const [accepted, setAccepted] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("onboarding.tos");
  
  useEffect(() => {
    const handleSignup = async () => {
      await setOnBoardingState("tos");
    }
    handleSignup();
  }, [locale]);

  const handleClick = async () => {
    if (accepted) {
      await setOnBoardingState("first-vehicle");
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
          {t('title')}
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
            {t('welcome')}
          </Typography>
          
          <Typography variant="body2" component="p">
            {t('agreement')}
          </Typography>
          
          <Typography variant="body2" component="p">
            1. <strong>{t('terms.line1.point')}</strong> {t('terms.line1.description')}
          </Typography>
          
          <Typography variant="body2" component="p">
            2. <strong>{t('terms.line2.point')}</strong>{t('terms.line2.description')}
          </Typography>
          
          <Typography variant="body2" component="p">
            3. <strong>{t('terms.line3.point')}</strong>{t('terms.line3.description')}
          </Typography>
          <Typography variant="body2" component="p">
            4. <strong>{t('terms.line4.point')}</strong> {t('terms.line4.description')}
          </Typography>
          <Typography variant="body2" component="p">
            5. <strong>{t('terms.line5.point')}</strong>{t('terms.line5.description')}
          </Typography>
          <Typography variant="body2" component="p">
            6. <strong>{t('terms.line6.point')}</strong>{t('terms.line6.description')}
          </Typography>
          <Typography variant="body2" component="p">
            7. <strong>{t('terms.line7.point')}</strong>{t('terms.line7.description')}
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
            label={t("acceptTerms")}
          />
        </Box>
        
        <Divider sx={{ width: '100%' }} />
        
        <Button
          variant="contained"
          aria-label="submit-tos-button"
          fullWidth
          sx={{ mt: 2, textTransform: 'none', color: 'white', fontSize: '1.15rem' }}
          disabled={!accepted}
          onClick={handleClick}
        >
          {t('continue')}
        </Button>
      </Stack>
    </Container>
  );
}
