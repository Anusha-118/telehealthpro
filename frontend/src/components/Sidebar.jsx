import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  FileSignature,
  CreditCard,
  Settings,
  User,
  Users,
  TrendingUp,
  ShieldCheck,
  Activity
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return null;

  const role = user.role;

  const links = {
    patient: [
      { path: '/patient', label: 'Overview', icon: LayoutDashboard },
      { path: '/patient/appointments', label: 'Appointments', icon: Calendar },
      { path: '/patient/reports', label: 'Medical Reports', icon: FileText },
      { path: '/patient/prescriptions', label: 'Prescriptions', icon: FileSignature },
      { path: '/patient/payments', label: 'Billing & Payments', icon: CreditCard },
      { path: '/patient/settings', label: 'Settings', icon: Settings }
    ],
    doctor: [
      { path: '/doctor', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/doctor/schedule', label: 'My Availability', icon: Calendar },
      { path: '/doctor/appointments', label: 'Appointments', icon: Activity },
      { path: '/doctor/patients', label: 'My Patients', icon: Users },
      { path: '/doctor/earnings', label: 'Earnings Dashboard', icon: TrendingUp },
      { path: '/doctor/profile', label: 'Professional Profile', icon: User }
    ],
    admin: [
      { path: '/admin', label: 'Overview', icon: LayoutDashboard },
      { path: '/admin/doctors', label: 'Manage Doctors', icon: Users },
      { path: '/admin/patients', label: 'Manage Patients', icon: User },
      { path: '/admin/payments', label: 'Payment Monitors', icon: CreditCard },
      { path: '/admin/reports', label: 'System Reports', icon: FileText }
    ]
  };

  const activeLinks = links[role] || [];

  return (
    <aside className="w-64 glass-panel bg-white/70 dark:bg-darkBg-light/70 h-screen sticky top-16 left-0 border-r border-slate-200/50 dark:border-slate-800/50 hidden md:block select-none">
      <div className="flex flex-col h-full justify-between py-6 px-4">
        {/* User Card */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-2xl border border-slate-200/30 dark:border-slate-700/30">
            <div className="h-10 w-10 rounded-xl bg-primary-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">{user.name}</p>
              <div className="flex items-center text-xxs text-slate-500 dark:text-slate-400 capitalize font-medium">
                {role === 'admin' ? (
                  <ShieldCheck className="h-3 w-3 text-secondary-500 mr-1" />
                ) : (
                  <Activity className="h-3 w-3 text-primary-500 mr-1" />
                )}
                <span>{role} Account</span>
              </div>
            </div>
          </div>

          {/* Links List */}
          <nav className="space-y-1">
            {activeLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Info footer */}
        <div className="text-center text-xxs text-slate-400 dark:text-slate-500 font-medium">
          TeleHealth Pro v1.0.0
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
