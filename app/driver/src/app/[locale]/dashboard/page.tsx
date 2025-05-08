"use client";
/**
 * @file page.tsx
 * @description This file contains the Dashboard page.
 * @author Swayam Shah
 */

import React, { useEffect, useState } from "react";
import DashboardView from "./DashboardView";
import { DashboardContext } from "./context";
import { ThemeProvider, Toolbar, Box, CssBaseline } from "@mui/material";
import theme from "../theme";
import Topbar from "../shared/Topbar";
import { getUser } from "../shared/actions";
import { useRouter } from "next/navigation";
import ViewVehicles from "../Vehicle/member/Vehicle"
import AddVehicle from "../Vehicle/AddForm";
import { userLoginSignUpAttempt } from "./actions";
// import BuyPermit from "../permit/View";
import BuyPermit from "../zone/View";
import { signOut } from "next-auth/react";

function Dashboard() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const router = useRouter();

  useEffect(() => {
    const loggedIn = async () => {
      const locale = window.location.pathname.split("/")[1];
      if (!await getUser()) {
        router.push(`/${locale}/login`);
      } else if (!await userLoginSignUpAttempt()) {
        signOut({ callbackUrl: `/${locale}/login` });
      }   
    }
    loggedIn();
  }, [router]);

  return (
    <ThemeProvider theme={theme}>
      <DashboardContext.Provider value={{
        currentPage: currentPage,
        setCurrentPage: setCurrentPage}}>
          <CssBaseline />
          <Topbar />
          <Box sx={{ height: '100vh' }}>
            <Toolbar />
            <Toolbar />
          {currentPage === "dashboard" && (
            <DashboardView />
          )}
          {currentPage === "garage" && (
            <ViewVehicles />
          )}
          {currentPage === "add-vehicle" && (
            <AddVehicle />
          )}
          {currentPage === 'buy-permit' && (
            <BuyPermit />
          )}
        </Box>
      </DashboardContext.Provider>
    </ThemeProvider>
  );
}

export default Dashboard;
