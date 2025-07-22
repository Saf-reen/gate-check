import React from 'react';

const CountCard = ({ title, count, description, icon, color }) => {
  return (
    <div className="p-6 bg-transparent border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{count}</p>
          <p className="mt-1 text-sm text-gray-500">
            {description}
          </p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('text', 'bg')}-100`}>
          {React.cloneElement(icon, { className: `w-8 h-8 ${color}` })}
        </div>
      </div>
    </div>
  );
};

export default CountCard;
