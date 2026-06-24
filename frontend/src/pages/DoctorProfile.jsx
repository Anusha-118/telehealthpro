import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, clearError } from '../store/authSlice';
import api from '../utils/api';
import { ShieldAlert, CheckCircle, AlertCircle } from 'lucide-react';

const DoctorProfile = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  const [success, setSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    dispatch(clearError());
    
    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        const res = await api.get('/doctors/me');
        if (res.data.success) {
          const doctorData = res.data.data;
          setValue('name', doctorData.User?.name || '');
          setValue('specialization', doctorData.specialization || '');
          setValue('qualification', doctorData.qualification || '');
          setValue('experience', doctorData.experience || '');
          setValue('consultation_fee', doctorData.consultation_fee || '');
        }
      } catch (err) {
        console.error('Error fetching doctor professional profile:', err);
      } finally {
        setProfileLoading(false);
      }
    };
    loadProfile();
  }, [dispatch, setValue]);

  const onSubmit = async (data) => {
    setSuccess('');
    const result = await dispatch(updateProfile({ role: 'doctor', data }));
    if (updateProfile.fulfilled.match(result)) {
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-10 min-h-screen">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Professional Profile Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs">Configure consultation pricing, list clinical specialties, and update your qualifications credentials.</p>
      </div>

      {profileLoading ? (
        <div className="h-64 rounded-3xl skeleton"></div>
      ) : (
        <div className="glass-panel bg-white/70 dark:bg-darkBg-light/70 border border-slate-200/50 dark:border-slate-800/50 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
          
          {/* Alerts */}
          {error && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-650 dark:text-rose-450 text-xs font-semibold">
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
            {/* Full name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-2">Display Name</label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="block w-full px-4 py-3 bg-slate-50 dark:bg-darkBg-deep text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
              {errors.name && <p className="text-xs text-rose-500 font-semibold mt-1"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.name.message}</p>}
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-455 uppercase tracking-wider mb-2">Medical Specialty</label>
              <select
                {...register('specialization', { required: 'Specialty is required' })}
                className="block w-full px-4 py-3 bg-slate-50 dark:bg-darkBg-deep text-slate-850 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm appearance-none"
              >
                <option value="">Select Specialty</option>
                {['General Medicine', 'Cardiology', 'Neurology', 'Pediatrics', 'Dermatology', 'Psychiatry', 'Orthopedics', 'Ophthalmology'].map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
              {errors.specialization && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.specialization.message}</p>}
            </div>

            {/* Qualification */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-455 uppercase tracking-wider mb-2">Academic Qualifications</label>
              <input
                type="text"
                {...register('qualification', { required: 'Qualifications credentials are required' })}
                className="block w-full px-4 py-3 bg-slate-50 dark:bg-darkBg-deep text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="MBBS, MD, FACC"
              />
              {errors.qualification && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.qualification.message}</p>}
            </div>

            {/* Experience and Fee grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-455 uppercase tracking-wider mb-2">Experience (Years)</label>
                <input
                  type="number"
                  {...register('experience', { required: 'Experience value is required', min: 0 })}
                  className="block w-full px-4 py-3 bg-slate-50 dark:bg-darkBg-deep text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="8"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-455 uppercase tracking-wider mb-2">Consultation Fee ($)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('consultation_fee', { required: 'Pricing fee is required', min: 0 })}
                  className="block w-full px-4 py-3 bg-slate-50 dark:bg-darkBg-deep text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="100.00"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-sm font-bold shadow-md hover-scale flex justify-center items-center"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Update Profile Details</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DoctorProfile;
