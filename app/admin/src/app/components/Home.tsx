'use client';

import { Box, Container, Button, Typography, Paper } from '@mui/material';
import Layout from './Layout';

interface HomeProps {
  onNavigate: (component: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const buttons = [
    { label: 'Manage Enforcement', component: 'enforcement' },
    { label: 'Manage Drivers', component: 'drivers' },
    { label: 'Override Tickets', component: 'tickets' },
    { label: 'View Statistics', component: 'statistics' },
    { label: 'Generate Reports', component: 'reports' },
    { label: 'Manage API Users', component: 'api_users' }, // Changed to use component navigation
  ];

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            width: '100%',
            maxWidth: '800px',
          }}
        >
          <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
            Admin Dashboard
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2, 
            justifyContent: 'center',
            width: '100%'
          }}>
            {buttons.map((button) => (
              <Button
                key={button.label}
                variant="contained"
                size="large"
                onClick={() => onNavigate(button.component)}
                sx={{
                  minWidth: '200px',
                  height: '100px',
                  fontSize: '1.1rem',
                  flex: '1 1 200px',
                }}
              >
                {button.label}
              </Button>
            ))}
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
}