import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, clearError } from '../store/authSlice';
import api from '../utils/api';
import { User, ShieldAlert, CheckCircle, AlertCircle } from 'lucide-react';

const PatientSettings = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  
  const [success, setSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    dispatch(clearError());
    
    // Load patient profile details
    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        const res = await api.get('/patients/me');
        if (res.data.success) {
          const patientData = res.data.data;
          setValue('name', patientData.User?.name || '');
          setValue('age', patientData.age || '');
          setValue('gender', patientData.gender || '');
          setValue('blood_group', patientData.blood_group || '');
          setValue('address', patientData.address || '');
        }
      } catch (err) {
        console.error('Error fetching patient profile:', err);
      } finally {
        setProfileLoading(false);
      }
    };
    loadProfile();
  }, [dispatch, setValue]);

  const onSubmit = async (data) => {
    setSuccess('');
    // Dispatch Redux thunk to update both state and local profiles
    const result = await dispatch(updateProfile({ role: 'patient', data }));
    if (updateProfile.fulfilled.match(result)) {
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-10 min-h-screen">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Profile Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs">Manage personal bio particulars and contact details.</p>
      </div>

      {profileLoading ? (
        <div className="h-64 rounded-3xl skeleton"></div>
      ) : (
        <div className="glass-panel bg-white/70 dark:bg-darkBg-light/70 border border-slate-200/50 dark:border-slate-800/50 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
          
          {/* Alerts */}
          {error && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-650 dark:text-rose-400 text-xs font-semibold">
              <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-400 text-xs font-semibold">
              <CheckCircle className="h-4.5 w-4.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="block w-full px-4 py-3 bg-slate-50 dark:bg-darkBg-deep text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
              {errors.name && <p className="text-xs text-rose-500 font-semibold mt-1"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.name.message}</p>}
            </div>

            {/* Age and Gender grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Age</label>
                <input
                  type="number"
                  {...register('age', { min: { value: 0, message: 'Invalid age' } })}
                  className="block w-full px-4 py-3 bg-slate-50 dark:bg-darkBg-deep text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="25"
                />
                {errors.age && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.age.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Gender</label>
                <select
                  {...register('gender')}
                  className="block w-full px-4 py-3 bg-slate-50 dark:bg-darkBg-deep text-slate-850 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm appearance-none"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Blood group */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Blood Group</label>
              <select
                {...register('blood_group')}
                className="block w-full px-4 py-3 bg-slate-50 dark:bg-darkBg-deep text-slate-850 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm appearance-none"
              >
                <option value="">Select Blood Group</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Home Address</label>
              <textarea
                rows={3}
                {...register('address')}
                className="block w-full px-4 py-3 bg-slate-50 dark:bg-darkBg-deep text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="123 Care Street, Medical District"
              ></textarea>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary-650 hover:bg-primary-700 text-white rounded-2xl text-sm font-bold shadow-md hover-scale flex justify-center items-center"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Save Profile Updates</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PatientSettings;
