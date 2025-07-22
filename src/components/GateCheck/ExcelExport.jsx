import React, { useState, useEffect, useRef } from 'react';

const ExcelExport = ({ showExcelDropdown, setShowExcelDropdown, handleFileUpload, exportToExcel }) => {
  const dropdownRef = useRef(null);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowExcelDropdown(false);
    }
  };

  useEffect(() => {
    if (showExcelDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExcelDropdown]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowExcelDropdown(!showExcelDropdown)}
        className="px-4 py-2 ml-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
      >
        Excel
      </button>
      {showExcelDropdown && (
        <div className="absolute right-0 z-10 w-48 p-2 mt-2 bg-white rounded-lg shadow-lg">
          <button
            onClick={exportToExcel}
            className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
          >
            Export
          </button>
          <label className="block w-full px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-gray-100">
            Import
            <input type="file" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      )}
    </div>
  );
};

export default ExcelExport;
