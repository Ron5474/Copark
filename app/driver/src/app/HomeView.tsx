/**
 * @file HomeView.tsx
 * @description This file contains the HomeView component.
 * @author Swayam Shah
 */

import { Box, Toolbar, Typography } from "@mui/material";
import { CssBaseline } from "@mui/material";
import TopBar from "./shared/TopBar";
import Footer from "./shared/Footer";
import ZoneField from "./homeComponents/ZoneField";
import GetStartedButton from "./homeComponents/GetStartedButton";
import HowToUseCard from "./homeComponents/UseCard";

function HomeView() {
  return (
    <>
    <CssBaseline />
    <TopBar />
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
        height: "200px",
        borderRadius: "30px",
        paddingTop: "35px"
      }}>
        <Typography sx={{color: "white", fontSize: "40px", fontWeight: 700}}>Park. Pay. Relax.</Typography>
        <ZoneField />
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