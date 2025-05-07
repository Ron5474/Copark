'use client'
/**
 * @file getStartedButton.tsx
 * @description This file contains the Get Started button component.
 * @author Swayam Shah
 */

import { Button } from "@mui/material";
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ThemeProvider } from "@emotion/react";
import theme from "../theme";


function GetStartedButton() {
  const router = useRouter();
  const t = useTranslations('landingPage');


  const handleClick = async () => {
    const locale = window.location.pathname.split("/")[1];
    router.push(`/driver/${locale}/login`);
  };

  return (
    <ThemeProvider theme={theme}>
    <Button
      onClick={() => handleClick()}
      variant="contained"
      aria-label="go-to-login"
      sx={{
        backgroundColor: (theme) => theme.palette.secondary.main,
        color: "white",
        fontSize: "20px",
        fontWeight: 700,
        borderRadius: "30px",
        padding: "10px 20px",
      }}
    >
      {t('Get Started')}
      <ArrowRightAltIcon sx={{ marginLeft: "10px" }} />
    </Button>
    </ThemeProvider>
  );
}

export default GetStartedButton;
