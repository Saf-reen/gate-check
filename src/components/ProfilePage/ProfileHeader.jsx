import React from 'react';
import { User, RefreshCw, Loader2 } from 'lucide-react';

const ProfileHeader = ({ isLoadingUserData, refreshUserData }) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center">
          <User className="w-8 h-8 m-0 text-purple-800" />
          <h1 className="text-2xl font-semibold text-gray-800">Profile</h1>
        </div>
        <button
          onClick={refreshUserData}
          disabled={isLoadingUserData}
          className="flex items-center px-3 py-2 text-purple-600 rounded-lg bg-purple-50 hover:bg-purple-100 disabled:opacity-50"
          title="Refresh user data"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingUserData ? 'animate-spin' : ''}`} />
          {isLoadingUserData ? 'Loading...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
};

export default ProfileHeader;
