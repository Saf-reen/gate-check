import React, { useRef, useEffect } from 'react';
import { Filter, Download, Upload } from 'lucide-react';

const FilterControls = ({
  showFilterDropdown,
  setShowFilterDropdown,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
  filterCategory,
  setFilterCategory,
  categories,
  onClearFilters,
  exportToExcel,
  handleFileUpload
}) => {
  const dropdownRef = useRef(null);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowFilterDropdown(false);
    }
  };

  useEffect(() => {
    if (showFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterDropdown]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
        className="flex items-center px-4 py-2 text-purple-600 transition-colors duration-200 bg-white border-2 border-purple-600 rounded-lg hover:bg-purple-50"
      >
        <Filter className="w-4 h-4 mr-2" />
        Filters & Actions
      </button>
      
      {showFilterDropdown && (
        <div className="absolute left-0 z-10 p-6 mt-2 bg-white border-2 border-purple-200 rounded-lg shadow-xl w-80">
          {/* Filters Section */}
          <div className="mb-6">
            <h3 className="pb-2 mb-4 text-lg font-semibold text-gray-800 border-b border-purple-200">
              Filters
            </h3>
            
            {/* Status Filter */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 transition-colors border-2 border-purple-200 rounded-lg focus:border-purple-600 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="BLACKLISTED">Blacklisted</option>
              </select>
            </div>

            {/* Pass Type Filter */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">Pass Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full p-2 transition-colors border-2 border-purple-200 rounded-lg focus:border-purple-600 focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="ONE_TIME">One Time</option>
                <option value="RECURRING">Recurring</option>
                <option value="PERMANENT">Permanent</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full p-2 transition-colors border-2 border-purple-200 rounded-lg focus:border-purple-600 focus:outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            <button
              onClick={onClearFilters}
              className="w-full px-4 py-2 text-purple-600 transition-colors duration-200 border-2 border-purple-200 rounded-lg bg-purple-50 hover:bg-purple-100"
            >
              Clear All Filters
            </button>
          </div>

          {/* Divider */}
          <div className="mb-6 border-t border-purple-200"></div>

          {/* Excel Actions Section */}
          <div>
            <h3 className="pb-2 mb-4 text-lg font-semibold text-gray-800 border-b border-purple-200">
              Excel Actions
            </h3>
            
            <div className="space-y-3">
              {/* Export Button */}
              <button
                onClick={() => {
                  exportToExcel();
                  setShowFilterDropdown(false);
                }}
                className="flex items-center justify-center w-full px-4 py-2 text-purple-600 transition-colors duration-200 border-2 border-purple-200 rounded-lg bg-purple-50 hover:bg-purple-100"
              >
                <Download className="w-4 h-4 mr-2" />
                Export to Excel
              </button>

              {/* Import Button */}
              <label className="flex items-center justify-center w-full px-4 py-2 text-purple-600 transition-colors duration-200 border-2 border-purple-200 rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100">
                <Upload className="w-4 h-4 mr-2" />
                Import from Excel
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => {
                    handleFileUpload(e);
                    setShowFilterDropdown(false);
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterControls;