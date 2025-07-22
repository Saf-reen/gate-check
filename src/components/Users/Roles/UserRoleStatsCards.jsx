import React from "react";
import {User, Users} from "lucide-react";

const UserRoleStatsCards = ({ userRoles, users, roles }) => {
  return (
    <div className="grid grid-cols-1 gap-2 mb-2 sm:grid-cols-5">
      <div className="flex items-center p-4 bg-white border rounded-lg shadow-sm">
        <div className="p-3 bg-purple-100 rounded-full">
          <Users className="text-purple-600" size={15} />
        </div>
        <div className="ml-2">
          <h3 className="text-sm font-medium text-gray-900">Total Users</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-700">{users.length}</p>
        </div>
      </div>
      <div className="flex items-center p-4 bg-white border rounded-lg shadow-sm">
        <div className="p-3 bg-purple-100 rounded-full">
          <Users className="text-purple-600" size={15} />
        </div>
        <div className="ml-2">
          <h3 className="text-sm font-medium text-gray-900">Total Roles</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-700">{roles.length}</p>
        </div>
      </div>
      <div className="flex items-center p-4 bg-white border rounded-lg shadow-sm">
        <div className="p-3 bg-purple-100 rounded-full">
          <Users className="text-purple-600" size={15} />
        </div>
        <div className="ml-2">
          <h3 className="text-sm font-medium text-gray-900">Total User Roles</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-700">{userRoles.length}</p>
        </div>
      </div>
    </div>
  );
};

export default UserRoleStatsCards;
