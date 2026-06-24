import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { StatsCard, ProgressRing } from '../components/DashboardWidgets';
import AppointmentCard from '../components/AppointmentCard';
import { Calendar, FileText, FileSignature, CreditCard } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PatientOverview = () => {
  const { user } = useSelector((state) => state.auth);
  const [history, setHistory] = useState({ appointments: [], reports: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get('/patients/history');
        if (res.data.success) {
          setHistory(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching patient overview history:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const appointments = history.appointments || [];
  const reports = history.reports || [];

  const completedConsults = appointments.filter((a) => a.status === 'completed').length;
  const pendingConsults = appointments.filter((a) => a.status === 'pending').length;
  const totalReports = reports.length;

  // Chart data
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        fill: true,
        label: 'Consultation Minutes',
        data: [0, 30, 45, 15, 60, 40],
        borderColor: '#14b8a6', // primary-500
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        tension: 0.4
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
    <div className="space-y-8 pb-10">
      {/* Welcome Banner */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Welcome back, {user?.name}!</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs">Here is an overview of your medical consultations, reports, and payments.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 skeleton h-32 rounded-3xl"></div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              title="Appointments"
              value={appointments.length}
              icon={Calendar}
              description={`${pendingConsults} pending, ${appointments.filter((a) => a.status === 'confirmed').length} active`}
            />
            <StatsCard
              title="Medical Reports"
              value={totalReports}
              icon={FileText}
              description="Uploaded PDFs and records"
            />
            <StatsCard
              title="Completed Consults"
              value={completedConsults}
              icon={FileSignature}
              description="Prescriptions issued"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Visual consultation trends */}
            <div className="lg:col-span-2 glass-panel p-6 bg-white/60 dark:bg-darkBg-light/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl space-y-4">
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Consultation Analytics</h3>
              <div className="h-64">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Health goals tracker card */}
            <ProgressRing
              percentage={80}
              title="Health Profile Completeness"
              subtitle="Bio info & history"
            />
          </div>

          {/* Recent Appointments */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Recent Consultations</h3>
            {appointments.length === 0 ? (
              <div className="text-center py-10 glass-panel bg-white/40 dark:bg-darkBg-light/40 border border-slate-200/50 dark:border-slate-850 rounded-3xl">
                <p className="text-slate-450 dark:text-slate-450 text-xs">No appointments booked yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.slice(0, 3).map((appt) => (
                  <AppointmentCard
                    key={appt.appointment_id}
                    appointment={appt}
                    role="patient"
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PatientOverview;
