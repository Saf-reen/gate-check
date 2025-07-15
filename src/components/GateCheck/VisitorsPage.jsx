import React from 'react';
import { Users, Activity, TrendingUp, Clock } from 'lucide-react';

const VisitorsPage = ({ totalVisitors, visitors }) => {
  const walkinCount = visitors.filter(v => v.type === 'walkin').length;
  const scheduleCount = visitors.filter(v => v.type === 'schedule').length;
  const qrVisitorCount = visitors.filter(v => v.type === 'qr').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-transparent border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="flex items-center text-2xl font-bold text-gray-900">
            <Activity className="w-8 h-8 mr-3 text-purple-800" />
            Visitor Management Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Monitor and manage all visitor activities in real-time
          </p>
        </div>
      </div>
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <div className="p-6 bg-transparent border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Walk-in Visitors</p>
                <p className="text-2xl font-bold text-blue-600">{walkinCount}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {walkinCount > 0 ? 'Visitors on premises' : 'No walk-ins yet'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="p-6 bg-transparent border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled Visitors</p>
                <p className="text-2xl font-bold text-green-600">{scheduleCount}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {scheduleCount > 0 ? 'Scheduled visits' : 'No scheduled visits'}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
          <div className="p-6 bg-transparent border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">QR Visitors</p>
                <p className="text-2xl font-bold text-red-600">{qrVisitorCount}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {qrVisitorCount > 0 ? 'QR code visitors' : 'No QR visitors yet'}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Clock className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorsPage;
