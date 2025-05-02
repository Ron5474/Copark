import { AppBar, Avatar, Box, IconButton } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import Image from "next/image";

function TopBar() {
  return (
  <AppBar position="static"
    sx={{
      backgroundColor: "#DBEEEE",
      width: "100%",
      top:0,
      padding: '15px 12px 15px 12px',
      display: "flex",
      justifyContent: "space-between",
      flexDirection: "row",
      alignItems: "center",
      borderBottom: "3px solid #41A9AB",
    }}>
     <Image src="/logo-noBg.png" alt="Logo" width={52} height={52} />
     <Box sx={{display: "flex", gap: "10px", alignItems: "center"}}>
      <Avatar sx={{width: "40px", height: "40px"}}/>
      <IconButton>
        <MenuIcon sx={{color: "black"}}/>
      </IconButton>
     </Box>
  </AppBar>)
}

export default TopBar;