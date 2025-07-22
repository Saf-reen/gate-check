import React from 'react';
import { Users, Eye, EyeOff } from 'lucide-react';

const StatsCards = ({ roles }) => {
  return (
    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-5">
      <div className="h-20 p-4 bg-white border rounded-lg shadow-sm">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 rounded-full">
            <Users className="text-purple-600" size={15} />
          </div>
          <div className="ml-2">
            <p className="text-sm text-gray-600">Total Roles</p>
            <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
          </div>
        </div>
      </div>
      <div className="h-20 p-4 bg-white border rounded-lg shadow-sm">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 rounded-full">
            <Eye className="text-green-600" size={15} />
          </div>
          <div className="ml-2">
            <p className="text-sm text-gray-600">Active Roles</p>
            <p className="text-2xl font-bold text-gray-900">{roles.filter(r => r.is_active).length}</p>
          </div>
        </div>
      </div>
      <div className="h-20 p-4 bg-white border rounded-lg shadow-sm">
        <div className="flex items-center">
          <div className="p-3 bg-red-100 rounded-full">
            <EyeOff className="text-red-600" size={15} />
          </div>
          <div className="ml-2">
            <p className="text-sm text-gray-600">Inactive Roles</p>
            <p className="text-2xl font-bold text-gray-900">{roles.filter(r => !r.is_active).length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
