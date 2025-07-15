import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, ChevronDown, User, LogOut } from 'lucide-react';
import authService from '../Auth/AuthService';
import { api } from '../Auth/api';

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

      try {
        await api.auth.logout();
      } catch (logoutError) {
        console.warn('Logout API call failed:', logoutError);
      }

      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');

      if (authService) {
        if (authService.logout) authService.logout();
        if (authService.clearUser) authService.clearUser();
        if (authService.clearToken) authService.clearToken();
      }

      console.log({
        timestamp: new Date().toISOString(),
        event: 'LOGOUT',
        data: {
          reason: 'USER_INITIATED'
        },
        userAgent: navigator.userAgent,
        ip: 'client-side'
      });

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
        isSidebarOpen ? 'w-[calc(100%-200px)] ml-[10px]' : 'w-full ml-0'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={onSidebarToggle}
            className="p-1 transition-colors rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="flex items-center space-x-2">
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
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>
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
