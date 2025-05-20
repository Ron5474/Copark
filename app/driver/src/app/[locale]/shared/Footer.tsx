/**
 * @file footer.tsx
 * @description This file contains the Footer component.
 * @author Swayam Shah
 */
import { Box } from "@mui/material";
// import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import theme from "../theme";
import { useRouter } from '@/i18n/navigation';

function Footer() {
  const router = useRouter()
  const t = useTranslations("footer");
  const PrimaryColorLight = theme.palette.primary.light;
  return (
    <Box sx={{
      position: "relative",
      bottom: 0,
      marginBottom: "0px",
      width: "100%",
      backgroundColor: PrimaryColorLight,
      padding: '15px 12px 0px 12px',
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
          <source srcSet="/driver/assets/logo-noBg.png" type="image/png" />
          <img src="/driver/assets/logo-noBg.png" alt="Logo" width={52} height={52} aria-label="copark-footer-logo" />
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
          {/* <a aria-label="personal-info-link">{t("Do Not Sell My Personal Info")}</a> */}
          <a onClick={() => router.push('/privacy')} aria-label="privacy-policy-link">{t("Privacy Policy")}</a>
          <a onClick={() => router.push('/tos')} aria-label="service-terms-link">{t("Terms of Service")}</a>
          <a aria-label="contact-us-link">{t("Contact Us")}</a>
          {/* <Button sx={{padding: 0}}>{t("Dark Mode")}</Button> TODO: Change theme and change this text based on current theme */}
        </Box>
      </Box>
      <p style={{ fontSize: "14px", color: "#000000", fontWeight: 500 }}>{t("Rights Reserved")}</p>
    </Box>
  )
}

export default Footer;