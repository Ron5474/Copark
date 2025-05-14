'use client';

import { Box } from '@mui/material';
import { useState } from 'react';
import Home from './components/Home';
import ManageEnforcement from './components/ManageEnforcement';
import ManageDrivers from './components/ManageDrivers';
import ManageAPIUsers from './components/ManageAPIUsers';

export default function Page() {
  const [currentComponent, setCurrentComponent] = useState<string>('home');

  const handleNavigate = (component: string) => {
    setCurrentComponent(component);
  };

  const renderComponent = () => {
    switch (currentComponent) {
      case 'enforcement':
        return <ManageEnforcement onNavigate={handleNavigate} />;
      case 'drivers':
        return <ManageDrivers onNavigate={handleNavigate} />;
      case 'api_users':
        return <ManageAPIUsers onNavigate={handleNavigate} />;
      case 'statistics':
        return <Box>Statistics Component</Box>;
      case 'reports':
        return <Box>Reports Component</Box>;
      default:
        return <Box>Welcome to Admin Dashboard</Box>;
    }
  };

  return (
    <Home onNavigate={handleNavigate}>
      {renderComponent()}
    </Home>
  );
}

