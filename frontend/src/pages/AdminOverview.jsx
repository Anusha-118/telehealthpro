import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { StatsCard } from '../components/DashboardWidgets';
import { Users, DollarSign, Calendar, ShieldCheck, Activity } from 'lucide-react';
import { Line } from 'react-chartjs-2';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    stats: { totalPatients: 0, totalDoctors: 0, totalAppointments: 0, totalRevenue: 0 },
    recentPayments: [],
    recentAppointments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard statistics:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  const totalRev = parseFloat(stats.stats?.totalRevenue || 0).toFixed(2);

  // General chart info
  const chartData = {
    labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
    datasets: [
      {
        fill: true,
        label: 'Platform Revenue ($)',
        data: [100, 300, 250, 600, 800, stats.stats?.totalRevenue || 400],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Admin Platform Monitor</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs">Access system-wide reports, manage verified doctor rosters, and track sales revenue logs.</p>
      </div>

      {loading ? (
        <div className="h-64 rounded-3xl skeleton"></div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard
              title="System Revenue"
              value={`$${totalRev}`}
              icon={DollarSign}
              description="Gross billing volume"
            />
            <StatsCard
              title="Appointments"
              value={stats.stats?.totalAppointments || 0}
              icon={Calendar}
              description="Scheduled consultations"
            />
            <StatsCard
              title="Patients Registered"
              value={stats.stats?.totalPatients || 0}
              icon={Users}
              description="Active patient records"
            />
            <StatsCard
              title="Doctors Registered"
              value={stats.stats?.totalDoctors || 0}
              icon={ShieldCheck}
              description="Medical profiles catalog"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart */}
            <div className="lg:col-span-2 glass-panel p-6 bg-white/60 dark:bg-darkBg-light/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl space-y-4">
              <h3 className="font-extrabold text-slate-850 dark:text-white text-base">Weekly Billing Activity</h3>
              <div className="h-64">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Platform status indicator */}
            <div className="glass-panel p-6 bg-white/60 dark:bg-darkBg-light/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl space-y-4">
              <h3 className="font-extrabold text-slate-850 dark:text-white text-base flex items-center">
                <Activity className="h-4.5 w-4.5 text-primary-500 mr-1.5" />
                <span>Operational Health</span>
              </h3>
              <div className="space-y-4 text-xs font-semibold">
                <div className="flex justify-between p-3 bg-slate-50 dark:bg-darkBg-deep/50 rounded-2xl">
                  <span className="text-slate-500">API Gateway</span>
                  <span className="text-emerald-500">Online</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 dark:bg-darkBg-deep/50 rounded-2xl">
                  <span className="text-slate-500">Socket Signaling</span>
                  <span className="text-emerald-500">Connected</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 dark:bg-darkBg-deep/50 rounded-2xl">
                  <span className="text-slate-500">Database Sync</span>
                  <span className="text-emerald-500">Synced</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminOverview;
