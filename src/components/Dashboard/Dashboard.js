import React, { useState } from 'react';
import Sidebar from '../Common/Sidebar';
import Navbar from '../Common/Navbar';
import { Shield, FileText, User, Users, MapPin, UserCheck } from 'lucide-react';

const Dashboard = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Dashboard content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-4">
            {/* Header with background gradient */}
            <div className="relative overflow-hidden text-white rounded-md bg-gradient-to-r from-blue-900 to-blue-400">
              {/* Background pattern */}
              {/* <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
              /> */}
              <div className="relative p-6 z-8">
                <h1 className="mb-1 text-2xl font-bold">Welcome back, {user?.name}!</h1>
                <p className="text-blue-100">Here's what's happening with your security system today.</p>
              </div>
              <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 bg-white rounded-full w-28 h-28 opacity-10"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 transform -translate-x-4 translate-y-4 bg-white rounded-full opacity-10"></div>
            </div>

            {/* Main Content Cards - Matching the screenshot layout */}
            <div className="grid grid-cols-1 gap-3 mt-4 md:grid-cols-8">
              {/* GateCheck Card */}
              <div className="p-3 transition-all duration-300 bg-white border border-gray-100 rounded-md shadow-lg cursor-pointer hover:shadow-xl hover:-translate-y-1">
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 mx-auto mb-4 rounded-full shadow-lg bg-gradient-to-r from-blue-900 to-blue-400">
                    <UserCheck className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="mb-2 text-sm font-medium text-gray-800">GateCheck</h3>
                  {/* <p className="text-xs text-gray-600">Secure access control and visitor management</p> */}
                </div>
              </div>

              {/* Reports Card */}
              <div className="p-3 transition-all duration-300 bg-white border border-gray-100 rounded-md shadow-lg cursor-pointer hover:shadow-xl hover:-translate-y-1">
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 mx-auto mb-4 rounded-full shadow-lg bg-gradient-to-r from-blue-900 to-blue-400">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="mb-2 text-sm font-medium text-gray-800">Reports</h3>
                  {/* <p className="text-sm text-gray-600">Generate and view security reports</p> */}
                </div>
              </div>

              {/* Profile Card */}
              <div className="p-3 transition-all duration-300 bg-white border border-gray-100 rounded-md shadow-lg cursor-pointer hover:shadow-xl hover:-translate-y-1">
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 mx-auto mb-4 rounded-full shadow-lg bg-gradient-to-r from-blue-900 to-blue-400">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="mb-2 text-sm font-medium text-gray-800">Profile</h3>
                  {/* <p className="text-sm text-gray-600">Manage your account and settings</p> */}
                </div>
              </div>
            </div>
            <hr className="my-0" />
            {/* Stats Row - Visitor and Vendor counts */}
            <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-7">
              {/* Visitor Count */}
              <div className="p-6 bg-transparent border-0 rounded-md">
                <div className="flex flex-col items-center justify-between">
                  <div>
                    <div className="flex items-center justify-center w-10 h-10 mb-2 rounded-full bg-gradient-to-r from-blue-900 to-blue-400">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">0</p>
                    <h3 className="mb-1 font-medium text-gray-800 text-md">Visitor</h3>
                  </div>
                </div>
              </div>

              {/* Vendor Count */}
              <div className="p-6 bg-transparent border-0 rounded-md">
                <div className="flex flex-col items-center justify-between">
                  <div>
                    <div className="flex items-center justify-center w-10 h-10 mb-2 rounded-full bg-gradient-to-r from-blue-900 to-blue-400">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">0</p>
                    <h3 className="mb-2 font-medium text-gray-800 text-md">Vendor</h3>
                  </div>
                </div>
              </div>
            </div>
            <hr className="my-0" />
            {/* Ground Team Section */}
            <div className="p-4 bg-white border border-gray-100 rounded-md shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-bold text-blue-900 text-md">Ground Team</h3>
                  <p className="text-xs text-gray-600">Track your Ground Team Employees in your IT Park</p>
                </div>
                <div className="hidden md:block">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-4full bg-blue-00">
                      <MapPin className="w-6 h-6 text-blue-900" />
                    </div>
                  </div>
                </div>
              </div>
              <button className="px-4 py-1 text-sm font-medium text-white transition-colors duration-200 bg-blue-900 rounded-md hover:bg-sage-600">
                View More
              </button>
            </div>
          </div>
        );

      case 'gatecheck':
        return (
          <div className="space-y-6">
            <div className="p-8 bg-white shadow-lg rounded-xl">
              <div className="text-center">
                <Shield className="w-16 h-16 mx-auto mb-4 text-blue-900" />
                <h2 className="mb-4 text-2xl font-bold text-gray-800">GateCheck System</h2>
                <p className="text-gray-600">Secure visitor and access management system</p>
                <div className="p-4 mt-8 rounded-lg bg-green-50">
                  <p className="font-medium text-green-800">System Status: Online</p>
                  <p className="text-sm text-green-600">All security protocols active</p>
                </div>
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
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Account Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {user?.name || 'User'}</p>
                    <p><span className="font-medium">Role:</span> {user?.role || 'Member'}</p>
                    <p><span className="font-medium">Status:</span> <span className="text-green-600">Active</span></p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Security Settings</h3>
                  <div className="space-y-2">
                    <button className="block w-full p-3 text-left transition-colors rounded-lg bg-gray-50 hover:bg-gray-100">
                      Change Password
                    </button>
                    <button className="block w-full p-3 text-left transition-colors rounded-lg bg-gray-50 hover:bg-gray-100">
                      Two-Factor Authentication
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar} 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />

      {/* Main Content */}
      <div className="w-full min-h-screen lg:ml-0">
        {/* Navbar */}
        <Navbar 
          user={user} 
          onSidebarToggle={toggleSidebar} 
          onLogout={onLogout} 
        />

        {/* Page Content */}
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;