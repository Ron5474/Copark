import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { useTranslations } from 'next-intl';

export default function PolicyView() {
  const t = useTranslations("Privacy Policy");
  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: '64px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexGrow: 1, // This allows it to expand to fill available space
        py: 4, // Add some padding top and bottom
      }}
    >
      <Stack alignItems="center" spacing={3} sx={{ width: '100%', margin: 'auto', padding: 2 }}>
        <Typography component="h1" variant="h4" align="center">
          {t('title')}
        </Typography>
        <Paper
          elevation={2}
          sx={{
            p: 3,
            maxHeight: '50vh',
            overflow: 'auto',
            width: '100%'
          }}
        >
          <Typography variant="h6" gutterBottom>
            {t("content title")}
          </Typography>
          <Typography variant="body2" component="p">
            {t("policy statement")}
          </Typography>
          <Typography variant="body2" component="p">
            1. <strong>{t("policy.line1.point")}</strong>{t("policy.line1.details")}
          </Typography>
          <Typography variant="body2" component="p">
            2. <strong>{t("policy.line2.point")}</strong>{t("policy.line2.details")}
          </Typography>
          <Typography variant="body2" component="p">
            3. <strong>{t("policy.line3.point")}</strong> {t("policy.line3.details")}
          </Typography>
          <Typography variant="body2" component="p">
            4. <strong>{t("policy.line4.point")}</strong>{t("policy.line4.details")}
          </Typography>
          <Typography variant="body2" component="p">
            5. <strong>{t("policy.line5.point")}</strong>{t("policy.line5.details")}
          </Typography>
          <Typography variant="body2" component="p">
            6. <strong>{t("policy.line6.point")}</strong>{t("policy.line6.details")}
          </Typography>
          <Typography variant="body2" component="p">
            7. <strong>{t("policy.line7.point")}</strong>{t("policy.line7.details")}
          </Typography>
          <Typography variant="body2" component="p">
            8. <strong>{t("policy.line8.point")}</strong>{t("policy.line8.details")}
          </Typography>
        </Paper>
      </Stack>
    </Container>
  );
}