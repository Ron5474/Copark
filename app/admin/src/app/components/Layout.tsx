'use client';

import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { logout } from '../login/actions';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const name = window.sessionStorage.getItem('name');
    setUserName(name);
  }, []);

  const handleLogout = async () => {
    // Clear session storage
    window.sessionStorage.removeItem('name');
    
    // Call server action to delete cookie and redirect
    await logout();
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box>
            <Image
              src="/admin_logo.png"
              alt="CoPark Logo"
              width={150}
              height={0}
              style={{ width: '150px', height: 'auto' }}
              priority
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {userName && (
              <Typography variant="subtitle1" color="text.secondary">
                Logged in as: {userName}
              </Typography>
            )}
            <Button 
              variant="outlined" 
              color="error"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      {children}
    </Box>
  );
} 