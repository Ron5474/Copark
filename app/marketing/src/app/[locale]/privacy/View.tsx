import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

export default function PolicyView() {
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
          Privacy Policy
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
            Your Privacy Matters
          </Typography>
          <Typography variant="body2" component="p">
            Effective Date: May 19, 2025. This Privacy Policy describes how Copark collects, uses, and shares your personal information when you use our parking management services.
          </Typography>
          <Typography variant="body2" component="p">
            1. <strong>Information We Collect:</strong> We collect vehicle license plate numbers, parking location data, payment information, account details, device information, and usage statistics to provide our services.
          </Typography>
          <Typography variant="body2" component="p">
            2. <strong>How We Use Your Information:</strong> We use your information to process parking transactions, enforce parking regulations, improve our services, communicate with you, and maintain security of our platform.
          </Typography>
          <Typography variant="body2" component="p">
            3. <strong>Information Sharing:</strong> We may share information with parking facility operators, payment processors, and law enforcement when required. We do not sell your personal information to third parties.
          </Typography>
          <Typography variant="body2" component="p">
            4. <strong>California Privacy Rights:</strong> As a California resident, you have rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, request deletion, and opt-out of sales of your information.
          </Typography>
          <Typography variant="body2" component="p">
            5. <strong>Data Security:</strong> We implement reasonable security measures to protect your information from unauthorized access.
          </Typography>
          <Typography variant="body2" component="p">
            6. <strong>Data Retention:</strong> We retain your information for as long as necessary to provide our services and comply with legal obligations. Parking records are typically kept for up to 3 years.
          </Typography>
          <Typography variant="body2" component="p">
            7. <strong>Changes to Privacy Policy:</strong> We may update this Privacy Policy periodically. We will notify you of any material changes via email or through our application.
          </Typography>
          <Typography variant="body2" component="p">
            8. <strong>Contact Us:</strong> If you have questions about this Privacy Policy or to exercise your privacy rights, please contact us at coparkspace@gmail.com.
          </Typography>
        </Paper>
      </Stack>
    </Container>
  );
}