/**
 * @file footer.tsx
 * @description This file contains the Footer component.
 * @author Swayam Shah
 */

import { Box, Button } from "@mui/material";

function Footer() {
  return (
       <Box sx={{
        // position: "fixed",
        // bottom: 0,
        width: "100%",
        backgroundColor: (theme) => theme.palette.primary.light,
        padding: '15px 12px 5px 12px',
        display: "flex",
        marginTop: "30px",
        justifyContent: "space-between",
        flexDirection: "column",
        borderRadius: "30px 30px 0 0",
       }}>
        <Box sx={{
           display: "flex",
           rowGap: "10px",
           flexDirection: "column",
           gap: "10px",
         }}>
         <picture style={{
          display: "flex",
          rowGap: "10px",
          flexDirection: "row",
          alignItems: "center",
          gap: "10px",
         }}>
            <source srcSet="/logo-noBg.png" type="image/png" />
            <img src="/logo-noBg.png" alt="Logo" width={52} height={52} aria-label="copark-footer-logo" />
            <h1 style={{ fontSize: "26px", color: "#000000", fontFamily: "[Poppins]", fontWeight: 300}}>Copark™</h1>
         </picture>
          <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "5px",
            fontSize: "14px",
            color: "#000000",
            fontWeight: 500,
          }}>
            <a aria-label="personal-info-link">Do Not Sell My Personal Info</a>
            <a aria-label="privacy-policy-link">Privacy Policy</a>
            <a aria-label="service-terms-link">Terms of Service</a>
            <a aria-label="contact-us-link">Contact Us</a>
            <Button sx={{padding: 0}}>Dark Mode</Button> {/* TODO: Change theme and change this text based on current theme */}
            </Box>
         </Box>
         <p style={{ fontSize: "14px", color: "#000000", fontWeight: 500 }}>© 2025 Copark. All rights reserved.</p>
       </Box>
  )
  }

export default Footer;