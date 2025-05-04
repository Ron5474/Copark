/**
 * @file HomeView.tsx
 * @description This file contains the HomeView component.
 * @author Swayam Shah
 */

import { Box, Toolbar, Typography } from "@mui/material";
import { CssBaseline } from "@mui/material";
import Topbar from "./shared/Topbar";
import Footer from "./shared/Footer";
import ZoneField from "./homeComponents/ZoneField";
import GetStartedButton from "./homeComponents/GetStartedButton";
import HowToUseCard from "./homeComponents/UseCard";
import { useTranslations } from "next-intl";

function HomeView() {
  const t = useTranslations('landingPage');
  return (
    <>
    <CssBaseline />
    <Topbar />
    <Toolbar />
    <Box sx={{
      height: "100vh",
    }}>
      <Box sx={{
        display: "flex",
        flexDirection: "column",
        padding: '30px 15px 5px 15px',
      }}>
      <Box sx={{
        marginTop: "30px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundImage: "url('/cover.png')",
        backgroundSize: "cover",
        width: "100%",
        height: "fit-content",
        borderRadius: "30px",
        paddingTop: "35px",
        paddingBottom: "35px",
        paddingLeft: "15px",
      }}>
        <Typography sx={{color: "white", fontSize: "40px", fontWeight: 700}}>{t('card title')}</Typography>
        <ZoneField text = {t('zone-prompt')}/>
      </Box>
      <Box sx={{
        marginTop: "30px",
        marginBottom: "10px",
      }}>
        <Typography sx={{
          fontSize: "40px",
          color: (theme) => theme.palette.secondary.main,
          lineHeight: "40px"
        }}>
        Save the hassle
        </Typography>
        <Typography sx={{
          fontSize: "20px",
          color: "black",
          lineHeight: "20px",
        }}>
          of entering License plate each time
          </Typography>
      </Box>
      <GetStartedButton />

      <Typography sx={{color: "black", fontSize: "32px", fontWeight: 700, marginTop: "30px"}}>
        How to use:
      </Typography>
      <Box sx={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        marginTop: "10px",}}>
      <HowToUseCard number={1} image="/howV1.jpeg" description="Enter your zone number" variant="secondary"/>
      <HowToUseCard number={2} image="/howV1.jpeg" description="Select your vehicle type" variant="primary"/>
      <HowToUseCard number={3} image="/howV1.jpeg" description="Enter your license plate" variant="secondary"/>
      <HowToUseCard number={4} image="/howV1.jpeg" description="Select your parking duration" variant="primary"/>
      <HowToUseCard number={5} image="/howV1.jpeg" description="Pay and park" variant="secondary"/>
      <HowToUseCard number={6} image="/howV1.jpeg" description="Relax and enjoy" variant="primary"/>
      </Box>
      </Box>
      <Footer />
    </Box>
    </>
  );
}

export default HomeView;