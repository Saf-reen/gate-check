import React from 'react';
import { FolderOpen, CheckCircle, XCircle, BarChart3 } from 'lucide-react';

const StatsCards = ({ categories }) => {
  const totalCategories = categories.length;
  const activeCategories = categories.filter(cat => cat.is_active).length;
  const inactiveCategories = totalCategories - activeCategories;
  const activeCategoriesPercentage = totalCategories > 0 ? Math.round((activeCategories / totalCategories) * 100) : 0;

  const stats = [
    {
      title: 'Total Categories',
      value: totalCategories,
      icon: FolderOpen,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Active Categories',
      value: activeCategories,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Inactive Categories',
      value: inactiveCategories,
      icon: XCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      title: 'Active Rate',
      value: `${activeCategoriesPercentage}%`,
      icon: BarChart3,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;