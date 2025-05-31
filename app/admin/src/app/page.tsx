'use client';

import { Box } from '@mui/material';
import { useState } from 'react';
import Home from './components/Home';
import ManageEnforcement from './components/ManageEnforcement';
import ManageAPIUsers from './components/ManageAPIUsers';
import ViewStatistics from './components/ViewStatistics';
import ManageTicketChallenges from './components/ManageTicketChallenges';
import ManageZones from './components/ManageZones';

export default function Page() {
  const [currentComponent, setCurrentComponent] = useState<string>('statistics');

  const handleNavigate = (component: string) => {
    setCurrentComponent(component);
  };

  const renderComponent = () => {
    switch (currentComponent) {
      case 'enforcement':
        return <ManageEnforcement onNavigate={handleNavigate} />;
      case 'tickets':
        return <ManageTicketChallenges />;
      case 'api_users':
        return <ManageAPIUsers onNavigate={handleNavigate} />;
      case 'statistics':
        return <ViewStatistics />; // No onNavigate prop needed here
      case 'reports':
        return <Box>Generate Reports Component</Box>;
      case 'zones':
        return <ManageZones />;
    }
  };

  return (
    <Home onNavigate={handleNavigate}>
      {renderComponent()}
    </Home>
  );
}

