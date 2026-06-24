import React from 'react';
import { Shield, Users, Heart, Award } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 min-h-screen">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white">Our Mission is to Modernize Care</h1>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
          TeleHealth Pro was founded to remove barriers between patients and high-quality clinical expertise. By incorporating modern video consultations, messaging, and records management, we help make healthcare accessible, immediate, and secure.
        </p>
      </div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 space-y-3">
          <Heart className="h-6 w-6 text-primary-500" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">Patient Centered</h3>
          <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed">Everything we design is centered around providing a comfortable, clear consultation workflow.</p>
        </div>
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 space-y-3">
          <Shield className="h-6 w-6 text-secondary-500" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">HIPAA Secure</h3>
          <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed">Security is built into our core. All calls, chats, and records uploads are encrypted.</p>
        </div>
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 space-y-3">
          <Users className="h-6 w-6 text-primary-500" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">Expert Staff</h3>
          <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed">Every doctor registers with verification checks, ensuring qualifications are verified by admins.</p>
        </div>
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 space-y-3">
          <Award className="h-6 w-6 text-secondary-500" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">Quality Care</h3>
          <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed">From prescriptions downloads to invoices billing, enjoy consistent operational standards.</p>
        </div>
      </div>
    </div>
  );
};

export default About;
