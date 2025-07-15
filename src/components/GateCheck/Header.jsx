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
  permanentCount
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

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-2 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="flex items-center text-xl font-semibold text-gray-900">
              <Users className="w-6 h-6 m-2 text-purple-800" />
              {showRecurring ? 'Recurring Visitors' : 'Regular Visitors'}
            </h1>
            <button
              onClick={() => setShowRecurring(!showRecurring)}
              className={`p-2 text-sm rounded-lg transition-colors ${
                showRecurring
                  ? 'text-purple-800 bg-white hover:bg-purple-100 border border-purple-800'
                  : 'text-purple-800 bg-white hover:bg-purple-100 border border-purple-800'
              }`}
            >
              {showRecurring ? 'Show Regular Visitors' : 'Show Recurring Visitors'}
            </button>
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
                className="flex items-center text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4 m-2" />
                Filter
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
                          <option value="all">All ({totalVisitors})</option>
                          <option value="APPROVED">Approved ({approvedCount})</option>
                          <option value="PENDING">Pending ({pendingCount})</option>
                          <option value="REJECTED">Rejected ({rejectedCount})</option>
                        </select>
                      </div>
                    )}
                    <div className="mb-3">
                      <label className="block mb-1 text-xs font-medium text-gray-700">Pass Type</label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="all">All Types</option>
                        <option value="ONE_TIME">One Time ({oneTimeCount})</option>
                        <option value="RECURRING">Recurring ({recurringCount})</option>
                        <option value="PERMANENT">Permanent ({permanentCount})</option>
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
                        {categories.map(category => (
                          <option key={category.id} value={category.value}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => {
                        setFilterStatus('all');
                        setFilterType('all');
                        setFilterCategory('all');
                      }}
                      className="w-full px-3 py-2 text-xs text-gray-600 transition-colors border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="relative" ref={excelDropdownRef}>
              <button
                onClick={() => setShowExcelDropdown(!showExcelDropdown)}
                className="flex items-center text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FileText className="w-4 h-4 m-2"/>
                Excel
                <ChevronDown className="w-4 h-4 m-2"/>
              </button>
              {showExcelDropdown && (
                <div className="absolute right-0 z-10 w-40 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="py-1">
                    <label className="flex items-center px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Excel
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={exportToExcel}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Excel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
