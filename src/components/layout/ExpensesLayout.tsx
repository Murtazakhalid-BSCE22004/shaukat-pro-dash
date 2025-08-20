import React from 'react';
import { Outlet } from 'react-router-dom';
import ExpensesSidebar from '../ExpensesSidebar';
import ExpensesHeader from './ExpensesHeader';
import { SidebarProvider, useSidebar } from './SidebarContext';

const ExpensesLayoutContent: React.FC = () => {
  const { isCollapsed } = useSidebar();

  return (
    <>
      <ExpensesHeader />
      <ExpensesSidebar />
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

const ExpensesLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <ExpensesLayoutContent />
    </SidebarProvider>
  );
};

export default ExpensesLayout;