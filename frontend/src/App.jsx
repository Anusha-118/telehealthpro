import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ChatWindow from './components/ChatWindow';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import DoctorsListing from './pages/DoctorsListing';
import Login from './pages/Login';
import Register from './pages/Register';

// Patient Dashboard
import PatientOverview from './pages/PatientOverview';
import PatientAppointments from './pages/PatientAppointments';
import PatientReports from './pages/PatientReports';
import PatientPrescriptions from './pages/PatientPrescriptions';
import PatientPayments from './pages/PatientPayments';
import PatientSettings from './pages/PatientSettings';

// Doctor Dashboard
import DoctorOverview from './pages/DoctorOverview';
import DoctorSchedule from './pages/DoctorSchedule';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorPatients from './pages/DoctorPatients';
import DoctorEarnings from './pages/DoctorEarnings';
import DoctorProfile from './pages/DoctorProfile';

// Admin Dashboard
import AdminOverview from './pages/AdminOverview';
import AdminDoctors from './pages/AdminDoctors';
import AdminPatients from './pages/AdminPatients';
import AdminPayments from './pages/AdminPayments';
import AdminReports from './pages/AdminReports';

// Video Room
import VideoRoom from './pages/VideoRoom';

// 1. Layout wrappers
const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1 w-full bg-slate-50/50 dark:bg-darkBg-deep/20 transition-colors">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const DashboardLayout = () => (
  <div className="flex flex-col h-screen overflow-hidden">
    <Navbar />
    <div className="flex flex-1 overflow-hidden relative">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto bg-slate-50/40 dark:bg-darkBg-deep/10 transition-colors">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  </div>
);

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/doctors" element={<DoctorsListing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Standalone Video Consultations (Guarded) */}
        <Route element={<ProtectedRoute allowedRoles={['patient', 'doctor']} />}>
          <Route path="/video/:appointmentId" element={<VideoRoom />} />
        </Route>

        {/* Patient Dashboard (Guarded) */}
        <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/patient" element={<PatientOverview />} />
            <Route path="/patient/appointments" element={<PatientAppointments />} />
            <Route path="/patient/reports" element={<PatientReports />} />
            <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
            <Route path="/patient/payments" element={<PatientPayments />} />
            <Route path="/patient/settings" element={<PatientSettings />} />
          </Route>
        </Route>

        {/* Doctor Dashboard (Guarded) */}
        <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/doctor" element={<DoctorOverview />} />
            <Route path="/doctor/schedule" element={<DoctorSchedule />} />
            <Route path="/doctor/appointments" element={<DoctorAppointments />} />
            <Route path="/doctor/patients" element={<DoctorPatients />} />
            <Route path="/doctor/earnings" element={<DoctorEarnings />} />
            <Route path="/doctor/profile" element={<DoctorProfile />} />
          </Route>
        </Route>

        {/* Admin Dashboard (Guarded) */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<AdminOverview />} />
            <Route path="/admin/doctors" element={<AdminDoctors />} />
            <Route path="/admin/patients" element={<AdminPatients />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/reports" element={<AdminReports />} />
          </Route>
        </Route>
      </Routes>

      {/* Global Consultations Chat overlays */}
      <ChatWindow />
    </Router>
  );
};

export default App;
