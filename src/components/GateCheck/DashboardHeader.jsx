import React from 'react';

const DashboardHeader = ({ title, description, icon }) => {
  return (
    <div className="bg-transparent border-b border-gray-200">
      <div className="px-6 py-4">
        <h1 className="flex items-center text-2xl font-bold text-gray-900">
          {React.cloneElement(icon, { className: "w-8 h-8 mr-3 text-purple-800" })}
          {title}
        </h1>
        <p className="mt-2 text-gray-600">
          {description}
        </p>
      </div>
    </div>
  );
};

export default DashboardHeader;
