import React from "react";
import { Shield, Key, Users, Link } from "lucide-react";

const RolePermissionStatsCards = ({ rolePermissions, roles, permissions }) => {
  // Calculate stats
  const totalAssignments = rolePermissions.length;
  const totalRoles = roles.length;
  const totalPermissions = permissions.length;
  const rolesWithPermissions = new Set(rolePermissions.map(rp => rp.role)).size;
  const averagePermissionsPerRole = totalAssignments > 0 
    ? Math.round((rolePermissions.reduce((sum, rp) => sum + rp.permission.length, 0) / totalAssignments) * 10) / 10
    : 0;

  const stats = [
    {
      title: "Total Assignments",
      value: totalAssignments,
      icon: Link,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700"
    },
    {
      title: "Roles with Permissions",
      value: `${rolesWithPermissions}/${totalRoles}`,
      icon: Shield,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700"
    },
    {
      title: "Available Permissions",
      value: totalPermissions,
      icon: Key,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700"
    },
    {
      title: "Avg Permissions/Role",
      value: averagePermissionsPerRole,
      icon: Users,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div key={index} className={`p-4 rounded-lg shadow-sm border ${stat.bgColor}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${stat.textColor}`}>{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`p-2 rounded-full ${stat.color}`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RolePermissionStatsCards;