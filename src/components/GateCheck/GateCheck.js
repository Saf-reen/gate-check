import React, { useState, useEffect } from 'react';
import { Search, Filter, FileText, Plus, MoreVertical, Phone, Clock, User, Users } from 'lucide-react';

const GateCheck = () => {
  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock visitor data
  const mockVisitors = [
    {
      id: 1,
      name: 'Siri Chandra',
      phone: 'XXXXXX6443',
      status: 'in',
      checkInTime: '03-06-2025 10:22 AM',
      purpose: 'Meeting',
      hostName: 'John Doe',
      department: 'Engineering',
      avatar: null
    },
    {
      id: 2,
      name: 'Raj Kumar',
      phone: 'XXXXXX7834',
      status: 'out',
      checkInTime: '03-06-2025 09:15 AM',
      checkOutTime: '03-06-2025 11:30 AM',
      purpose: 'Interview',
      hostName: 'Sarah Wilson',
      department: 'HR',
      avatar: null
    },
    {
      id: 3,
      name: 'Priya Sharma',
      phone: 'XXXXXX9876',
      status: 'in',
      checkInTime: '03-06-2025 11:45 AM',
      purpose: 'Delivery',
      hostName: 'Mike Johnson',
      department: 'Admin',
      avatar: null
    },
    {
      id: 4,
      name: 'Arjun Singh',
      phone: 'XXXXXX5432',
      status: 'out',
      checkInTime: '03-06-2025 08:30 AM',
      checkOutTime: '03-06-2025 10:15 AM',
      purpose: 'Consultation',
      hostName: 'Emily Davis',
      department: 'Sales',
      avatar: null
    }
  ];

  // Load mock data
  useEffect(() => {
    const loadVisitors = () => {
      setTimeout(() => {
        setVisitors(mockVisitors);
        setFilteredVisitors(mockVisitors);
        setLoading(false);
      }, 1000);
    };

    loadVisitors();
  }, []);

  // Filter visitors based on search and status
  useEffect(() => {
    let filtered = visitors;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(visitor =>
        visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.phone.includes(searchTerm) ||
        visitor.purpose.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(visitor => visitor.status === filterStatus);
    }

    setFilteredVisitors(filtered);
  }, [searchTerm, filterStatus, visitors]);

  const getStatusColor = (status) => {
    return status === 'in' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const getStatusDot = (status) => {
    return status === 'in' ? 'bg-green-500' : 'bg-red-500';
  };

  const statsData = {
    totalVisitors: visitors.length,
    visitorsIn: visitors.filter(v => v.status === 'in').length,
    visitorsOut: visitors.filter(v => v.status === 'out').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 space-y-6 bg-gray-50">
      {/* Header */}
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="flex items-center text-2xl font-bold text-gray-900">
              <Users className="w-8 h-8 mr-3 text-blue-600" />
              Visitors
            </h1>
            <p className="mt-1 text-gray-600">Manage and track visitor entries</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Visitor
            </button>
            <button className="flex items-center px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50">
              <FileText className="w-4 h-4 mr-2" />
              Excel
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-3">
          <div className="p-4 text-white rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-100">Total Visitors</p>
                <p className="text-2xl font-bold">{statsData.totalVisitors}</p>
              </div>
              <User className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          
          <div className="p-4 text-white rounded-lg bg-gradient-to-r from-green-500 to-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-100">Currently In</p>
                <p className="text-2xl font-bold">{statsData.visitorsIn}</p>
              </div>
              <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="p-4 text-white rounded-lg bg-gradient-to-r from-red-500 to-red-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-100">Checked Out</p>
                <p className="text-2xl font-bold">{statsData.visitorsOut}</p>
              </div>
              <div className="w-3 h-3 bg-red-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search visitors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="in">In</option>
                <option value="out">Out</option>
              </select>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">In</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">Out</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visitors Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredVisitors.map((visitor) => (
          <div key={visitor.id} className="p-4 transition-shadow duration-200 bg-white rounded-lg shadow-sm hover:shadow-md">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusDot(visitor.status)} rounded-full border-2 border-white`}></div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{visitor.name}</h3>
                  <p className="flex items-center text-xs text-gray-500">
                    <Phone className="w-3 h-3 mr-1" />
                    {visitor.phone}
                  </p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(visitor.status)}`}>
                  {visitor.status === 'in' ? 'In' : 'Out'}
                </span>
              </div>

              <div className="flex items-center text-xs text-gray-600">
                <Clock className="w-3 h-3 mr-1" />
                <span>{visitor.checkInTime}</span>
              </div>

              <div className="text-xs">
                <span className="text-gray-500">Purpose: </span>
                <span className="font-medium text-gray-700">{visitor.purpose}</span>
              </div>

              <div className="text-xs">
                <span className="text-gray-500">Host: </span>
                <span className="text-gray-700">{visitor.hostName}</span>
              </div>

              <div className="text-xs">
                <span className="text-gray-500">Department: </span>
                <span className="text-gray-700">{visitor.department}</span>
              </div>

              {visitor.status === 'out' && visitor.checkOutTime && (
                <div className="flex items-center pt-2 mt-2 text-xs text-gray-600 border-t border-gray-100">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>Out: {visitor.checkOutTime}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredVisitors.length === 0 && (
        <div className="p-8 text-center bg-white rounded-lg shadow-sm">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">No visitors found</h3>
          <p className="text-gray-500">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'No visitors have been registered yet.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default GateCheck;