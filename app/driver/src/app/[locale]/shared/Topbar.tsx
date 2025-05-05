import { AppBar, Avatar, Box, IconButton } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import theme from "../theme";
// import { auth } from "@/auth";


function Topbar() {
  // const session = await auth()
  const primaryColorMain = theme.palette.primary.main;
  const primaryColorLight = theme.palette.primary.light;
  return (
  <AppBar position="fixed"
    sx={{
      // backgroundColor: (theme) => theme.palette.primary.light,
      backgroundColor: primaryColorLight,
      width: "100%",
      top:0,
      padding: '15px 12px 15px 12px',
      display: "flex",
      justifyContent: "space-between",
      flexDirection: "row",
      alignItems: "center",
      borderBottom: `3px solid ${primaryColorMain}`,
    }}>
      <picture>
        <source srcSet="/logo-noBg.png" type="image/png" />
        <img src="/logo-noBg.png" alt="Logo" width={52} height={52} aria-label="copark-logo" />
      </picture>
     <Box sx={{display: "flex", gap: "10px", alignItems: "center"}}>
      {/* {session?.user? <Avatar sx={{width: "40px", height: "40px"}} src={session.user.image || undefined}/> : <Avatar sx={{width: "40px", height: "40px"}}/>} */}
      <Avatar sx={{width: "40px", height: "40px"}}/>
      <IconButton>
        <MenuIcon sx={{color: "black"}}/>
      </IconButton>
     </Box>
  </AppBar>)
}

export default Topbar;