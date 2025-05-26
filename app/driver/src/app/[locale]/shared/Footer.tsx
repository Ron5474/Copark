/**
 * @file footer.tsx
 * @description This file contains the Footer component.
 * @author Swayam Shah
 */
import { Box, Button } from "@mui/material";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import theme from "../theme";
import Typography from '@mui/material/Typography';

function Footer() {
  const router = useRouter()
  const locale = useLocale();
  const t = useTranslations("footer");
  const pathname = usePathname();
  const PrimaryColorLight = theme.palette.primary.light;

  const SwitchLocale = (newLocale: string) => {
    if (newLocale !== locale) {
       router.replace(
      {pathname},
      {locale: newLocale});
    }
  };
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
          <Typography
              component="a"
              onClick={() => {router.push(`${process.env.NEXT_PUBLIC_MARKETING_URL}/${locale}/privacy`)}} 
              aria-label="privacy-policy-link"
              sx={{
                cursor: 'pointer',
                textDecoration: 'underline',
                color: 'primary.main',
                fontSize: 'inherit',
                fontWeight: 'inherit',
                '&:active': {
                  transform: 'scale(0.98)',
                }
              }}
            >
              {t("Privacy Policy")}
            </Typography>

            <Typography
              component="a"
              onClick={() => {router.push(`${process.env.NEXT_PUBLIC_MARKETING_URL}/${locale}/tos`)}} 
              aria-label="service-terms-link"
              sx={{
                cursor: 'pointer',
                textDecoration: 'underline',
                color: 'primary.main',
                fontSize: 'inherit',
                fontWeight: 'inherit',
                '&:active': {
                  transform: 'scale(0.98)',
                }
              }}
            >
              {t("Terms of Service")}
            </Typography>
          {/* <a aria-label="personal-info-link">{t("Do Not Sell My Personal Info")}</a> */}
          {/* <a aria-label="contact-us-link">{t("Contact Us")}</a> */}
          {/* <Button sx={{padding: 0}}>{t("Dark Mode")}</Button> TODO: Change theme and change this text based on current theme */}
          {locale == 'en' && <Button onClick={() => SwitchLocale('es')} sx={{display: "flex", alignItems: "center", gap: "10px"}}>
                        <picture>
                          <source srcSet="/driver/assets/flags/es.png" type="image/png" />
                          <img src="/driver/assets/flags/es.png" alt="Spanish Flag" width={40} />
                        </picture>
                        Spanish
                        </Button>}
                      {locale == 'es' && <Button onClick={() => SwitchLocale('en')} sx={{display: "flex", alignItems: "center", gap: "10px"}}>
                        <picture>
                          <source srcSet="/driver/assets/flags/en.png" type="image/png" />
                          <img src="/driver/assets/flags/en.png" alt="English Flag" width={40} />
                        </picture>
                          Inglés
                        </Button>}
        </Box>
      </Box>
      <p style={{ fontSize: "14px", color: "#000000", fontWeight: 500 }}>{t("Rights Reserved")}</p>
    </Box>
  )
}

export default Footer;