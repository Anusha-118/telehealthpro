import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 text-white font-bold text-xl">
              <Activity className="h-6 w-6 text-primary-400" />
              <span>TeleHealth <span className="text-secondary-400">Pro</span></span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Premium doctor consultation and care management. Connecting patients with verified medical experts in real time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary-400 transition-colors">Home</Link></li>
              <li><Link to="/doctors" className="hover:text-primary-400 transition-colors">Find Doctors</Link></li>
              <li><Link to="/services" className="hover:text-primary-400 transition-colors">Specialties</Link></li>
              <li><Link to="/about" className="hover:text-primary-400 transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* User Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Portals</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-primary-400 transition-colors">Patient Login</Link></li>
              <li><Link to="/register" className="hover:text-primary-400 transition-colors">Doctor Registration</Link></li>
              <li><Link to="/admin" className="hover:text-primary-400 transition-colors">Administrator Access</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 text-sm">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact Care</h3>
            <div className="flex items-center space-x-2 text-slate-400">
              <Phone className="h-4 w-4 text-primary-400 flex-shrink-0" />
              <span>+1 (800) 555-0199</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-400">
              <Mail className="h-4 w-4 text-primary-400 flex-shrink-0" />
              <span>care@telehealthpro.com</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-400">
              <MapPin className="h-4 w-4 text-primary-400 flex-shrink-0" />
              <span>Medical Plaza, San Francisco, CA</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} TeleHealth Pro. All rights reserved. Built with security and care.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
