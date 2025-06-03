import React from 'react';
import { LayoutDashboard, Shield, User, X } from 'lucide-react';

const Sidebar = ({ isOpen, onToggle, activeTab, onTabChange }) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: activeTab === 'dashboard'
    },
    {
      id: 'gatecheck',
      label: 'GateCheck',
      icon: Shield,
      active: activeTab === 'gatecheck'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      active: activeTab === 'profile'
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 sm:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-50 bg-gray-900 text-white z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        w-56
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 pl-7">
          <div className="flex items-center space-x-2">
            {/* <div className="flex items-center justify-center w-5 h-5 transition-transform transform shadow-lg bg-gradient-to-r from-blue-400 to-green-200 rounded-xl hover:scale-105">
              <span className="text-lg font-bold text-white">✋</span>
            </div> */}
            <div>
              <h1 className="font-bold tracking-wide text-white text-md">SMART CHECK</h1>
            </div>
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={onToggle}
            className="p-1 transition-colors rounded-sm lg:hidden hover:bg-gray-800"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="px-2 mt-6">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onTabChange(item.id);
                      // Close sidebar on mobile after selection
                      if (window.innerWidth < 1024) {
                        onToggle();
                      }
                    }}
                    className={`
                      w-full flex items-center space-x-1 px-2 py-2 rounded-md transition-all duration-200
                      ${item.active 
                        ? 'bg-blue-800 text-white shadow-md transform scale-105' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:transform hover:scale-105'
                      }
                    `}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-gray-700">
          <div className="text-xs text-center text-gray-400">
            <p>© 2024 Smart Check</p>
            <p>Version 1.0.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;