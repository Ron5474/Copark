// 'use client'

// import {
//   AppBar,
//   Box, 
//   // IconButton
// } from "@mui/material";
// // import MenuIcon from '@mui/icons-material/Menu';
// import theme from "../theme";
// import { useRouter } from "@/i18n/navigation";


// function Topbar() {
//   const primaryColorMain = theme.palette.primary.main;
//   const primaryColorLight = theme.palette.primary.light;
//   const router = useRouter();

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
//       <picture onClick={() => router.push("/")} style={{cursor: "pointer"}}>
//         <source srcSet="/assets/logo-noBg.png" type="image/png" />
//         <img src="/assets/logo-noBg.png" alt="Logo" width={52} height={52} aria-label="copark-logo" />
//       </picture>
//      <Box sx={{display: "flex", gap: "10px", alignItems: "center"}}>
//       {/* <IconButton>
//         <MenuIcon sx={{color: "black"}}/>
//       </IconButton> */}
//      </Box>
//   </AppBar>)
// }

// export default Topbar;
'use client'

import { useState } from "react"
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  Typography,
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import theme from "../theme"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

const Topbar = () => {
  const t = useTranslations("Topbar")
  const [mobileOpen, setMobileOpen] = useState(false)
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const router = useRouter()

  const primaryColorMain = theme.palette.primary.main
  const primaryColorLight = theme.palette.primary.light

  const navItems = [
    { label: t("features"), id: "features" },
    { label: t("howItWorks"), id: "how-it-works" },
    { label: t("permits"), id: "permits" },
    { label: t("testimonials"), id: "testimonials" },
  ]

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setMobileOpen(false)
  }

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <picture onClick={() => router.push("/")} style={{ cursor: "pointer" }}>
        <source srcSet="/assets/logo-noBg.png" type="image/png" />
        <img src="/assets/logo-noBg.png" alt="Logo" width={52} height={52} aria-label="copark-logo" />
      </picture>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.id} onClick={() => scrollToSection(item.id)}>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: primaryColorLight,
          borderBottom: `3px solid ${primaryColorMain}`,
          padding: "15px 12px",
        }}
        elevation={1}
      >
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1 }}>
            <picture onClick={() => router.push("/")} style={{ cursor: "pointer" }}>
              <source srcSet="/assets/logo-noBg.png" type="image/png" />
              <img src="/assets/logo-noBg.png" alt="Logo" width={40} height={40} aria-label="copark-logo" />
            </picture>
            <Typography variant="h6" sx={{ color: "#00BFA5", fontWeight: "bold" }}>
              CoPark
            </Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ display: "flex", gap: 3, mr: 3 }}>
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  sx={{ color: "text.primary" }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {isMobile && (
            <IconButton onClick={handleDrawerToggle} sx={{ color: "text.primary" }}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  )
}

export default Topbar