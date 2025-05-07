'use client';

import { useState } from 'react';
import Home from './components/Home';
import ManageEnforcement from './components/ManageEnforcement';
import ManageDrivers from './components/ManageDrivers';

export default function Page() {
  const [currentComponent, setCurrentComponent] = useState<string>('home');

  const handleNavigate = (component: string) => {
    setCurrentComponent(component);
  };

  const renderComponent = () => {
    switch (currentComponent) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'enforcement':
        return <ManageEnforcement onNavigate={handleNavigate} />;
      case 'drivers':
        return <ManageDrivers onNavigate={handleNavigate} />;
      case 'tickets':
        return <div>Tickets Component</div>;
      case 'statistics':
        return <div>Statistics Component</div>;
      case 'reports':
        return <div>Reports Component</div>;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return renderComponent();
}

