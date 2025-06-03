import React, { useState } from 'react';
import Sidebar from '../Common/Sidebar';
import Navbar from '../Common/Navbar';
import { Shield, FileText, User, Users, MapPin, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-4">
            <div className="relative overflow-hidden text-white rounded-md bg-gradient-to-r from-blue-900 to-blue-400">
              <div className="relative p-6 z-8">
                <h1 className="mb-1 text-2xl font-bold">Welcome back, {user?.name}!</h1>
                <p className="text-blue-100">Here's what's happening with your security system today.</p>
              </div>
              <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 bg-white rounded-full w-28 h-28 opacity-10"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 transform -translate-x-4 translate-y-4 bg-white rounded-full opacity-10"></div>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-4 md:grid-cols-8">
              <div
                onClick={() => handleTabChange('gatecheck')}
                className="p-3 transition-all duration-300 bg-white border border-gray-100 rounded-md shadow-lg cursor-pointer hover:shadow-xl hover:-translate-y-1"
              >
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 mx-auto mb-4 rounded-full shadow-lg bg-gradient-to-r from-blue-900 to-blue-400">
                    <UserCheck className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="mb-2 text-sm font-medium text-gray-800">GateCheck</h3>
                </div>
              </div>

              <div
                onClick={() => handleTabChange('reports')}
                className="p-3 transition-all duration-300 bg-white border border-gray-100 rounded-md shadow-lg cursor-pointer hover:shadow-xl hover:-translate-y-1"
              >
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 mx-auto mb-4 rounded-full shadow-lg bg-gradient-to-r from-blue-900 to-blue-400">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="mb-2 text-sm font-medium text-gray-800">Reports</h3>
                </div>
              </div>

              <div
                onClick={() => handleTabChange('profile')}
                className="p-3 transition-all duration-300 bg-white border border-gray-100 rounded-md shadow-lg cursor-pointer hover:shadow-xl hover:-translate-y-1"
              >
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 mx-auto mb-4 rounded-full shadow-lg bg-gradient-to-r from-blue-900 to-blue-400">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="mb-2 text-sm font-medium text-gray-800">Profile</h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-7">
              <div className="p-6 bg-transparent border-0 rounded-md">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-10 h-10 mb-2 rounded-full bg-gradient-to-r from-blue-900 to-blue-400">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <h3 className="font-medium text-gray-800 text-md">Visitor</h3>
                </div>
              </div>

              <div className="p-6 bg-transparent border-0 rounded-md">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-10 h-10 mb-2 rounded-full bg-gradient-to-r from-blue-900 to-blue-400">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <h3 className="font-medium text-gray-800 text-md">Vendor</h3>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border border-gray-100 rounded-md shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-bold text-blue-900 text-md">Ground Team</h3>
                  <p className="text-xs text-gray-600">Track your Ground Team Employees in your IT Park</p>
                </div>
                <div className="hidden md:block">
                  <MapPin className="w-6 h-6 text-blue-900" />
                </div>
              </div>
              <button className="px-4 py-1 text-sm font-medium text-white bg-blue-900 rounded-md hover:bg-blue-700">
                View More
              </button>
            </div>
          </div>
        );

      case 'gatecheck':
        return (
          <div className="space-y-6">
            <div className="p-8 bg-white shadow-lg rounded-xl text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-blue-900" />
              <h2 className="mb-4 text-2xl font-bold text-gray-800">GateCheck System</h2>
              <p className="text-gray-600">Secure visitor and access management system</p>
              <div className="p-4 mt-8 rounded-lg bg-green-50">
                <p className="font-medium text-green-800">System Status: Online</p>
                <p className="text-sm text-green-600">All security protocols active</p>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="p-8 bg-white shadow-lg rounded-xl">
              <div className="flex items-center mb-8 space-x-6">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-900 to-blue-400">
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
                  <p><span className="font-medium">Status:</span> <span className="text-green-600">Active</span></p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Security Settings</h3>
                  <button className="block w-full p-3 mt-2 text-left bg-gray-50 rounded-lg hover:bg-gray-100">
                    Change Password
                  </button>
                  <button className="block w-full p-3 mt-2 text-left bg-gray-50 rounded-lg hover:bg-gray-100">
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
            <div className="p-8 bg-white shadow-lg rounded-xl text-center">
              <h2 className="mb-4 text-2xl font-bold text-gray-800">Welcome to Organization Management</h2>
              <p className="text-gray-600">Manage your company structure and add new organizations easily.</p>
              <button
                onClick={() => navigate('/organizationform/add')}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md"
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
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <div className="w-full min-h-screen lg:ml-0">
        <Navbar user={user} onSidebarToggle={toggleSidebar} onLogout={onLogout} />
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
