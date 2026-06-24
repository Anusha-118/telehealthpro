import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { ShieldCheck, Stethoscope, Check, X, AlertCircle } from 'lucide-react';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/doctors');
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin doctors catalog:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleVerify = async (id, status) => {
    const confirmationText = `Are you sure you want to change verification status to: ${status}?`;
    if (!window.confirm(confirmationText)) return;

    try {
      const res = await api.put(`/admin/doctors/${id}/verify`, { status });
      if (res.data.success) {
        alert(`Doctor status updated to ${status} successfully!`);
        fetchDoctors();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Verification update failed.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400';
      case 'rejected':
        return 'bg-rose-100 text-rose-805 dark:bg-rose-950/30 dark:text-rose-400';
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400';
    }
  };

  return (
    <div className="space-y-8 pb-10 min-h-screen">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Verify Doctors Registrations</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs">Verify doctor credentials, toggle approvals, and edit listing states.</p>
      </div>

      {loading ? (
        <div className="h-64 rounded-3xl skeleton"></div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-20 bg-white/40 dark:bg-darkBg-light/40 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 max-w-md mx-auto">
          <Stethoscope className="h-12 w-12 text-slate-350 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="font-bold text-lg text-slate-850 dark:text-slate-200">No Doctors Registered</h3>
          <p className="text-slate-455 text-xs mt-1">No doctor profiles are available on the database.</p>
        </div>
      ) : (
        <div className="glass-panel bg-white/60 dark:bg-darkBg-light/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse select-none">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-darkBg-deep/50 border-b border-slate-200/65 dark:border-slate-800/65 text-slate-500 dark:text-slate-405 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Doctor Name</th>
                  <th className="py-4 px-6">Specialty</th>
                  <th className="py-4 px-6">Credentials</th>
                  <th className="py-4 px-6">Consulting Fee</th>
                  <th className="py-4 px-6">Verification Status</th>
                  <th className="py-4 px-6 text-right">Approval Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {doctors.map((doc) => {
                  const name = doc.User?.name || 'Dr. Specialist';
                  const spec = doc.specialization || 'Not set';
                  const fee = parseFloat(doc.consultation_fee || 0).toFixed(2);

                  return (
                    <tr key={doc.doctor_id} className="hover:bg-slate-50/50 dark:hover:bg-darkBg-deep/30 transition-colors text-slate-750 dark:text-slate-350">
                      <td className="py-4 px-6 font-semibold">Dr. {name}</td>
                      <td className="py-4 px-6 text-slate-650 dark:text-slate-400">{spec}</td>
                      <td className="py-4 px-6">
                        <p className="text-xs font-semibold">{doc.qualification || 'MBBS'}</p>
                        <p className="text-xxs text-slate-400 font-medium">{doc.experience || 0} years experience</p>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">${fee}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 text-xxs font-bold rounded-full capitalize ${getStatusBadge(doc.verification_status)}`}>
                          {doc.verification_status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right flex justify-end space-x-2 items-center">
                        <button
                          onClick={() => handleVerify(doc.doctor_id, 'rejected')}
                          disabled={doc.verification_status === 'rejected'}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 disabled:pointer-events-none text-rose-600 rounded-lg transition-colors"
                          aria-label="Reject Doctor"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleVerify(doc.doctor_id, 'approved')}
                          disabled={doc.verification_status === 'approved'}
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none text-white rounded-lg transition-colors"
                          aria-label="Approve Doctor"
                        >
                          <Check className="h-4 w-4" />
                        </button>
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
  );
};

export default AdminDoctors;
