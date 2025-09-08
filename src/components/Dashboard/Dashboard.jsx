import React, { useState, useEffect } from 'react';
import { Shield, FileText, User, Users, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../Auth/api';

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [totalVendors, setTotalVendors] = useState(0);
  const navigate = useNavigate();

  // Fetch visitor count on component mount
  useEffect(() => {
    const fetchVisitorCount = async () => {
      try {
        const companyId = user?.company_id;
        if (!companyId) return;

        const response = await api.visitors.getAll({ companyId });
        if (response?.data) {
          const visitorsData = response.data.visitors || response.data;
          const visitorsArray = Array.isArray(visitorsData) ? visitorsData : [];
          setTotalVisitors(visitorsArray.length);
        }
      } catch (error) {
        console.error("Error fetching visitor count:", error);
      }
    };

    fetchVisitorCount();
  }, [user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'organization') {
      navigate('/organization');
    }
  };

  const handleCardNavigation = (route) => {
    navigate(route);
  };

  const handleVisitorsNavigation = () => {
    navigate('/visitors');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-4">
            <div className="relative overflow-hidden text-purple-800 bg-white border-2 border-purple-800 border-solid rounded-md shadow-lg bg-gradient-to-tr from-white to-white">
              <div className="relative p-6 z-8">
                <h1 className="mb-1 text-2xl font-bold">Welcome back, {user?.username || user?.name}!</h1>
                <p className="text-purple-900">Here's what's happening with your security system today.</p>
              </div>
              <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 bg-white rounded-full w-28 h-28 opacity-10"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 transform -translate-x-4 translate-y-4 bg-white rounded-full opacity-10"></div>
            </div>

            {/* Quick Actions */}
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <h2 className="mb-4 text-xl font-bold text-gray-800">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
                <button
                  onClick={() => navigate('/gatecheck')}
                  className="p-4 transition-colors border border-purple-200 rounded-lg bg-purple-50 hover:bg-purple-100"
                >
                  <UserCheck className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <span className="font-medium text-purple-800">Add New Visitor</span>
                </button>
                <button
                  onClick={() => navigate('/reports')}
                  className="p-4 transition-colors border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100"
                >
                  <FileText className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <span className="font-medium text-blue-800">Generate Report</span>
                </button>
                <button
                  onClick={() => navigate('/organization')}
                  className="p-4 transition-colors border border-green-200 rounded-lg bg-green-50 hover:bg-green-100"
                >
                  <Shield className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <span className="font-medium text-green-800">Manage Security</span>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-3 lg:grid-cols-8">
              <div className="p-2 transition-all duration-300 bg-transparent cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-purple-200">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-10 h-10 mb-3 bg-transparent border border-purple-800 rounded-full shadow-md">
                    <Users className="w-4 h-4 text-purple-800" />
                  </div>
                  <p className="mb-1 text-2xl font-bold text-gray-900">{totalVisitors}</p>
                  <h3 className="font-semibold text-gray-700 text-md">Visitors</h3>
                </div>
              </div>
            </div>

            <hr className="my-6 border-gray-200" />
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
                    {user?.name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{user?.name || user?.username || 'User'}</h2>
                  <p className="text-gray-600">{user?.role || 'Member'}</p>
                  <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Account Information</h3>
                  <p><span className="font-medium">Name:</span> {user?.name || user?.username || 'User'}</p>
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
      <div className="w-full min-h-screen lg:m-0">
        <main className="p-0">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
