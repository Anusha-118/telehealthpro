import React from 'react';
import { Calendar, Clock, User, CreditCard, MessageSquare, Video, FileText, Check, X } from 'lucide-react';

const AppointmentCard = ({
  appointment,
  role,
  onAccept,
  onReject,
  onCancel,
  onPay,
  onChat,
  onJoinVideo,
  onWritePrescription,
  onViewPrescription
}) => {
  const isDoctor = role === 'doctor';
  const partnerName = isDoctor 
    ? appointment.Patient?.User?.name || 'Patient' 
    : appointment.Doctor?.User?.name || 'Doctor';
  const partnerId = isDoctor 
    ? appointment.Patient?.User?.id 
    : appointment.Doctor?.User?.id;

  const dateStr = appointment.date;
  const timeStr = appointment.time;
  const status = appointment.status;
  const paymentStatus = appointment.Payment?.payment_status || 'pending';

  // Badges
  const getStatusBadge = () => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">Pending</span>;
      case 'confirmed':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium">Confirmed</span>;
      case 'completed':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="glass-panel bg-white/60 dark:bg-darkBg-light/60 rounded-3xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50 hover-scale">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Profile and basic info */}
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
            {partnerName.replace('Dr. ', '').charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-1.5">
              <span>{isDoctor ? partnerName : `Dr. ${partnerName}`}</span>
            </h4>
            <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1" /> {dateStr}</span>
              <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1" /> {timeStr}</span>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center space-x-2">
          {getStatusBadge()}
          {status !== 'cancelled' && (
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
              paymentStatus === 'paid'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400'
            }`}>
              {paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
            </span>
          )}
        </div>
      </div>

      {/* Action Triggers Footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap gap-2 justify-end">
        {/* Doctor pending appointment controls */}
        {isDoctor && status === 'pending' && (
          <>
            <button
              onClick={() => onReject && onReject(appointment.appointment_id)}
              className="flex items-center space-x-1 px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-2xl text-xs font-semibold transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Reject</span>
            </button>
            <button
              onClick={() => onAccept && onAccept(appointment.appointment_id)}
              className="flex items-center space-x-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-semibold transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>Accept</span>
            </button>
          </>
        )}

        {/* Patient pending appointment actions (cancel/pay) */}
        {!isDoctor && status === 'pending' && (
          <>
            <button
              onClick={() => onCancel && onCancel(appointment.appointment_id)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel Request
            </button>
            {paymentStatus !== 'paid' && (
              <button
                onClick={() => onPay && onPay(appointment)}
                className="flex items-center space-x-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-xs font-semibold shadow-md transition-colors"
              >
                <CreditCard className="h-4 w-4" />
                <span>Pay Consultation Fee</span>
              </button>
            )}
          </>
        )}

        {/* Active Consultation Features (Chat & Video) */}
        {status === 'confirmed' && (
          <>
            {!isDoctor && paymentStatus !== 'paid' ? (
              <div className="text-xs text-rose-500 font-semibold flex items-center">
                Please complete payment to start consultation.
              </div>
            ) : (
              <>
                {/* Chat */}
                <button
                  onClick={() => onChat && onChat(partnerId, partnerName)}
                  className="flex items-center space-x-1 px-4 py-2 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-semibold transition-colors"
                >
                  <MessageSquare className="h-4 w-4 text-slate-500" />
                  <span>Chat</span>
                </button>
                {/* Video WebRTC */}
                <button
                  onClick={() => onJoinVideo && onJoinVideo(appointment.appointment_id, partnerId, partnerName)}
                  className="flex items-center space-x-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-xs font-semibold shadow-md transition-colors"
                >
                  <Video className="h-4 w-4" />
                  <span>Join Video Call</span>
                </button>
                {/* Doctor Prescription Submission */}
                {isDoctor && (
                  <button
                    onClick={() => onWritePrescription && onWritePrescription(appointment)}
                    className="flex items-center space-x-1 px-4 py-2 bg-secondary-600 hover:bg-secondary-700 text-white rounded-2xl text-xs font-semibold shadow-md transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Complete & Prescribe</span>
                  </button>
                )}
              </>
            )}
          </>
        )}

        {/* Prescription Access (Completed sessions) */}
        {status === 'completed' && (
          <button
            onClick={() => onViewPrescription && onViewPrescription(appointment.appointment_id)}
            className="flex items-center space-x-1 px-4 py-2 bg-secondary-50 text-secondary-650 hover:bg-secondary-100 rounded-2xl text-xs font-semibold transition-colors"
          >
            <FileText className="h-4 w-4 text-secondary-500" />
            <span>View Prescription</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
