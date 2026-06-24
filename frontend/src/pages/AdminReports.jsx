import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { BarChart3, AlertCircle } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminReports = () => {
  const [reportData, setReportData] = useState({ appointmentsByStatus: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setReportData(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching admin reports analysis:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Map database status labels
  const statusLabels = reportData.appointmentsByStatus.map((item) => item.status);
  const statusCounts = reportData.appointmentsByStatus.map((item) => item.count);

  const chartData = {
    labels: statusLabels.length > 0 ? statusLabels : ['No Bookings'],
    datasets: [
      {
        data: statusCounts.length > 0 ? statusCounts : [1],
        backgroundColor: ['#14b8a6', '#f59e0b', '#ef4444', '#64748b'],
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="space-y-8 pb-10 min-h-screen">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Clinical & Platform Audits</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs">Review system-wide consultation density, patient approvals ratios, and performance metrics.</p>
      </div>

      {loading ? (
        <div className="h-64 rounded-3xl skeleton"></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart Card */}
          <div className="glass-panel p-6 bg-white/70 dark:bg-darkBg-light/75 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
            <h3 className="font-extrabold text-sm text-slate-850 dark:text-white flex items-center">
              <BarChart3 className="h-4.5 w-4.5 text-primary-500 mr-1.5" />
              <span>Consultations Status Metrics</span>
            </h3>
            <div className="h-64 flex justify-center items-center">
              <Doughnut data={chartData} />
            </div>
          </div>

          {/* Guidelines notes */}
          <div className="glass-panel p-6 bg-white/70 dark:bg-darkBg-light/75 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 text-xs leading-relaxed text-slate-500">
            <h3 className="font-bold text-sm text-slate-850 dark:text-white">Admin Audit Guidelines</h3>
            <p>Ensure that all doctor profiles are verified promptly. Under state guidelines, doctors must have valid qualifications (MBBS or equivalent certifications) before verifying.</p>
            <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-start space-x-2 text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Warning: Refund processes completed under Stripe payment gateway are irreversible. Please crosscheck txn IDs with bank summaries.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
