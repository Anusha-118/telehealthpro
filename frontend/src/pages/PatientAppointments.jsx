import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import AppointmentCard from '../components/AppointmentCard';
import { CreditCard, AlertCircle, Calendar } from 'lucide-react';

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stripe Checkout Modal State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [payError, setPayError] = useState('');
  const [payLoading, setPayLoading] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/appointments/patient');
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching patient appointments:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment request?')) return;
    try {
      const res = await api.put(`/appointments/${appointmentId}/status`, { status: 'cancelled' });
      if (res.data.success) {
        fetchAppointments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const handlePayTrigger = (appt) => {
    setSelectedAppt(appt);
    setPayModalOpen(true);
    setPayError('');
    setCardNumber('');
    setExpiry('');
    setCvv('');
  };

  const handleStripePayment = async (e) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvv) {
      setPayError('Please fill out all card details.');
      return;
    }

    try {
      setPayLoading(true);
      setPayError('');

      // 1. Create Checkout Session Intent
      const sessionRes = await api.post('/payments/checkout', {
        appointment_id: selectedAppt.appointment_id
      });

      if (sessionRes.data.success) {
        // 2. Confirm Payment immediately (simulating Stripe card capture)
        const confirmRes = await api.post('/payments/confirm', {
          appointment_id: selectedAppt.appointment_id
        });

        if (confirmRes.data.success) {
          setPayModalOpen(false);
          alert('Payment completed successfully! Your appointment is now confirmed.');
          fetchAppointments();
        }
      }
    } catch (err) {
      console.error(err);
      setPayError(err.response?.data?.message || 'Payment processor failed. Please try again.');
    } finally {
      setPayLoading(false);
    }
  };

  // Chat window handler
  const handleChatTrigger = (doctorId, doctorName) => {
    // We will dispatch a global window event to open the Chat overlay component
    const event = new CustomEvent('open_chat', {
      detail: { otherUserId: doctorId, otherUserName: doctorName }
    });
    window.dispatchEvent(event);
  };

  // Video call joiner
  const handleJoinVideoTrigger = (appointmentId, doctorId, doctorName) => {
    // Redirect to the video room route
    window.location.href = `/video/${appointmentId}?peer=${doctorId}&name=${encodeURIComponent(doctorName)}`;
  };

  return (
    <div className="space-y-8 pb-10 min-h-screen">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">My Consultations</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs">Manage appointment schedules, pay consultation fees, and access active meeting rooms.</p>
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
          <p className="text-slate-450 text-xs mt-1">Book a doctor from the specialist listings to schedule your first care consultation.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <AppointmentCard
              key={appt.appointment_id}
              appointment={appt}
              role="patient"
              onCancel={handleCancel}
              onPay={handlePayTrigger}
              onChat={handleChatTrigger}
              onJoinVideo={handleJoinVideoTrigger}
              onViewPrescription={(apptId) => window.location.href = `/patient/prescriptions?highlight=${apptId}`}
            />
          ))}
        </div>
      )}

      {/* Stripe Payment Modal Overlays */}
      {payModalOpen && selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel bg-white dark:bg-darkBg-light w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-750">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/60">
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Secure Stripe Payment</h3>
              <button onClick={() => setPayModalOpen(false)} className="text-slate-400 hover:text-slate-650 font-bold">X</button>
            </div>

            {payError && (
              <div className="flex items-center space-x-2 p-3 mt-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 text-xs font-semibold">
                <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
                <span>{payError}</span>
              </div>
            )}

            <form onSubmit={handleStripePayment} className="mt-4 space-y-4">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-450 font-semibold">Paying consultation for</p>
                <p className="text-sm font-bold text-slate-850 dark:text-white mt-0.5">Dr. {selectedAppt.Doctor?.User?.name}</p>
                <div className="flex justify-between items-center mt-2 p-3 bg-primary-500/10 rounded-xl text-primary-650 dark:text-primary-400">
                  <span className="text-xs font-bold">Amount Due:</span>
                  <span className="text-base font-extrabold">${parseFloat(selectedAppt.Payment?.amount || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Card Number */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-2">Card Number</label>
                <input
                  type="text"
                  required
                  maxLength="19"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                  className="block w-full px-4 py-3 bg-slate-50 dark:bg-darkBg-deep text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-mono"
                  placeholder="4242 4242 4242 4242"
                />
              </div>

              {/* Exp and CVV grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-2">Expiration</label>
                  <input
                    type="text"
                    required
                    maxLength="5"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-50 dark:bg-darkBg-deep text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-2">CVC</label>
                  <input
                    type="password"
                    required
                    maxLength="3"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-50 dark:bg-darkBg-deep text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="123"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={payLoading}
                  className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-sm font-bold shadow-md hover-scale flex justify-center items-center space-x-1.5 transition-colors"
                >
                  <CreditCard className="h-5 w-5" />
                  {payLoading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Pay Consultation Fee</span>
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

export default PatientAppointments;
