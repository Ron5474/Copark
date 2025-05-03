/**
 * @file HomeView.tsx
 * @description This file contains the HomeView component.
 * @author Swayam Shah
 */

import { Box, Toolbar } from "@mui/material";
import { CssBaseline } from "@mui/material";
import TopBar from "./shared/topBar";
import Footer from "./shared/footer";

function HomeView() {
  return (
    <>
    <CssBaseline />
    <TopBar />
    <Toolbar />
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      height: "100vh",
      padding: '30px 15px 5px 15px',
    }}>
      <Box sx={{
        marginTop: "30px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
        backgroundImage: "url('/cover.png')",
        backgroundSize: "cover",
        width: "100%",
        height: "200px",
        borderRadius: "30px"
      }}>
      </Box>

    </Box>
    <Footer />
    </>
  );
}

export default HomeView;