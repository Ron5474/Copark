// 'use client'
// /**
//  * @file getStartedButton.tsx
//  * @description This file contains the Get Started button component.
//  * @author Swayam Shah
//  */

// import { Button } from "@mui/material";
// import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
// import { useRouter } from "next/navigation";
// import { useLocale } from "next-intl";
// import { useTranslations } from "next-intl";
// import { ThemeProvider } from "@emotion/react";
// import theme from "../theme";


// function GetStartedButton() {
//   const router = useRouter();
//   const t = useTranslations('landingPage');
//   const locale = useLocale();

//   const handleClick = async () => {
//     // console.log("URL: ", process.env.NEXT_PUBLIC_DRIVER_APP_URL);
//     router.push(`${process.env.NEXT_PUBLIC_DRIVER_APP_URL}/${locale}`);
//   };

//   return (
//     <ThemeProvider theme={theme}>
//     <Button
//       onClick={() => handleClick()}
//       variant="contained"
//       aria-label="go-to-login"
//       sx={{
//         backgroundColor: (theme) => theme.palette.secondary.main,
//         color: "white",
//         fontSize: "20px",
//         fontWeight: 700,
//         borderRadius: "30px",
//         padding: "10px 20px",
//       }}
//     >
//       {t('Get Started')}
//       <ArrowRightAltIcon sx={{ marginLeft: "10px" }} />
//     </Button>
//     </ThemeProvider>
//   );
// }

// export default GetStartedButton;

import { Button } from "@mui/material"
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useTranslations } from "next-intl"

type Props = {
  label?: string
  onClick: () => void
}

export default function GetStartedButton({ label, onClick }: Props) {
  const t = useTranslations("GetStartedButton")
  return (
    <Button
      onClick={onClick}
      variant="contained"
      size="large"
      aria-label="go-to-login"
      endIcon={<ArrowForwardIcon />}
      sx={{
        bgcolor: "#000",
        color: "#fff",
        "&:hover": {
          backgroundColor: "#333",
        },
      }}
    >
      {label ?? t("label")}
    </Button>
  )
}


