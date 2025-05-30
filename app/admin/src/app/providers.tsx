'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: `var(--font-geist-sans)`,
    // You can use GeistMono for code blocks if needed:
    // fontFamilyMono: `var(--font-geist-mono)`,
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={`${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
      </div>
    </ThemeProvider>
  );
}
