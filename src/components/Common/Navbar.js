import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import authService from '../Auth/AuthService';
import { api } from '../Auth/api'; // Adjust the import path as necessary

const Navbar = ({ user, onSidebarToggle, onLogout, isSidebarOpen }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleProfileClick = () => {
    setShowUserMenu(false);
    navigate('/profile');
  };

  const handleLogoutClick = async () => {
      try {
        setLoading(true);
        
        // Call logout API endpoint
        try {
          await api.auth.logout();
        } catch (logoutError) {
          console.warn('Logout API call failed:', logoutError);
        }
        
        // Clear local storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        
        // Clear auth service
        if (authService) {
          if (authService.logout) authService.logout();
          if (authService.clearUser) authService.clearUser();
          if (authService.clearToken) authService.clearToken();
        }
        
        // Log the logout event
        console.log({
          timestamp: new Date().toISOString(),
          event: 'LOGOUT',
          data: {
            reason: 'USER_INITIATED'
          },
          userAgent: navigator.userAgent,
          ip: 'client-side'
        });
        
        // Call parent logout callback
        if (onLogout) {
          onLogout();
        }
        
        console.log('Logout successful');
      } catch (error) {
        console.error('Logout error:', error);
        if (onLogout) {
          onLogout();
        }
      } finally {
        setLoading(false);
      }
    };

  return (
    <nav 
      className={`fixed top-0 z-30 px-4 py-2 bg-white border-b border-gray-200 transition-all duration-300 ${
        isSidebarOpen 
          ? 'w-[calc(100%-200px)] ml-[10px]' 
          : 'w-full ml-0'
      }`}
    >
      <div className="flex items-center justify-between ">
        {/* Left side */}
        <div className="flex items-center space-x-2">
          {/* Mobile menu button */}
          <button
            onClick={onSidebarToggle}
            className="p-1 transition-colors rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Search bar */}
          {/* <div className="items-center hidden md:flex">
            <div className="relative">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search"
                className="py-1 pl-8 pr-2 text-sm border border-gray-300 rounded-sm focus:ring-2 focus:ring-pruple-400 focus:border-transparent w-58"
              />
            </div>
          </div> */}
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          {/* <button className="relative p-1 transition-colors rounded-sm hover:bg-gray-100">
            <Bell className="w-5 h-5 text-gray-600" /> */}
            {/* Notification badge */}
            {/* <span className="absolute w-2 h-2 bg-purple-800 rounded-full top-1 right-1"></span>
          </button> */}

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center p-1 space-x-2 transition-colors rounded-sm hover:bg-gray-100"
            >
              <div className="flex items-center justify-center w-8 h-8 bg-white border border-purple-800 rounded-full">
                <span className="text-sm font-semibold text-purple-800">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium text-gray-900">{user?.username || 'User'}</p>
                {/* <p className="text-sm text-gray-500">{user?.role || 'Member'}</p> */}
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>

            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 z-50 w-40 py-1 mt-1 bg-white border border-gray-200 rounded-md shadow-md">
                <div className="px-2 py-1 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.username || 'User'}</p>
                  <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
                </div>
                
                <button 
                  onClick={handleProfileClick}
                  className="flex items-center w-full px-2 py-1 space-x-1 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                
                {/* <button className="flex items-center w-full px-4 py-2 space-x-2 text-sm text-gray-700 transition-colors hover:bg-gray-100">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button> */}
                
                <hr className="my-0" />
                
                <button
                  onClick={handleLogoutClick}
                  className="flex items-center w-full px-2 py-1 space-x-1 text-sm text-purple-800 transition-colors hover:bg-purple-50"
                >
                  <LogOut className="w-4 h-3" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;