

import React, { useState, useEffect } from 'react';
import { Activity, Users, TrendingUp, Clock, FolderOpen } from 'lucide-react';
import { api } from '../Auth/api';
import DashboardHeader from './DashboardHeader';
import CountCard from './CountCard';


const VisitorsPage = ({ totalVisitors, visitors, categoryCounts }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
console.log("Category Counts in VisitorsPage:", categoryCounts);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        // Use the same API as CategoryPage.jsx for category names
        const response = await api.categories.getAll();
        setCategories(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError('Failed to fetch categories');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Helper to pick icon and color for category
  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('staff') || name.includes('employee')) {
      return <Users />;
    } else if (name.includes('vendor') || name.includes('supplier')) {
      return <TrendingUp />;
    } else if (name.includes('guest') || name.includes('visitor')) {
      return <Activity />;
    } else if (name.includes('contractor') || name.includes('service')) {
      return <Clock />;
    } else {
      return <FolderOpen />;
    }
  };
  const getCategoryColor = (index) => {
    const colors = [
      'text-blue-600',
      'text-green-600',
      'text-purple-600',
      'text-red-600',
      'text-yellow-600',
      'text-indigo-600',
      'text-pink-600',
      'text-gray-600'
    ];
    return colors[index % colors.length];
  };

return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Visitor Management Dashboard"
        description="Monitor and manage all visitor activities in real-time"
        icon={<Activity />}
      />
      <div className="px-6 py-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Category Statistics</h2>
          <p className="text-gray-600">Visitor counts by category</p>
          {loading ? (
            <p className="mt-1 text-sm text-purple-700">Loading categories...</p>
          ) : error ? (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          ) : (!categoryCounts || categoryCounts.length === 0) ? (
            <p className="mt-1 text-sm text-gray-600">No categories found.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categoryCounts.map((category, idx) => (
                <CountCard
                  key={category.name || idx}
                  title={category.name}
                  count={category.count || 0}
                  description={''}
                  icon={getCategoryIcon(category.name)}
                  color={getCategoryColor(idx)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitorsPage;