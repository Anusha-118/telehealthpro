import React from 'react';
import { Stethoscope, Award, DollarSign, CalendarRange } from 'lucide-react';

const DoctorCard = ({ doctor, onBookAppointment }) => {
  const doctorName = doctor.User?.name || 'Dr. Medical Expert';
  const specialization = doctor.specialization || 'General Practitioner';
  const qualification = doctor.qualification || 'MBBS, MD';
  const experience = doctor.experience || 5;
  const fee = parseFloat(doctor.consultation_fee || 0).toFixed(2);

  return (
    <div className="glass-panel bg-white/60 dark:bg-darkBg-light/60 rounded-3xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50 hover-scale flex flex-col justify-between h-full">
      <div>
        {/* Header (Avatar & Name) */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary-400 to-secondary-500 text-white flex items-center justify-center font-bold text-2xl shadow-md border-2 border-white dark:border-slate-800 flex-shrink-0">
            {doctorName.replace('Dr. ', '').charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center space-x-1.5">
              <span>{doctorName.startsWith('Dr. ') ? doctorName : `Dr. ${doctorName}`}</span>
            </h3>
            <div className="flex items-center text-xs text-primary-600 dark:text-primary-400 font-semibold mt-1">
              <Stethoscope className="h-3.5 w-3.5 mr-1" />
              <span>{specialization}</span>
            </div>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-2 gap-3 my-4 py-3 border-y border-slate-100 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Award className="h-4 w-4 text-secondary-500" />
            <span className="truncate">{qualification}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CalendarRange className="h-4 w-4 text-primary-500" />
            <span>{experience} years exp</span>
          </div>
        </div>
      </div>

      {/* Footer (Price & Action) */}
      <div className="flex items-center justify-between mt-4">
        <div>
          <p className="text-slate-400 text-xxs font-semibold uppercase tracking-wider">Consultation Fee</p>
          <div className="flex items-center text-slate-800 dark:text-slate-100 font-bold text-lg">
            <DollarSign className="h-4 w-4 text-slate-500 mr-0.5" />
            <span>{fee}</span>
          </div>
        </div>
        <button
          onClick={() => onBookAppointment && onBookAppointment(doctor)}
          className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-xs font-semibold shadow-md hover-scale transition-colors"
        >
          Book Consultation
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;
