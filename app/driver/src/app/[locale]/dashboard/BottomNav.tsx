"use client"

import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from "@mui/material"
import HomeIcon from "@mui/icons-material/Home"
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber"
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar"
import LogoutIcon from "@mui/icons-material/Logout"
import { useContext, useEffect, useState } from "react"
import { signOut } from 'next-auth/react'
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation'

import { DashboardContext } from "./context"
import { getUser } from '../shared/actions';

export default function MobileNavBar() {
  const [session, setSession] = useState<Session | undefined>(undefined)
  const { currentPage, setCurrentPage } = useContext(DashboardContext)
  const [value, setValue] = useState(0)
  const router = useRouter()

  const handleLogout = async () => {
    const locale = window.location.pathname.split('/')[1]
    if (!session) {
      router.push(`/${locale}/login`)
      return;
    }
    signOut({ callbackUrl: `/${locale}` })
  };


  useEffect(() => {
    async function fetchUser() {
      const res = await getUser()
      setSession(res)
    }
    fetchUser()
  }, [])

  useEffect(() => {
    const pageToIndex = {
      home: 0,
      tickets: 1,
      garage: 2,
      logout: 3,
    } as const
    setValue(pageToIndex[currentPage as keyof typeof pageToIndex] || 0)
  }, [currentPage])

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    const indexToPage = ["dashboard", "tickets", "garage", "logout"]
    const selectedPage = indexToPage[newValue]
    setValue(newValue)
    setCurrentPage(selectedPage)
  }

  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "#e0f7f7",
        borderTop: "1px solid #80cbc4",
      }}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={handleChange}
        sx={{
          background: "transparent",
          "& .Mui-selected": { color: "#00796b" },
        }}
      >
        <BottomNavigationAction label="Home" icon={<HomeIcon />} />
        <BottomNavigationAction label="Tickets" icon={<ConfirmationNumberIcon />} />
        <BottomNavigationAction label="Garage" icon={<DirectionsCarIcon />} />
        <BottomNavigationAction label="Logout" icon={<LogoutIcon />} onClick={handleLogout}/>
      </BottomNavigation>
    </Paper>
  )
}
