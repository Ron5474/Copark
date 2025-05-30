'use client'
/**
 * @file SplashScreen.tsx
 * @description This file contains the SplashScreen component which is used to display a splash screen
 * @author Swayam Shah
 */

import { useContext } from 'react';
import { OnboardingContext } from './context';

import { Box, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Feature from './Feature';
import { useTranslations } from 'next-intl';

export default function SplashScreen() {
  const context = useContext(OnboardingContext);
  const t = useTranslations("onboarding.vehicle.page1")

  const handleNext = () => {
    context.setCurrentPage(1);
  }

  return(
   <Box sx={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 2,
    textAlign: 'center',
    backgroundColor: "white",
    borderRadius: '25px',
    margin: "0 50px 0 50px",
    boxShadow: (theme) => theme.shadows[3],
   }}>
    <Box sx={{
      backgroundColor: (theme) => theme.palette.primary.light,
      borderRadius: '25px',
    }}>
      <picture>
        <source media="(max-width: 600px)" srcSet="/driver/assets/Add_car.svg" />
        <img src="/driver/assets/Add_car.svg" alt="Splash Screen" style={{ width: '50%', height: 'auto' }} />
      </picture>
    </Box>
      <Typography variant="h5" sx={{ marginTop: 2, color: (theme) => theme.palette.primary.dark }}>
        <strong>{t("title1")}<br />
        {t("title2")}</strong>
      </Typography>
      <Typography variant="body1" sx={{
        color: "gray"
      }}>
        {t("subline")}
      </Typography>
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      padding: 2,
      marginTop: 2,
    }}>
      <Feature icon = "/driver/assets/feature1-onboarding.svg" title={t("f1.title")} desc={t("f1.description")} />
      <Feature icon = "/driver/assets/feature2-onboarding.svg" title={t("f2.title")} desc={t("f2.description")} />
    </Box>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: 2,
      }}>
      <Button sx={{
        backgroundColor: (theme) => theme.palette.primary.main,
        color: "white",
        borderRadius: '15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: 2,
        fontSize: '1.15rem',
        textTransform: 'none',
        gap: 1,
      }} onClick={handleNext}>
        <AddIcon />
        {t("prompt")}
      </Button>
      <Typography variant="body2" sx={{
        color: "gray",
        marginTop: 2,
      }}>
       {t("secure")}
      </Typography>
    </Box>
   </Box>
  )
}
