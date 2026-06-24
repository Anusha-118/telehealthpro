import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { StatsCard, ProgressRing } from '../components/DashboardWidgets';
import AppointmentCard from '../components/AppointmentCard';
import { DollarSign, Users, Calendar, Activity } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DoctorOverview = () => {
  const { user } = useSelector((state) => state.auth);
  
  const [appointments, setAppointments] = useState([]);
  const [earnings, setEarnings] = useState({ totalEarnings: 0, monthlyAnalytics: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Fetch appointments
        const apptRes = await api.get('/appointments/doctor');
        if (apptRes.data.success) {
          setAppointments(apptRes.data.data);
        }

        // Fetch earnings
        const earnRes = await api.get('/doctors/earnings');
        if (earnRes.data.success) {
          setEarnings(earnRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching doctor overview stats:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const totalPatients = new Set(appointments.map((a) => a.patient_id)).size;
  const completedAppointments = appointments.filter((a) => a.status === 'completed').length;
  const pendingAppointments = appointments.filter((a) => a.status === 'pending').length;

  // Chart Setup
  const chartLabels = earnings.monthlyAnalytics.length > 0
    ? earnings.monthlyAnalytics.map((a) => a.month)
    : ['No Data'];
  const chartValues = earnings.monthlyAnalytics.length > 0
    ? earnings.monthlyAnalytics.map((a) => parseFloat(a.amount))
    : [0];

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Monthly Earnings ($)',
        data: chartValues,
        backgroundColor: '#8b5cf6', // secondary-500
        borderRadius: 8
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
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">Dashboard Overview</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs">Dr. {user?.name}, check your earnings and pending appointment confirmations.</p>
        </div>
      </div>

      {loading ? (
        <div className="h-64 rounded-3xl skeleton"></div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard
              title="Total Earnings"
              value={`$${parseFloat(earnings.totalEarnings || 0).toFixed(2)}`}
              icon={DollarSign}
              description="Fees from consultations"
            />
            <StatsCard
              title="Consultations"
              value={appointments.length}
              icon={Calendar}
              description={`${pendingAppointments} pending approvals`}
            />
            <StatsCard
              title="Total Patients"
              value={totalPatients}
              icon={Users}
              description="Unique registered files"
            />
            <StatsCard
              title="Success Rate"
              value={appointments.length > 0 ? `${Math.round((completedAppointments / appointments.length) * 100)}%` : '0%'}
              icon={Activity}
              description="Sessions completed"
            />
          </div>

          {/* Analytics and Visual Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass-panel p-6 bg-white/60 dark:bg-darkBg-light/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl space-y-4">
              <h3 className="font-extrabold text-slate-850 dark:text-white text-base">Revenue Breakdown</h3>
              <div className="h-64">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            <ProgressRing
              percentage={user?.doctorVerificationStatus === 'approved' ? 100 : 0}
              title="Approval Credentials Status"
              subtitle={user?.doctorVerificationStatus || 'pending'}
            />
          </div>

          {/* Recent Appointments */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-850 dark:text-white text-base font-bold">Upcoming Consultations</h3>
            {appointments.length === 0 ? (
              <div className="text-center py-10 glass-panel bg-white/40 dark:bg-darkBg-light/40 border border-slate-200/50 dark:border-slate-850 rounded-3xl">
                <p className="text-slate-450 dark:text-slate-450 text-xs">No consult history found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.slice(0, 3).map((appt) => (
                  <AppointmentCard
                    key={appt.appointment_id}
                    appointment={appt}
                    role="doctor"
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

export default DoctorOverview;
