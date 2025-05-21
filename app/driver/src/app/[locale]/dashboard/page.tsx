"use client";
/**
 * @file page.tsx
 * @description This file contains the Dashboard page.
 * @author Swayam Shah
 */

import React, { useEffect, useState } from "react";
import DashboardView from "./DashboardView";
import { DashboardContext } from "./context";
import { ThemeProvider, Box, CssBaseline } from "@mui/material";
import theme from "../theme";
import Topbar from "../shared/Topbar";
import { getUser } from "../shared/actions";
import { useRouter } from "@/i18n/navigation";
import ViewVehicles from "../vehicle/member/Vehicle"
// import AddVehicle from "../vehicle/AddForm";
import { userLoginSignUpAttempt } from "./actions";
// import BuyPermit from "../permit/View";
import MobileNavBar from "./BottomNav";
import BuyPermit from "../zone/View";
import TicketView from "../ticket/TicketView"
import { signOut } from "next-auth/react";
import { useLocale } from "next-intl";
import { SessionProvider } from "next-auth/react";

function Dashboard() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const router = useRouter();
  const locale = useLocale();
  useEffect(() => {
    const loggedIn = async () => {
      if (!await getUser()) {
        router.push(`/login`);
      } else if (!await userLoginSignUpAttempt(locale)) {
        signOut({ callbackUrl: new URL(`/driver/${locale}/login`, window.location.origin).toString() });

      }   
    }
    loggedIn();
  }, [router, locale]);

  return (
    <ThemeProvider theme={theme}>
      <SessionProvider basePath="/driver/api/auth"> 
        <DashboardContext.Provider value={{
          currentPage: currentPage,
          setCurrentPage: setCurrentPage}}>
            <CssBaseline />
            <Topbar />
            <Box sx={{ height: '100vh', pt: "70px" }}>
            {currentPage === "dashboard" && (
              <DashboardView />
            )}
            {currentPage === "tickets" && (
              <TicketView />
            )}
            {currentPage === "garage" && (
              <ViewVehicles />
            )}
            {/* {currentPage === "add-vehicle" && (
              <AddVehicle />
            )} */}
            {currentPage === 'buy-permit' && (
              <BuyPermit />
            )}
          </Box>
          <MobileNavBar/>
        </DashboardContext.Provider>
      </SessionProvider>
    </ThemeProvider>
  );
}

export default Dashboard;
