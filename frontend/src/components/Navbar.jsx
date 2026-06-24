import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/authSlice';
import { Bell, Sun, Moon, LogOut, User, Menu, X, Activity } from 'lucide-react';
import api from '../utils/api';

const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Initialize Theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Fetch Notifications if Authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchNotifications = async () => {
        try {
          const res = await api.get('/notifications');
          if (res.data.success) {
            setNotifications(res.data.data);
          }
        } catch (err) {
          console.error('Error fetching notifications:', err.message);
        }
      };
      fetchNotifications();

      // Listen to socket push notification events
      // Since socket will be set up globally, we'll listen on window or a context, 
      // but to keep it self-contained, we can hook into window socket if initialized.
      const handlePush = (newNotif) => {
        setNotifications((prev) => [newNotif, ...prev]);
      };
      window.addEventListener('socket_notification', (e) => handlePush(e.detail));
      return () => window.removeEventListener('socket_notification', handlePush);
    }
  }, [isAuthenticated]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/all/read');
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getDashboardLink = () => {
    if (user?.role === 'patient') return '/patient';
    if (user?.role === 'doctor') return '/doctor';
    if (user?.role === 'admin') return '/admin';
    return '/';
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <nav className="sticky top-0 z-50 glass-panel shadow-sm bg-white/80 dark:bg-darkBg-dark/80 backdrop-blur-md transition-colors border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 font-bold text-xl tracking-tight">
            <Activity className="h-6 w-6 pulse-glow-teal rounded-full p-0.5 text-white bg-primary-500" />
            <span>TeleHealth <span className="text-secondary-500">Pro</span></span>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium">Home</Link>
            <Link to="/doctors" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium">Find Doctors</Link>
            <Link to="/services" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium">Services</Link>
            <Link to="/about" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium">About</Link>
            <Link to="/contact" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium">Contact</Link>
          </div>

          {/* Right Side Buttons */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/3 -translate-y-1/3 bg-red-500 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-lg bg-white dark:bg-darkBg-light border border-slate-200 dark:border-slate-700 py-2 text-sm z-50">
                      <div className="flex justify-between items-center px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto px-2">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-slate-400">No notifications</div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.notification_id}
                              className={`p-3 rounded-lg my-1 transition-colors ${
                                n.is_read ? 'bg-transparent' : 'bg-primary-50/50 dark:bg-primary-950/20 font-medium'
                              }`}
                            >
                              <p className="text-xs text-slate-800 dark:text-slate-200">{n.title}</p>
                              <p className="text-xxs text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Dashboard Shortcut */}
                <Link
                  to={getDashboardLink()}
                  className="hidden md:flex items-center space-x-1 text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                >
                  <User className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center space-x-1 px-4 py-2 text-sm rounded-xl font-medium text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-md hover-scale"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-slate-700 dark:text-slate-200 hover:text-primary-600 px-3 py-2 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 rounded-xl shadow-md hover-scale"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-darkBg-dark/95 py-4 px-6 space-y-3 transition-all duration-300">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 font-medium">Home</Link>
          <Link to="/doctors" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 font-medium">Find Doctors</Link>
          <Link to="/services" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 font-medium">Services</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 font-medium">About</Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 font-medium">Contact</Link>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link to={getDashboardLink()} onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 dark:text-slate-200 font-medium hover:text-primary-600">Dashboard</Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left py-2 text-red-500 font-medium hover:text-red-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 dark:text-slate-200 font-medium">Login</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-md font-medium">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
