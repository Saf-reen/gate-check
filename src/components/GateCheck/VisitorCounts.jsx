import React from 'react';

const VisitorCounts = ({
  totalVisitors,
  approvedCount,
  pendingCount,
  rejectedCount,
  oneTimeCount,
  recurringCount,
  permanentCount
}) => {
  return (
    <div className="flex flex-wrap justify-between gap-4 mb-4">
      <div className="px-4 py-2 bg-white rounded-lg shadow">
        <p className="text-sm text-gray-600">Total Visitors</p>
        <p className="text-xl font-bold">{totalVisitors}</p>
      </div>
      <div className="px-4 py-2 bg-white rounded-lg shadow">
        <p className="text-sm text-gray-600">Approved</p>
        <p className="text-xl font-bold">{approvedCount}</p>
      </div>
      <div className="px-4 py-2 bg-white rounded-lg shadow">
        <p className="text-sm text-gray-600">Pending</p>
        <p className="text-xl font-bold">{pendingCount}</p>
      </div>
      <div className="px-4 py-2 bg-white rounded-lg shadow">
        <p className="text-sm text-gray-600">Rejected</p>
        <p className="text-xl font-bold">{rejectedCount}</p>
      </div>
      <div className="px-4 py-2 bg-white rounded-lg shadow">
        <p className="text-sm text-gray-600">One Time</p>
        <p className="text-xl font-bold">{oneTimeCount}</p>
      </div>
      <div className="px-4 py-2 bg-white rounded-lg shadow">
        <p className="text-sm text-gray-600">Recurring</p>
        <p className="text-xl font-bold">{recurringCount}</p>
      </div>
      <div className="px-4 py-2 bg-white rounded-lg shadow">
        <p className="text-sm text-gray-600">Permanent</p>
        <p className="text-xl font-bold">{permanentCount}</p>
      </div>
    </div>
  );
};

export default VisitorCounts;
