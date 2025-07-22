import React from 'react';
import { Users, Activity, TrendingUp, Clock } from 'lucide-react';
import DashboardHeader from './DashboardHeader';
import CountCard from './CountCard';

const VisitorsPage = ({ totalVisitors, visitors }) => {
  const walkinCount = visitors.filter(v => v.type === 'walkin').length;
  const scheduleCount = visitors.filter(v => v.type === 'schedule').length;
  const qrVisitorCount = visitors.filter(v => v.type === 'qr').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Visitor Management Dashboard"
        description="Monitor and manage all visitor activities in real-time"
        icon={<Activity />}
      />
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <CountCard
            title="Walk-in Visitors"
            count={walkinCount}
            description={walkinCount > 0 ? 'Visitors on premises' : 'No walk-ins yet'}
            icon={<Users />}
            color="text-blue-600"
          />
          <CountCard
            title="Scheduled Visitors"
            count={scheduleCount}
            description={scheduleCount > 0 ? 'Scheduled visits' : 'No scheduled visits'}
            icon={<TrendingUp />}
            color="text-green-600"
          />
          <CountCard
            title="QR Visitors"
            count={qrVisitorCount}
            description={qrVisitorCount > 0 ? 'QR code visitors' : 'No QR visitors yet'}
            icon={<Clock />}
            color="text-red-600"
          />
        </div>
      </div>
    </div>
  );
};

export default VisitorsPage;
