import React from 'react';
import { Outlet } from 'react-router-dom';
import GeneralSidebar from '../GeneralSidebar';
import GeneralHeader from './GeneralHeader';
import { SidebarProvider, useSidebar } from './SidebarContext';

const GeneralLayoutContent: React.FC = () => {
  const { isCollapsed } = useSidebar();
  
  return (
    <>
      <GeneralHeader />
      <GeneralSidebar />
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

const GeneralLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <GeneralLayoutContent />
    </SidebarProvider>
  );
};

export default GeneralLayout;
