import React, { useState } from 'react';
import Sidebar from '../Common/Sidebar';
import Navbar from '../Common/Navbar';
import { Shield, FileText, User, Users, MapPin, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user, onLogout, totalVisitors = 0 }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  console.log('Dashboard totalVisitors:', totalVisitors);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'organization') {
      navigate('/organization');
    }
  };

  // Add navigation handler for cards
  const handleCardNavigation = (route) => {
    navigate(route);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-4">
            <div className="relative overflow-hidden text-purple-800 bg-white border-2 border-purple-800 border-solid rounded-md shadow-lg bg-gradient-to-tr from-white to-white">
              <div className="relative p-6 z-8">
                <h1 className="mb-1 text-2xl font-bold">Welcome back, {user?.name}!</h1>
                <p className="text-purple-900">Here's what's happening with your security system today.</p>
              </div>
              <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 bg-white rounded-full w-28 h-28 opacity-10"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 transform -translate-x-4 translate-y-4 bg-white rounded-full opacity-10"></div>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-4 md:grid-cols-8">
              <div
                onClick={() => handleCardNavigation('/gatecheck')}
                className="p-3 transition-all duration-300 bg-white border border-gray-100 rounded-md shadow-lg cursor-pointer hover:shadow-xl hover:-translate-y-1"
              >
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 mx-auto mb-4 bg-white border border-purple-800 rounded-full shadow-lg">
                    <UserCheck className="w-4 h-4 text-purple-800" />
                  </div>
                  <h3 className="mb-2 text-sm font-medium text-gray-800">GateCheck</h3>
                </div>
              </div>

              <div
                onClick={() => handleCardNavigation('/reports')}
                className="p-3 transition-all duration-300 bg-white border border-gray-100 rounded-md shadow-lg cursor-pointer hover:shadow-xl hover:-translate-y-1"
              >
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 mx-auto mb-4 bg-white border border-purple-800 rounded-full shadow-lg">
                    <FileText className="w-4 h-4 text-purple-800" />
                  </div>
                  <h3 className="mb-2 text-sm font-medium text-gray-800">Reports</h3>
                </div>
              </div>

              <div
                onClick={() => handleCardNavigation('/profile')}
                className="p-3 transition-all duration-300 bg-white border border-gray-100 rounded-md shadow-lg cursor-pointer hover:shadow-xl hover:-translate-y-1"
              >
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 mx-auto mb-4 bg-white border border-purple-800 rounded-full shadow-lg">
                    <User className="w-4 h-4 text-purple-800" />
                  </div>
                  <h3 className="mb-2 text-sm font-medium text-gray-800">Profile</h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-7">
              <div className="p-6 bg-transparent border-0 rounded-md">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-10 h-10 mb-2 bg-white border border-purple-800 rounded-full">
                    <Users className="w-4 h-4 text-purple-800" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{totalVisitors}</p>
                  <h3 className="font-medium text-gray-800 text-md">Visitors</h3>
                </div>
              </div>

              <div className="p-6 bg-transparent border-0 rounded-md">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-10 h-10 mb-2 bg-white border border-purple-800 rounded-full">
                    <Users className="w-4 h-4 text-purple-800" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <h3 className="font-medium text-gray-800 text-md">Vendors</h3>
                </div>
              </div>

              {/* <div className="p-6 bg-transparent border-0 rounded-md">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-10 h-10 mb-2 rounded-full bg-gradient-to-r from-blue-900 to-blue-400">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{organizations.length}</p>
                  <h3 className="font-medium text-gray-800 text-md">Organizations</h3>
                </div>
              </div> */}
            </div>

            {/* <div className="p-4 bg-white border border-gray-100 rounded-md shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-bold text-purple-800 text-md">Ground Team</h3>
                  <p className="text-xs text-gray-600">Track your Ground Team Employees in your IT Park</p>
                </div>
                <div className="hidden md:block">
                  <MapPin className="w-6 h-6 text-purple-800" />
                </div>
              </div>
              <button className="px-4 py-1 text-sm font-medium text-white bg-purple-400 rounded-md hover:bg-purple-800">
                View More
              </button>
            </div> */}
            <hr />
          </div>
        );

      case 'gatecheck':
        return (
          <div className="space-y-6">
            <div className="p-8 text-center bg-white shadow-lg rounded-xl">
              <Shield className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <h2 className="mb-4 text-2xl font-bold text-gray-800">GateCheck System</h2>
              <p className="text-gray-600">Secure visitor and access management system</p>
              <div className="p-4 mt-8 rounded-lg bg-purple-50">
                <p className="font-medium text-purple-800">System Status: Online</p>
                <p className="text-sm text-purple-800">All security protocols active</p>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="p-8 bg-white shadow-lg rounded-xl">
              <div className="flex items-center mb-8 space-x-6">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-800 to-purple-100">
                  <span className="text-2xl font-bold text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{user?.name || 'User'}</h2>
                  <p className="text-gray-600">{user?.role || 'Member'}</p>
                  <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Account Information</h3>
                  <p><span className="font-medium">Name:</span> {user?.name || 'User'}</p>
                  <p><span className="font-medium">Role:</span> {user?.role || 'Member'}</p>
                  <p><span className="font-medium">Status:</span> <span className="text-purple-800">Active</span></p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Security Settings</h3>
                  <button className="block w-full p-3 mt-2 text-left rounded-lg bg-gray-50 hover:bg-gray-100">
                    Change Password
                  </button>
                  <button className="block w-full p-3 mt-2 text-left rounded-lg bg-gray-50 hover:bg-gray-100">
                    Two-Factor Authentication
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'organization':
        return (
          <div className="space-y-6">
            <div className="p-8 text-center bg-white shadow-lg rounded-xl">
              <h2 className="mb-4 text-2xl font-bold text-gray-800">Welcome to Organization Management</h2>
              <p className="text-gray-600">Manage your company structure and add new organizations easily.</p>
              <button
                onClick={() => navigate('/organizationform/add')}
                className="px-6 py-2 mt-6 font-medium text-white bg-purple-800 rounded-md hover:bg-purple-900"
              >
                Add Organization
              </button>
            </div>
          </div>
        );

      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      /> */}

      <div className="w-full min-h-screen lg:m-0">
        {/* <Navbar user={user} onSidebarToggle={toggleSidebar} onLogout={onLogout} /> */}
        <main className="p-0">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;