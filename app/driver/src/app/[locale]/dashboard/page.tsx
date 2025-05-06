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

function Dashboard() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const router = useRouter();

  useEffect(() => {
    const loggedIn = async () => {
      const locale = window.location.pathname.split("/")[1];
      if (!await getUser()) {
        router.push(`/${locale}/login`);
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
        </Box>
      </DashboardContext.Provider>
    </ThemeProvider>
  );
}

export default Dashboard;
