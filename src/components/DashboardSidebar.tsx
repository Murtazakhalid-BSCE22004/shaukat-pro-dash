import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSidebar } from './layout/SidebarContext';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
}

interface DashboardSidebarProps {
  title: string;
  menuItems: MenuItem[];
  basePath: string;
  themeColor?: 'purple' | 'green' | 'orange' | 'navy' | 'blue';
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  title, 
  menuItems, 
  basePath,
  themeColor = 'purple'
}) => {
  const location = useLocation();
  const { isCollapsed, setIsCollapsed } = useSidebar();

  const isActiveItem = (path: string) => {
    if (path === basePath) {
      return location.pathname === basePath || location.pathname === `${basePath}/`;
    }
    return location.pathname.startsWith(path);
  };

  const getThemeClasses = () => {
    switch (themeColor) {
      case 'green':
        return {
          header: 'bg-gradient-to-r from-green-50 to-emerald-50',
          title: 'text-green-900',
          subtitle: 'text-green-600',
          active: 'bg-green-50 text-green-700 border-r-4 border-green-700',
          activeIcon: 'text-green-600'
        };
      case 'orange':
        return {
          header: 'bg-gradient-to-r from-orange-50 to-amber-50',
          title: 'text-orange-900',
          subtitle: 'text-orange-600',
          active: 'bg-orange-50 text-orange-700 border-r-4 border-orange-700',
          activeIcon: 'text-orange-600'
        };
      case 'navy':
        return {
          header: 'bg-gradient-to-r from-slate-50 to-gray-50',
          title: 'text-slate-900',
          subtitle: 'text-slate-600',
          active: 'bg-slate-50 text-slate-700 border-r-4 border-slate-700',
          activeIcon: 'text-slate-600'
        };
      case 'blue':
        return {
          header: 'bg-gradient-to-r from-blue-50 to-sky-50',
          title: 'text-blue-900',
          subtitle: 'text-blue-600',
          active: 'bg-blue-50 text-blue-700 border-r-4 border-blue-700',
          activeIcon: 'text-blue-600'
        };
      default: // purple
        return {
          header: 'bg-gradient-to-r from-purple-50 to-indigo-50',
          title: 'text-purple-900',
          subtitle: 'text-purple-600',
          active: 'bg-purple-50 text-purple-700 border-r-4 border-purple-700',
          activeIcon: 'text-purple-600'
        };
    }
  };

  const themeClasses = getThemeClasses();

  return (
    <div className={`dashboard-sidebar ${isCollapsed ? 'w-16' : 'w-64'} h-screen bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300`}>
      {/* Header */}
      <div className={`px-6 py-2 border-b border-gray-100 ${themeClasses.header} relative`}>
        <div className="text-center">
          <h2 className={`text-lg font-bold ${themeClasses.title} ${isCollapsed ? 'hidden' : ''}`}>{title}</h2>
        </div>
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute top-1/2 -translate-y-1/2 ${isCollapsed ? 'left-1/2 -translate-x-1/2' : 'right-4'} p-1.5 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 ${themeClasses.title}`}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="px-3 pt-2 pb-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = isActiveItem(item.path);
            const IconComponent = item.icon;
            
            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? themeClasses.active
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  <IconComponent 
                    className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} ${isActive ? themeClasses.activeIcon : 'text-gray-400'}`} 
                  />
                  <span className={`flex-1 ${isCollapsed ? 'hidden' : ''}`}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">A</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Administrator</p>
              <p className="text-xs text-gray-500 truncate">System Admin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
