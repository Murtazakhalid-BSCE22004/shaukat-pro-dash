import React from 'react';
import { Bell, Search, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface ProfessionalHeaderProps {
  onMenuClick?: () => void;
}

export const ProfessionalHeader: React.FC<ProfessionalHeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <nav className="flex flex-col space-y-2">
                <a href="/dashboard" className="text-sm font-medium hover:text-[hsl(var(--brand))]">Dashboard</a>
                <a href="/doctors" className="text-sm font-medium hover:text-[hsl(var(--brand))]">Doctors</a>
                <a href="/patients" className="text-sm font-medium hover:text-[hsl(var(--brand))]">Patients</a>
                <a href="/appointments" className="text-sm font-medium hover:text-[hsl(var(--brand))]">Appointments</a>
                <a href="/billing" className="text-sm font-medium hover:text-[hsl(var(--brand))]">Billing</a>
              </nav>
            </SheetContent>
          </Sheet>
          
          <div className="hidden lg:flex items-center space-x-3">
            <img
              src="/lovable-uploads/2b0f0307-afe5-44d4-8238-339c747daa1f.png"
              alt="Shaukat International Hospital logo"
              className="h-8 w-auto"
            />
            <div className="flex flex-col leading-tight">
              <h1 className="text-xl font-bold text-gray-900">Shaukat International Hospital</h1>
              <span className="text-xs text-[hsl(var(--brand))] font-medium">Healthcare Management System</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search patients, doctors..."
              className="pl-10 w-64"
            />
          </div>
          
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          
          <Avatar>
            <AvatarImage src="/placeholder.svg" alt="Admin" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};
