import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FileSignature, Stethoscope, Download, Pill } from 'lucide-react';

const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        // Prescriptions are fetched via patient's general clinical history
        const res = await api.get('/patients/history');
        if (res.data.success) {
          // Extract appointments that have prescriptions
          const withPresc = res.data.data.appointments
            .filter((a) => a.Prescription !== null)
            .map((a) => ({
              ...a.Prescription,
              doctorName: a.Doctor?.User?.name || 'Doctor',
              specialization: a.Doctor?.specialization || 'Medical Specialist',
              date: a.date
            }));
          setPrescriptions(withPresc);
        }
      } catch (err) {
        console.error('Error loading patient prescriptions:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  // Simple print handler to download/save as PDF invoice
  const handlePrint = (prescId) => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-10 min-h-screen">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">My Prescriptions</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs">Access pharmaceutical recipes and doctor care instructions from completed appointments.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((n) => (
            <div key={n} className="h-48 rounded-3xl skeleton"></div>
          ))}
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="text-center py-20 bg-white/40 dark:bg-darkBg-light/40 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 max-w-md mx-auto">
          <FileSignature className="h-12 w-12 text-slate-350 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="font-bold text-lg text-slate-850 dark:text-slate-200">No Prescriptions</h3>
          <p className="text-slate-450 text-xs mt-1">Prescriptions will appear here after consultations are completed by your doctor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prescriptions.map((presc) => (
            <div key={presc.prescription_id} className="glass-panel bg-white/60 dark:bg-darkBg-light/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 flex flex-col justify-between hover-scale">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-base text-slate-850 dark:text-white flex items-center">
                      <Stethoscope className="h-4 w-4 text-primary-500 mr-1.5" />
                      <span>Dr. {presc.doctorName}</span>
                    </h3>
                    <p className="text-xs text-primary-550 dark:text-primary-400 font-semibold">{presc.specialization}</p>
                  </div>
                  <span className="text-xxs font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider">
                    Date: {presc.date}
                  </span>
                </div>

                {/* Medicines List */}
                <div className="bg-slate-50 dark:bg-darkBg-deep/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 space-y-3">
                  <div className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-405 uppercase tracking-wider">
                    <Pill className="h-4 w-4 mr-1.5 text-secondary-500" />
                    <span>Prescribed Regimes</span>
                  </div>
                  <p className="text-sm text-slate-750 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed pl-1">
                    {presc.medicines}
                  </p>
                </div>

                {/* Care Notes */}
                {presc.notes && (
                  <div>
                    <span className="text-xxs font-bold text-slate-450 dark:text-slate-450 uppercase tracking-wider">Doctor Notes</span>
                    <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 leading-relaxed bg-white/40 dark:bg-transparent p-3 border-l-2 border-primary-500 rounded-r-xl">
                      {presc.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-6 flex justify-end">
                <button
                  onClick={() => handlePrint(presc.prescription_id)}
                  className="flex items-center space-x-1.5 px-4 py-2.5 bg-secondary-600 hover:bg-secondary-750 text-white rounded-xl text-xs font-bold shadow-sm transition-colors hover-scale"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Recipe PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientPrescriptions;
