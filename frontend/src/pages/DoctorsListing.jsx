import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import DoctorCard from '../components/DoctorCard';
import { Search, Stethoscope, Calendar, Clock, AlertCircle } from 'lucide-react';

const DoctorsListing = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const specialtiesList = [
    'General Medicine',
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Dermatology',
    'Psychiatry',
    'Orthopedics',
    'Ophthalmology'
  ];

  // Fetch Doctors List
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (specialization) params.specialization = specialization;

      const res = await api.get('/doctors', { params });
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (err) {
      console.error('Error loading doctors list:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [search, specialization]);

  const handleBookTrigger = (doctor) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user.role !== 'patient') {
      alert('Only patient accounts can book appointments.');
      return;
    }

    setSelectedDoctor(doctor);
    setBookingModalOpen(true);
    setBookingError('');
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!bookingDate || !bookingTime) {
      setBookingError('Please specify booking date and time.');
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError('');

      const res = await api.post('/appointments', {
        doctor_id: selectedDoctor.doctor_id,
        date: bookingDate,
        time: bookingTime
      });

      if (res.data.success) {
        setBookingModalOpen(false);
        // Redirect to patient appointments dashboard
        navigate('/patient/appointments');
      }
    } catch (err) {
      console.error(err);
      setBookingError(err.response?.data?.message || 'Conflict: This slot is already booked.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Find a Medical Specialist</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Search, compare, and book instant consultation sessions.</p>
      </div>

      {/* Filter bar */}
      <div className="glass-panel bg-white/70 dark:bg-darkBg-light/70 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search by Name */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-darkBg-deep text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-850 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            placeholder="Search by doctor name..."
          />
        </div>

        {/* Filter by Specialty */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Stethoscope className="h-5 w-5 text-slate-400" />
          </div>
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-darkBg-deep text-slate-850 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-850 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm appearance-none"
          >
            <option value="">All Specialties</option>
            {specialtiesList.map((spec) => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>

        {/* Quick Reset */}
        <button
          onClick={() => { setSearch(''); setSpecialization(''); }}
          className="w-full py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-sm font-semibold transition-colors hover-scale"
        >
          Reset Filters
        </button>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-3xl skeleton"></div>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-20 bg-white/40 dark:bg-darkBg-light/40 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 max-w-md mx-auto">
          <Stethoscope className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">No Doctors Found</h3>
          <p className="text-slate-400 text-xs mt-1">Try resetting the filters or modifying your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <DoctorCard
              key={doc.doctor_id}
              doctor={doc}
              onBookAppointment={handleBookTrigger}
            />
          ))}
        </div>
      )}

      {/* Booking Modal Dialog */}
      {bookingModalOpen && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel bg-white dark:bg-darkBg-light w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-750">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/60">
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Book Consultation Slot</h3>
              <button onClick={() => setBookingModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">X</button>
            </div>

            {bookingError && (
              <div className="flex items-center space-x-2 p-3 mt-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 text-xs font-semibold">
                <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmBooking} className="mt-4 space-y-4">
              <div>
                <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold">Consulting Specialist</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">Dr. {selectedDoctor.User?.name}</p>
                <p className="text-xs text-primary-500 font-semibold">{selectedDoctor.specialization}</p>
              </div>

              {/* Booking Date */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-2">
                  Select Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Calendar className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-darkBg-deep text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>

              {/* Booking Time */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-2">
                  Select Time Slot
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Clock className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    type="time"
                    required
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-darkBg-deep text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full py-3.5 bg-primary-650 hover:bg-primary-700 text-white rounded-2xl text-sm font-bold shadow-md hover-scale flex justify-center items-center"
                >
                  {bookingLoading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Confirm & Schedule</span>
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

export default DoctorsListing;
