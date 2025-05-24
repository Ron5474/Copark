'use client';

import { Box, Drawer, List, ListItem, ListItemButton, ListItemText, Typography, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { logout } from '../login/actions';

interface HomeProps {
  onNavigate: (component: string) => void;
  children: React.ReactNode;
}

export default function Home({ onNavigate, children }: HomeProps) {
  const buttons = [
    { label: 'Manage Enforcement', component: 'enforcement' },
    { label: 'Manage Ticket Challenges', component: 'tickets' },
    { label: 'View Statistics', component: 'statistics' },
    { label: 'Generate Reports', component: 'reports' },
    { label: 'Manage API Users', component: 'api_users' },
    { label: 'Manage Zones', component: 'zones' },
  ];

  const drawerWidth = 240;

  const handleLogout = async () => {
    window.sessionStorage.removeItem('name');
    await logout();
  };

  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const name = window.sessionStorage.getItem('name');
    setUserName(name);
  }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: (theme) => theme.palette.primary.main,
            color: 'white',
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
          <Typography variant="h6" component="div" sx={{ color: 'white', mb: 1 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
            Logged in as: {userName}
          </Typography>
          <Button
            variant="outlined"
            fullWidth
            sx={{
              color: 'white',
              borderColor: 'white',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.8)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              }
            }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
        <List>
          {buttons.map((button) => (
            <ListItem key={button.label} disablePadding>
              <ListItemButton
                aria-label={button.label}
                onClick={() => onNavigate(button.component)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  },
                }}
              >
                <ListItemText primary={button.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          minHeight: '100vh',
          backgroundColor: (theme) => theme.palette.background.default,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}