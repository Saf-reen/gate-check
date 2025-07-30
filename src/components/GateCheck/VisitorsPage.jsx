import React, { useState, useEffect } from 'react';
import { Users, Activity, TrendingUp, Clock, Loader, AlertCircle, FolderOpen, RefreshCw } from 'lucide-react';
import { api } from '../Auth/api';
import DashboardHeader from './DashboardHeader';
import CountCard from './CountCard';

// Category Stats Card Component
const CategoryStatsCard = ({ category, count, isLoading }) => {
  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('staff') || name.includes('employee')) {
      return <Users className="w-6 h-6" />;
    } else if (name.includes('vendor') || name.includes('supplier')) {
      return <TrendingUp className="w-6 h-6" />;
    } else if (name.includes('guest') || name.includes('visitor')) {
      return <Activity className="w-6 h-6" />;
    } else if (name.includes('contractor') || name.includes('service')) {
      return <Clock className="w-6 h-6" />;
    } else {
      return <FolderOpen className="w-6 h-6" />;
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

  if (isLoading) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="w-24 h-4 mb-2 bg-gray-200 rounded"></div>
            <div className="w-16 h-8 mb-2 bg-gray-200 rounded"></div>
            <div className="w-32 h-3 bg-gray-200 rounded"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    );
  };

  const color = getCategoryColor(category.id || 0);
  const icon = getCategoryIcon(category.name);

  return (
    <div className="p-6 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 truncate">{category.name}</p>
          <p className={`text-2xl font-bold ${color}`}>{count}</p>
          <p className="mt-1 text-sm text-gray-500">
            {count === 0 ? 'No visitors yet' : count === 1 ? '1 visitor' : `${count} visitors`}
          </p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('text', 'bg')}-100`}>
          {React.cloneElement(icon, { className: `w-6 h-6 ${color}` })}
        </div>
      </div>
    </div>
  );
};

// Error Message Component
const ErrorMessage = ({ message, onRetry }) => (
  <div className="p-4 mb-6 border border-red-200 rounded-lg bg-red-50">
    <div className="flex items-center">
      <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
      <div className="flex-1">
        <p className="text-red-700">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-100"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Retry
        </button>
      )}
    </div>
  </div>
);

// Main Visitors Page Component
const VisitorsPage = ({ totalVisitors, visitors }) => {
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate visitor type counts (existing functionality)
  const walkinCount = visitors.filter(v => v.type === 'walkin').length;
  const scheduleCount = visitors.filter(v => v.type === 'schedule').length;
  const qrVisitorCount = visitors.filter(v => v.type === 'qr').length;

  // Fetch category statistics
  const fetchCategoryStats = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching category statistics...');
      
      const response = await api.visitors.category();
      console.log('Category stats response:', response.data);
      
      // Handle different response formats
      let categoryData = [];
      if (Array.isArray(response.data)) {
        categoryData = response.data;
      } else if (response.data.categories) {
        categoryData = response.data.categories;
      } else if (response.data.data) {
        categoryData = response.data.data;
      } else {
        // If response is an object with category names as keys
        categoryData = Object.entries(response.data).map(([name, count]) => ({
          id: name,
          name: name,
          count: count
        }));
      }
      
      setCategoryStats(categoryData);
    } catch (err) {
      console.error('Error fetching category statistics:', err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Failed to load category statistics. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryStats();
  }, []);

  const handleRetry = () => {
    fetchCategoryStats();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Visitor Management Dashboard"
        description="Monitor and manage all visitor activities in real-time"
        icon={<Activity />}
      />
      
      <div className="px-6 py-6">
        {/* Visitor Type Cards (existing functionality) */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <CountCard
            title="Walk-in Visitors"
            count={walkinCount}
            description={walkinCount > 0 ? 'Visitors on premises' : 'No walk-ins yet'}
            icon={<Users />}
            color="text-blue-600"
          />
          <CountCard
            title="Scheduled Visitors"
            count={scheduleCount}
            description={scheduleCount > 0 ? 'Scheduled visits' : 'No scheduled visits'}
            icon={<TrendingUp />}
            color="text-green-600"
          />
          <CountCard
            title="QR Visitors"
            count={qrVisitorCount}
            description={qrVisitorCount > 0 ? 'QR code visitors' : 'No QR visitors yet'}
            icon={<Clock />}
            color="text-red-600"
          />
        </div>

        {/* Category Statistics Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Category Statistics</h2>
              <p className="text-gray-600">Visitor counts by category</p>
            </div>
            <button
              onClick={handleRetry}
              disabled={loading}
              className="flex items-center px-4 py-2 text-purple-600 rounded-lg bg-purple-50 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <ErrorMessage message={error} onRetry={handleRetry} />
          )}

          {/* Loading State */}
          {loading && !error && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(6)].map((_, index) => (
                <CategoryStatsCard 
                  key={index} 
                  category={{ name: '', id: index }} 
                  count={0} 
                  isLoading={true} 
                />
              ))}
            </div>
          )}

          {/* Category Stats Cards */}
          {!loading && !error && (
            <>
              {categoryStats.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {categoryStats.map((category, index) => (
                    <CategoryStatsCard
                      key={category.id || index}
                      category={category}
                      count={category.count || category.visitor_count || 0}
                      isLoading={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white border border-gray-200 rounded-lg">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="mb-2 text-lg font-medium text-gray-900">No Categories Found</h3>
                  <p className="text-gray-500">
                    No visitor categories are available at the moment.
                  </p>
                  <button
                    onClick={handleRetry}
                    className="flex items-center px-4 py-2 mx-auto mt-4 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Data
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitorsPage;