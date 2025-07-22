import React, { useRef, useEffect } from 'react';
import { Users, Plus, Filter, FileText, ChevronDown, Upload, Download } from 'lucide-react';

const Header = ({
  showRecurring,
  setShowRecurring,
  setShowAddModal,
  showFilterDropdown,
  setShowFilterDropdown,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
  filterCategory,
  setFilterCategory,
  categories,
  showExcelDropdown,
  setShowExcelDropdown,
  handleFileUpload,
  exportToExcel,
  totalVisitors,
  approvedCount,
  pendingCount,
  rejectedCount,
  oneTimeCount,
  recurringCount,
  permanentCount,
  onClearFilters
}) => {
  const filterDropdownRef = useRef(null);
  const excelDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
      if (excelDropdownRef.current && !excelDropdownRef.current.contains(event.target)) {
        setShowExcelDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setShowFilterDropdown, setShowExcelDropdown]);

  const handleFilterDropdownClick = (e) => {
    e.stopPropagation();
  };

  const handleClearAllFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    } else {
      // Fallback for backward compatibility
      setFilterStatus('all');
      setFilterType('all');
      setFilterCategory('all');
    }
  };

  // Check if any filters are active
  const hasActiveFilters = filterStatus !== 'all' || filterType !== 'all' || filterCategory !== 'all';

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-2 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="flex items-center text-xl font-semibold text-gray-900">
              <Users className="w-6 h-6 m-2 text-purple-800" />
              {showRecurring ? 'Recurring Visitors' : 'Regular Visitors'}
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center p-2 text-xs text-purple-800 transition-colors bg-white border border-purple-800 rounded-lg hover:bg-purple-100"
            >
              <Plus className="w-4 h-4 text-purple-800" />
              Add Visitor
            </button>
            <div className="relative" ref={filterDropdownRef}>
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`flex items-center transition-colors border rounded-lg hover:bg-gray-50 ${
                  hasActiveFilters 
                    ? 'text-purple-800 border-purple-300 bg-purple-50' 
                    : 'text-gray-700 border-gray-300'
                }`}
              >
                <Filter className="w-4 h-4 m-2" />
                Filter
                {hasActiveFilters && (
                  <span className="px-2 py-1 ml-1 text-xs text-purple-800 bg-purple-100 rounded-full">
                    Active
                  </span>
                )}
                <ChevronDown className="w-4 h-4 m-2" />
              </button>
              {showFilterDropdown && (
                <div
                  className="absolute right-0 z-10 w-56 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg"
                  onClick={handleFilterDropdownClick}
                >
                  <div className="p-3">
                    {!showRecurring && (
                      <div className="mb-3">
                        <label className="block mb-1 text-xs font-medium text-gray-700">Status</label>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="all">All Status</option>
                          <option value="APPROVED">Approved</option>
                          <option value="PENDING">Pending</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </div>
                    )}
                    <div className="mb-3">
                      <label className="block mb-1 text-xs font-medium text-gray-700">Type</label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="all">All Types</option>
                        <option value="ONE_TIME">One-time</option>
                        <option value="RECURRING">Recurring</option>
                        <option value="PERMANENT">Permanent</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="block mb-1 text-xs font-medium text-gray-700">Category</label>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="all">All Categories</option>
                        {categories.map((category) => (
                          <option key={category.id || category.value || category.name} value={category.value || category.name || category}>
                            {category.name || category}
                          </option>
                        ))}
                      </select>
                    </div>
                    {hasActiveFilters && (
                      <button
                        onClick={handleClearAllFilters}
                        className="w-full px-3 py-2 text-sm text-purple-800 transition-colors border border-purple-200 rounded-md bg-purple-50 hover:bg-purple-100"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="relative" ref={excelDropdownRef}>
              <button
                onClick={() => setShowExcelDropdown(!showExcelDropdown)}
                className="flex items-center p-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FileText className="w-4 h-4 m-1" />
                Excel
                <ChevronDown className="w-4 h-4 m-1" />
              </button>
              {showExcelDropdown && (
                <div className="absolute right-0 z-10 w-40 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="py-1">
                    <label className="flex items-center px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50">
                      <Upload className="w-4 h-4 mr-2" />
                      Import
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={exportToExcel}
                      className="flex items-center w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
          <div className="flex space-x-6">
            <span>Total: {totalVisitors}</span>
            {!showRecurring && (
              <>
                <span className="text-green-600">Approved: {approvedCount}</span>
                <span className="text-yellow-600">Pending: {pendingCount}</span>
                <span className="text-red-600">Rejected: {rejectedCount}</span>
              </>
            )}
          </div>
          <div className="flex space-x-6">
            <span className="text-blue-600">One-time: {oneTimeCount}</span>
            <span className="text-purple-600">Recurring: {recurringCount}</span>
            <span className="text-indigo-600">Permanent: {permanentCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;