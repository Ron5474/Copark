import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

export default function TOSView() {
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
          Terms of Service
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
            Welcome to Copark
          </Typography>
          <Typography variant="body2" component="p">
            By accessing or using Copark&apos;s parking management services, you agree to be bound by these Terms of Service.
          </Typography>
          <Typography variant="body2" component="p">
            1. <strong>Service Description:</strong> Copark provides parking lot management and enforcement services through our platform.
          </Typography>
          <Typography variant="body2" component="p">
            2. <strong>License:</strong> We grant you a limited, non-exclusive, non-transferable license to use our service for your parking management needs.
          </Typography>
          <Typography variant="body2" component="p">
            3. <strong>User Accounts:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
          </Typography>
          <Typography variant="body2" component="p">
            4. <strong>Privacy:</strong> Your use of our services is also governed by our Privacy Policy, which outlines how we collect and use your data.
          </Typography>
          <Typography variant="body2" component="p">
            5. <strong>Data Usage:</strong> We collect license plate data and parking information solely for enforcement purposes. This data is stored securely and used only as necessary for service operation.
          </Typography>
          <Typography variant="body2" component="p">
            6. <strong>Limitations:</strong> Our services are provided &quot;as is&quot; without warranties of any kind, either express or implied.
          </Typography>
          <Typography variant="body2" component="p">
            7. <strong>Changes:</strong> We reserve the right to modify these terms at any time. Continued use after changes constitutes acceptance of the new terms.
          </Typography>
        </Paper>
      </Stack>
    </Container>
  );
}