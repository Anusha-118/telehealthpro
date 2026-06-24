import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { DollarSign, CreditCard, Calendar, BarChart3 } from 'lucide-react';
import { Bar } from 'react-chartjs-2';

const DoctorEarnings = () => {
  const [earnings, setEarnings] = useState({ totalEarnings: 0, monthlyAnalytics: [], transactions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/doctors/earnings');
        if (res.data.success) {
          setEarnings(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching doctor earnings statement:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  const chartLabels = earnings.monthlyAnalytics.map((a) => a.month);
  const chartValues = earnings.monthlyAnalytics.map((a) => parseFloat(a.amount));

  const chartData = {
    labels: chartLabels.length > 0 ? chartLabels : ['No Data'],
    datasets: [
      {
        label: 'Earnings ($)',
        data: chartValues.length > 0 ? chartValues : [0],
        backgroundColor: 'rgba(20, 184, 166, 0.7)',
        borderRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } }
    }
  };

  return (
    <div className="space-y-8 pb-10 min-h-screen">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Earnings & Statements</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs">Track incoming consultation payments, payouts histories, and monthly revenue metrics.</p>
      </div>

      {loading ? (
        <div className="h-64 rounded-3xl skeleton"></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Statement table */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-extrabold text-slate-805 dark:text-white text-base">Transactions History</h3>
            
            {earnings.transactions.length === 0 ? (
              <div className="text-center py-12 glass-panel bg-white/40 dark:bg-darkBg-light/40 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl">
                <p className="text-slate-450 dark:text-slate-455 text-xs">No transactions recorded yet.</p>
              </div>
            ) : (
              <div className="glass-panel bg-white/60 dark:bg-darkBg-light/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse select-none">
                    <thead>
                      <tr className="bg-slate-100/50 dark:bg-darkBg-deep/50 border-b border-slate-200/65 dark:border-slate-800/65 text-slate-500 dark:text-slate-405 font-bold text-xxs uppercase tracking-wider">
                        <th className="py-4 px-5">Receipt ID</th>
                        <th className="py-4 px-5">Patient</th>
                        <th className="py-4 px-5">Date</th>
                        <th className="py-4 px-5 text-right">Fee Paid</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {earnings.transactions.map((t) => {
                        const name = t.Appointment?.Patient?.User?.name || 'Patient';
                        const fee = parseFloat(t.amount).toFixed(2);
                        const date = new Date(t.created_at).toLocaleDateString();

                        return (
                          <tr key={t.payment_id} className="hover:bg-slate-50/50 dark:hover:bg-darkBg-deep/30 transition-colors text-slate-750 dark:text-slate-350">
                            <td className="py-4 px-5 font-mono text-xs text-slate-400">
                              TXN-{t.payment_id.toString().padStart(6, '0')}
                            </td>
                            <td className="py-4 px-5 font-semibold">
                              {name}
                            </td>
                            <td className="py-4 px-5 text-slate-500">
                              {date}
                            </td>
                            <td className="py-4 px-5 font-bold text-slate-900 dark:text-white text-right">
                              ${fee}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar visual stats */}
          <div className="space-y-6">
            <div className="glass-panel p-6 bg-white/70 dark:bg-darkBg-light/75 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
              <h4 className="font-extrabold text-sm text-slate-850 dark:text-white flex items-center">
                <BarChart3 className="h-4.5 w-4.5 text-primary-500 mr-1.5" />
                <span>Monthly Growth</span>
              </h4>
              <div className="h-48">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorEarnings;
