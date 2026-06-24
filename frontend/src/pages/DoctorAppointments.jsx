import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import AppointmentCard from '../components/AppointmentCard';
import { Calendar, AlertCircle, FileText } from 'lucide-react';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Prescription Modal State
  const [prescModalOpen, setPrescModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [medicines, setMedicines] = useState('');
  const [notes, setNotes] = useState('');
  const [prescError, setPrescError] = useState('');
  const [prescLoading, setPrescLoading] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/appointments/doctor');
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching doctor appointments:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleAccept = async (id) => {
    try {
      const res = await api.put(`/appointments/${id}/status`, { status: 'confirmed' });
      if (res.data.success) fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept appointment');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this appointment request?')) return;
    try {
      const res = await api.put(`/appointments/${id}/status`, { status: 'cancelled' });
      if (res.data.success) fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject appointment');
    }
  };

  const handleWritePrescriptionTrigger = (appt) => {
    setSelectedAppt(appt);
    setMedicines('');
    setNotes('');
    setPrescModalOpen(true);
    setPrescError('');
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    if (!medicines) {
      setPrescError('Please type prescribed medicines instructions.');
      return;
    }

    try {
      setPrescLoading(true);
      setPrescError('');

      const res = await api.post('/prescriptions', {
        appointment_id: selectedAppt.appointment_id,
        medicines,
        notes
      });

      if (res.data.success) {
        setPrescModalOpen(false);
        alert('Prescription created successfully and appointment marked as completed!');
        fetchAppointments();
      }
    } catch (err) {
      console.error(err);
      setPrescError(err.response?.data?.message || 'Failed to submit prescription details.');
    } finally {
      setPrescLoading(false);
    }
  };

  const handleChatTrigger = (patientId, patientName) => {
    const event = new CustomEvent('open_chat', {
      detail: { otherUserId: patientId, otherUserName: patientName }
    });
    window.dispatchEvent(event);
  };

  const handleJoinVideoTrigger = (appointmentId, patientId, patientName) => {
    window.location.href = `/video/${appointmentId}?peer=${patientId}&name=${encodeURIComponent(patientName)}`;
  };

  return (
    <div className="space-y-8 pb-10 min-h-screen">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Patients Appointments</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs">Review pending requests, launch video grids, and upload prescription logs.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-28 rounded-3xl skeleton"></div>
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-20 bg-white/40 dark:bg-darkBg-light/40 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 max-w-md mx-auto">
          <Calendar className="h-12 w-12 text-slate-350 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="font-bold text-lg text-slate-850 dark:text-slate-200">No Appointments</h3>
          <p className="text-slate-455 text-xs mt-1">Pending consultation schedules will list here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <AppointmentCard
              key={appt.appointment_id}
              appointment={appt}
              role="doctor"
              onAccept={handleAccept}
              onReject={handleReject}
              onChat={handleChatTrigger}
              onJoinVideo={handleJoinVideoTrigger}
              onWritePrescription={handleWritePrescriptionTrigger}
              onViewPrescription={(apptId) => {
                alert('Loading prescription details window');
                window.location.href = `/doctor/patients`;
              }}
            />
          ))}
        </div>
      )}

      {/* Prescription Entry Form Modal */}
      {prescModalOpen && selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel bg-white dark:bg-darkBg-light w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-750">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/60">
              <h3 className="font-extrabold text-lg text-slate-850 dark:text-white">Create Consultation Recipe</h3>
              <button onClick={() => setPrescModalOpen(false)} className="text-slate-400 hover:text-slate-650 font-bold">X</button>
            </div>

            {prescError && (
              <div className="flex items-center space-x-2 p-3 mt-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-455 text-xs font-semibold">
                <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
                <span>{prescError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitPrescription} className="mt-4 space-y-4">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-450 font-semibold">Consulting Patient</p>
                <p className="text-sm font-bold text-slate-850 dark:text-white mt-0.5">{selectedAppt.Patient?.User?.name}</p>
                <p className="text-xxs text-slate-400">Date: {selectedAppt.date} | Time: {selectedAppt.time}</p>
              </div>

              {/* Medicines instructions list */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-2">Prescribed Medicines & Dosages</label>
                <textarea
                  rows={5}
                  required
                  value={medicines}
                  onChange={(e) => setMedicines(e.target.value)}
                  className="block w-full px-4 py-3 bg-slate-50 dark:bg-darkBg-deep text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-mono leading-relaxed"
                  placeholder="e.g.&#10;1. Amoxicillin 500mg - 3 times a day - 7 days&#10;2. Paracetamol 650mg - as needed for fever"
                ></textarea>
              </div>

              {/* Consultation / Doctor Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-2">Special Care Instructions / Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="block w-full px-4 py-3 bg-slate-50 dark:bg-darkBg-deep text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="Drink plenty of water, avoid intensive physical activity..."
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={prescLoading}
                  className="w-full py-3.5 bg-secondary-600 hover:bg-secondary-750 text-white rounded-2xl text-sm font-bold shadow-md hover-scale flex justify-center items-center space-x-1.5 transition-colors"
                >
                  <FileText className="h-5 w-5" />
                  {prescLoading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Submit & Close Consultation</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
