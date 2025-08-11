import React from 'react';
import { Outlet } from 'react-router-dom';
import { ProfessionalHeader } from './ProfessionalHeader';
import { ProfessionalSidebar } from './ProfessionalSidebar';
import { cn } from '@/lib/utils';

export const ProfessionalLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <ProfessionalHeader />
      <div className="flex">
        <ProfessionalSidebar className="hidden lg:block" />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
