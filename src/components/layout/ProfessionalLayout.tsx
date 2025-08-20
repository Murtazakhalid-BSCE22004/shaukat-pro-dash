import React from 'react';
import { Outlet } from 'react-router-dom';
import ProfessionalSidebar from '@/components/ProfessionalSidebar';
import ProfessionalHeader from './ProfessionalHeader';
import { SidebarProvider, useSidebar } from './SidebarContext';
import '../../styles/themes/professional-theme.css';

const ProfessionalLayoutContent: React.FC = () => {
  const { isCollapsed } = useSidebar();
  
  return (
    <>
      {/* Full Width Header */}
      <ProfessionalHeader />
      
      {/* Sidebar */}
      <ProfessionalSidebar />
      
      {/* Main Content */}
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

const ProfessionalLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <ProfessionalLayoutContent />
    </SidebarProvider>
  );
};

export default ProfessionalLayout;