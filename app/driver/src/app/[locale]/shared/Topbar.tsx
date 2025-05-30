// 'use client'

// import { AppBar, Box, IconButton } from "@mui/material";
// // import MenuIcon from '@mui/icons-material/Menu';
// import theme from "../theme";
// import UserAvatar from "./UserAvatar";
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import { useContext } from "react";

// import { DashboardContext } from "../dashboard/context";

// function Topbar() {
//   const primaryColorMain = theme.palette.primary.main;
//   const primaryColorLight = theme.palette.primary.light;

//   const { currentPage, setCurrentPage } = useContext(DashboardContext);

//   const handleBackClick = () => {
//     setCurrentPage("dashboard");
//   };

//   return (
//   <AppBar position="fixed"
//     sx={{
//       // backgroundColor: (theme) => theme.palette.primary.light,
//       backgroundColor: primaryColorLight,
//       width: "100%",
//       top:0,
//       padding: '15px 12px 15px 12px',
//       display: "flex",
//       justifyContent: "space-between",
//       flexDirection: "row",
//       alignItems: "center",
//       borderBottom: `3px solid ${primaryColorMain}`,
//     }}>
//       {currentPage && currentPage !== "dashboard" &&(
//           <IconButton onClick={handleBackClick} aria-label="back to dashboard">
//             <ArrowBackIcon sx={{ color: "black" }} />
//           </IconButton>
//         )}
//       <picture>
//         <source srcSet="/driver/assets/logo-noBg.png" type="image/png" />
//         <img src="/driver/assets/logo-noBg.png" alt="Logo" width={52} height={52} aria-label="copark-logo" />
//       </picture>
//      <Box sx={{display: "flex", gap: "10px", alignItems: "center"}}>
//       <UserAvatar />
//       {/* <IconButton>
//         <MenuIcon sx={{color: "black"}}/>
//       </IconButton> */}
//      </Box>
//   </AppBar>)
// }

// export default Topbar;
'use client'

import { AppBar, Box, IconButton, Typography } from "@mui/material"
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useContext } from "react"
import theme from "../theme"
import { DashboardContext } from "../dashboard/context"
import UserAvatar from "./UserAvatar"

function Topbar() {
  const primaryColorMain = theme.palette.primary.main
  const primaryColorLight = theme.palette.primary.light

  const { currentPage, setCurrentPage } = useContext(DashboardContext) || {}

  const handleBackClick = () => {
    setCurrentPage("dashboard")
  }

  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        backgroundColor: primaryColorLight,
        width: "100%",
        top: 0,
        borderBottom: `3px solid ${primaryColorMain}`,
        padding: "8px 12px",
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box sx={{ width: 40, display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
          {currentPage && currentPage !== "dashboard" ? (
            <IconButton
              onClick={handleBackClick}
              aria-label="back to dashboard"
              size="large"
            >
              <ArrowBackIcon sx={{ color: "black" }} />
            </IconButton>
          ) : (
            <Box sx={{ ml: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{color: theme.palette.primary.main}}>
                CoPark
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <picture>
            <source srcSet="/driver/assets/logo-noBg.png" type="image/png" />
            <img
              src="/driver/assets/logo-noBg.png"
              alt="CoPark Logo"
              width={44}
              height={44}
              aria-label="copark-logo"
              style={{ maxHeight: 44 }}
            />
          </picture>
        </Box>

        <Box sx={{ width: 40, display: "flex", justifyContent: "flex-end" }}>
          <UserAvatar />
        </Box>
      </Box>
    </AppBar>
  )
}

export default Topbar
