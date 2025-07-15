import React from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

const SearchBar = ({ searchQuery, onSearchChange, onClearSearch }) => {
  return (
    <div className="relative max-w-md">
      <div className="relative">
        <FaSearch className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search Organizations..."
          className="h-10 p-2 pl-10 text-sm bg-white border border-gray-300 rounded-lg shadow-sm w-80 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={onClearSearch}
            className="absolute p-1 transition-colors transform -translate-y-1/2 rounded-full right-3 top-1/2 hover:bg-gray-100"
          >
            <FaTimes className="w-3 h-3 text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
