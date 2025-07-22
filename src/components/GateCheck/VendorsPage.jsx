import React from 'react';
import { Users, Activity, TrendingUp, Clock } from 'lucide-react';
import DashboardHeader from './DashboardHeader';
import CountCard from './CountCard';

const VendorsPage = ({ totalVendors, vendors }) => {
  const walkinCount = vendors.filter(v => v.type === 'walkin').length;
  const scheduleCount = vendors.filter(v => v.type === 'schedule').length;
  const qrVendorCount = vendors.filter(v => v.type === 'qr').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Vendors Management Dashboard"
        description="Monitor and manage all vendor activities in real-time"
        icon={<Activity />}
      />
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <CountCard
            title="Walk-in Vendors"
            count={walkinCount}
            description={walkinCount > 0 ? 'Vendors on premises' : 'No walk-ins yet'}
            icon={<Users />}
            color="text-blue-600"
          />
          <CountCard
            title="Scheduled Vendors"
            count={scheduleCount}
            description={scheduleCount > 0 ? 'Scheduled visits' : 'No scheduled visits'}
            icon={<TrendingUp />}
            color="text-green-600"
          />
          <CountCard
            title="QR Vendors"
            count={qrVendorCount}
            description={qrVendorCount > 0 ? 'QR code vendors' : 'No QR vendors yet'}
            icon={<Clock />}
            color="text-red-600"
          />
        </div>
      </div>
    </div>
  );
};

export default VendorsPage;
