import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { User, Users } from 'lucide-react';

const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/patients');
        if (res.data.success) {
          setPatients(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching admin patients catalog:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  return (
    <div className="space-y-8 pb-10 min-h-screen">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Registered Patients Files</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs">Review patient bios, ages, blood group profiles, and addresses registered in the database.</p>
      </div>

      {loading ? (
        <div className="h-64 rounded-3xl skeleton"></div>
      ) : patients.length === 0 ? (
        <div className="text-center py-20 bg-white/40 dark:bg-darkBg-light/40 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 max-w-md mx-auto">
          <Users className="h-12 w-12 text-slate-350 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="font-bold text-lg text-slate-850 dark:text-slate-200">No Patients Registered</h3>
          <p className="text-slate-455 text-xs mt-1">No patient profiles are loaded in the database.</p>
        </div>
      ) : (
        <div className="glass-panel bg-white/60 dark:bg-darkBg-light/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse select-none">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-darkBg-deep/50 border-b border-slate-200/65 dark:border-slate-800/65 text-slate-500 dark:text-slate-405 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Patient Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Age</th>
                  <th className="py-4 px-6">Gender</th>
                  <th className="py-4 px-6">Blood Group</th>
                  <th className="py-4 px-6">Home Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {patients.map((pat) => {
                  const name = pat.User?.name || 'Patient';
                  const email = pat.User?.email || 'N/A';

                  return (
                    <tr key={pat.patient_id} className="hover:bg-slate-50/50 dark:hover:bg-darkBg-deep/30 transition-colors text-slate-750 dark:text-slate-350">
                      <td className="py-4 px-6 font-semibold flex items-center space-x-2">
                        <div className="h-7 w-7 rounded-lg bg-primary-500 text-white flex items-center justify-center font-bold text-xs">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <span>{name}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-500">{email}</td>
                      <td className="py-4 px-6 font-bold">{pat.age || 'N/A'}</td>
                      <td className="py-4 px-6">{pat.gender || 'Not set'}</td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 text-xxs font-extrabold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {pat.blood_group || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-450 dark:text-slate-400 truncate max-w-xs">
                        {pat.address || 'No address set'}
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

export default AdminPatients;
