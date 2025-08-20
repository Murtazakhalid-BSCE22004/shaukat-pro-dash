import React from 'react';
import { Outlet } from 'react-router-dom';
import SalariesSidebar from '../SalariesSidebar';
import SalariesHeader from './SalariesHeader';
import { SidebarProvider, useSidebar } from './SidebarContext';

const SalariesLayoutContent: React.FC = () => {
  const { isCollapsed } = useSidebar();
  
  return (
    <>
      <SalariesHeader />
      <SalariesSidebar />
      <div 
        className="main-content-with-sidebar-and-header"
        style={{ marginLeft: isCollapsed ? '64px' : '256px' }}
      >
        <div className="theme-professional-exact p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

const SalariesLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <SalariesLayoutContent />
    </SidebarProvider>
  );
};

export default SalariesLayout;
