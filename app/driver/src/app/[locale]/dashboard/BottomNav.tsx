// "use client"

// import {
//   BottomNavigation,
//   BottomNavigationAction,
//   Paper,
// } from "@mui/material"
// import HomeIcon from "@mui/icons-material/Home"
// import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber"
// import DirectionsCarIcon from "@mui/icons-material/DirectionsCar"
// import LogoutIcon from "@mui/icons-material/Logout"
// import { useTranslations } from "next-intl";
// import { useContext, useEffect, useState } from "react"
// import { signOut } from 'next-auth/react'
// import { Session } from 'next-auth';
// import { useRouter } from 'next/navigation'

// import { DashboardContext } from "./context"
// import { getUser } from '../shared/actions';

// export default function MobileNavBar() {
//   const t = useTranslations('bottomNav');
//   const [session, setSession] = useState<Session | undefined>(undefined)
//   const { currentPage, setCurrentPage } = useContext(DashboardContext)
//   const [value, setValue] = useState(0)
//   const router = useRouter()

//   const handleLogout = async () => {
//     const locale = window.location.pathname.split('/')[1]
//     if (!session) {
//       router.push(`/${locale}/login`)
//       return;
//     }
//     signOut({ callbackUrl: `/${locale}` })
//   };


//   useEffect(() => {
//     async function fetchUser() {
//       const res = await getUser()
//       setSession(res)
//     }
//     fetchUser()
//   }, [])

//   useEffect(() => {
//     const pageToIndex = {
//       home: 0,
//       tickets: 1,
//       garage: 2,
//       logout: 3,
//     } as const
//     setValue(pageToIndex[currentPage as keyof typeof pageToIndex] || 0)
//   }, [currentPage])

//   const handleChange = (event: React.SyntheticEvent, newValue: number) => {
//     const indexToPage = ["dashboard", "tickets", "garage", "logout"]
//     const selectedPage = indexToPage[newValue]
//     setValue(newValue)
//     setCurrentPage(selectedPage)
//   }

//   return (
//     <Paper
//       elevation={3}
//       sx={{
//         position: "fixed",
//         bottom: 0,
//         left: 0,
//         right: 0,
//         zIndex: 1000,
//         background: "#e0f7f7",
//         borderTop: "1px solid #80cbc4",
//       }}
//     >
//       <BottomNavigation
//         showLabels
//         value={value}
//         onChange={handleChange}
//         sx={{
//           background: "transparent",
//           "& .Mui-selected": { color: "#00796b" },
//         }}
//       >
//         <BottomNavigationAction label={t('home')} icon={<HomeIcon />} />
//         <BottomNavigationAction label={t('tickets')} icon={<ConfirmationNumberIcon />} />
//         <BottomNavigationAction label={t('garage')} icon={<DirectionsCarIcon />} />
//         <BottomNavigationAction label={t('logout')} icon={<LogoutIcon />} onClick={handleLogout}/>
//       </BottomNavigation>
//     </Paper>
//   )
// }
'use client'

import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Menu,
  MenuItem,
} from "@mui/material"
import HomeIcon from "@mui/icons-material/Home"
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber"
import SettingsIcon from "@mui/icons-material/Settings"
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar"
import LogoutIcon from "@mui/icons-material/Logout"
import { useLocale, useTranslations } from "next-intl"
import { useContext, useEffect, useState } from "react"
import { signOut } from 'next-auth/react'
import { Session } from 'next-auth'

import { DashboardContext } from "./context"
import { getUser } from '../shared/actions'
import { usePathname, useRouter } from "@/i18n/navigation"

export default function MobileNavBar() {
  const t = useTranslations('bottomNav')
  const [session, setSession] = useState<Session | undefined>(undefined)
  const { currentPage, setCurrentPage } = useContext(DashboardContext)
  const [value, setValue] = useState(0)
  const router = useRouter()
  const locale = useLocale();
  const pathname = usePathname()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale !== locale) {
       router.replace(
      {pathname},
      {locale: newLocale});
    }
  }

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleSettingsClose = () => {
    setAnchorEl(null)
  }

  const handleGarage = () => {
    setCurrentPage('garage')
    handleSettingsClose()
  }

  const handleLogout = async () => {
    handleSettingsClose()
    const locale = window.location.pathname.split('/')[1]
    if (!session) {
      router.push(`/${locale}/login`)
      return
    }
    signOut({ callbackUrl: `/${locale}` })
  }

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
    } as const
    setValue(pageToIndex[currentPage as keyof typeof pageToIndex] || 0)
  }, [currentPage])

  const indexToPage = ["dashboard", "tickets", "settings"]

const handleChange = (event: React.SyntheticEvent, newValue: number) => {
  setValue(newValue)
  if (indexToPage[newValue] === "settings") {
    handleSettingsClick(event as React.MouseEvent<HTMLElement>)
    return
  }
  setCurrentPage(indexToPage[newValue])
}

  return (
    <>
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
          <BottomNavigationAction label={t('home')} icon={<HomeIcon />} />
          <BottomNavigationAction label={t('tickets')} icon={<ConfirmationNumberIcon />} />
          <BottomNavigationAction label='Settings' icon={<SettingsIcon />} onClick={handleSettingsClick}/>
        </BottomNavigation>
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleSettingsClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <MenuItem onClick={() => handleLanguageChange(locale === 'en' ? 'es' : 'en')}>
          {locale === 'en' ? (
            <>
            <picture>
              <source srcSet="/driver/assets/language/es.svg" type="image/svg+xml" />
              <img src="/driver/assets/language/es.svg" alt="Spanish Flag" style={{ width: 24, height: 24, marginRight: 8 }} />
            </picture>
            Spanish
            </>
          ) : (<>
           <picture>
              <source srcSet="/driver/assets/language/en.svg" type="image/svg+xml" />
              <img src="/driver/assets/language/en.svg" alt="Spanish Flag" style={{ width: 24, height: 24, marginRight: 8 }} />
            </picture>
            Inglés
          </>)}
        </MenuItem>
        <MenuItem onClick={handleGarage}>
          <DirectionsCarIcon sx={{ mr: 1 }} />
          {t('garage')}
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1 }} />
          {t('logout')}
        </MenuItem>
      </Menu>
    </>
  )
}
