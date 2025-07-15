import React from 'react';
import { Lock, User, LogOut, Edit2 } from 'lucide-react';

const ProfileSecurity = ({
  loading,
  isAuthenticated,
  setIsEditingPassword,
  setIsEditingAlias,
  handleLogoutClick,
  profileData,
  getFieldValue
}) => {
  return (
    <div className="lg:col-span-1">
      <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="relative h-32 bg-gradient-to-t from-purple-800 to-purple-100">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute transform -translate-x-1/2 -bottom-12 left-1/2">
            <div className="w-24 h-24 p-1 bg-white rounded-full shadow-lg">
              <div className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-b from-purple-800 to-purple-100">
                <span className="text-2xl font-bold text-white">
                  {profileData.userName?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 pt-16 pb-6 text-center">
          <h2 className="mb-1 text-xl font-semibold text-gray-800">
            {getFieldValue(profileData.userName, 'user name')}
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            {getFieldValue(profileData.companyName, 'company name')}
          </p>
        </div>
        <div className="px-6 pb-6">
          <h3 className="mb-4 text-lg font-medium text-gray-800">Security</h3>
          <div className="mb-4">
            <button
              onClick={() => setIsEditingPassword(true)}
              disabled={loading || !isAuthenticated}
              className="flex items-center w-full p-3 text-left transition-colors bg-purple-100 rounded-lg hover:bg-purple-200 disabled:opacity-50"
            >
              <Lock className="w-5 h-5 mr-3 text-purple-500" />
              <div>
                <p className="font-medium text-purple-700">Change Password</p>
                <p className="text-sm text-purple-800">Password</p>
              </div>
            </button>
          </div>
          <div className="mb-4">
            <button
              onClick={() => setIsEditingAlias(true)}
              disabled={loading || !isAuthenticated}
              className="flex items-center w-full p-3 text-left transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              <User className="w-5 h-5 mr-3 text-gray-500" />
              <div>
                <p className="font-medium text-gray-700">Change Alias Name</p>
                <p className="text-sm text-gray-600">
                  {getFieldValue(profileData.aliasName, 'alias name')}
                </p>
              </div>
            </button>
          </div>
          <button
            onClick={handleLogoutClick}
            disabled={loading}
            className="flex items-center w-full p-3 text-left transition-colors border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
          >
            <LogOut className="w-5 h-5 mr-3 text-red-500" />
            <div>
              <p className="font-medium text-red-700">Logout</p>
              <p className="text-sm text-red-600">Sign out of your account</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSecurity;
