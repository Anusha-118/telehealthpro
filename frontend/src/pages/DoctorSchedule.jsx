import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Calendar, Clock, Check, X, Users } from 'lucide-react';

const DoctorSchedule = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await api.get('/appointments/doctor');
      if (res.data.success) {
        // Filter active/pending schedule entries
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching doctor schedule:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status === 'confirmed' ? 'accept' : 'reject'} this appointment?`)) return;

    try {
      const res = await api.put(`/appointments/${id}/status`, { status });
      if (res.data.success) {
        fetchSchedule();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed.');
    }
  };

  return (
    <div className="space-y-8 pb-10 min-h-screen">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Consultations Schedule</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs">Review scheduled patient times, approve requests, and plan your availability.</p>
      </div>

      {loading ? (
        <div className="h-64 rounded-3xl skeleton"></div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-20 bg-white/40 dark:bg-darkBg-light/40 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 max-w-md mx-auto">
          <Calendar className="h-12 w-12 text-slate-350 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="font-bold text-lg text-slate-850 dark:text-slate-200">Schedule is Empty</h3>
          <p className="text-slate-450 text-xs mt-1">Once patients book consultations, they will appear here as slots.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Slots list */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-extrabold text-slate-805 dark:text-white text-base">Schedule Slots</h3>
            
            {appointments.map((slot) => {
              const name = slot.Patient?.User?.name || 'Patient';
              return (
                <div key={slot.appointment_id} className="glass-panel bg-white/60 dark:bg-darkBg-light/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-5 flex justify-between items-center hover-scale">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-primary-500 rounded-xl flex items-center justify-center font-bold text-white shadow-sm">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-850 dark:text-white">{name}</h4>
                      <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-455 text-xxs font-semibold uppercase tracking-wider mt-1">
                        <span className="flex items-center"><Calendar className="h-3 w-3 mr-0.5" /> {slot.date}</span>
                        <span className="flex items-center"><Clock className="h-3 w-3 mr-0.5" /> {slot.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {slot.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(slot.appointment_id, 'cancelled')}
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors"
                          aria-label="Reject Slot"
                        >
                          <X className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(slot.appointment_id, 'confirmed')}
                          className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shadow-sm"
                          aria-label="Accept Slot"
                        >
                          <Check className="h-4.5 w-4.5" />
                        </button>
                      </>
                    ) : (
                      <span className={`px-2.5 py-1 text-xxs font-bold rounded-full capitalize ${
                        slot.status === 'confirmed' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' 
                          : slot.status === 'completed'
                          ? 'bg-slate-100 text-slate-850 dark:bg-slate-800 dark:text-slate-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400'
                      }`}>
                        {slot.status}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Metrics card */}
          <div className="space-y-6">
            <div className="glass-panel p-6 bg-gradient-to-tr from-secondary-500 to-secondary-650 rounded-3xl shadow-md text-white space-y-4 border border-secondary-600/30">
              <div className="flex justify-between items-start">
                <h3 className="font-extrabold text-base">Capacity Monitor</h3>
                <Users className="h-6 w-6 text-secondary-200" />
              </div>
              <p className="text-xs text-secondary-100 leading-relaxed">
                You have {appointments.filter((a) => a.status === 'confirmed').length} active consulting slots scheduled this week. Remember to join meetings on time.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSchedule;
