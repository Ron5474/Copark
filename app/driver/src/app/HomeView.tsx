/**
 * @file HomeView.tsx
 * @description This file contains the HomeView component.
 * @author Swayam Shah
 */

// import { Box } from "@mui/material";
import { CssBaseline } from "@mui/material";
import TopBar from "./shared/topBar";
import Footer from "./shared/footer";

function HomeView() {
  return (
    <>
    <CssBaseline />
    <TopBar />
    <Footer />
    </>
  );
}

export default HomeView;