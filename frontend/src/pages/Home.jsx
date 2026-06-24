import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Calendar, Video, ShieldCheck, ArrowRight, Activity, Users, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative pt-12 md:pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-primary-500/10 text-primary-650 dark:text-primary-400 border border-primary-500/20 inline-flex items-center space-x-1">
              <Activity className="h-3 w-3 animate-pulse" />
              <span>Modern Healthcare Solutions</span>
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white leading-tight tracking-tight">
              Instant Consultations with <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">Verified Medical Experts</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base max-w-lg leading-relaxed">
              Book appointments, connect via HD video call, message your doctor directly, and manage all your reports securely.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/doctors"
                className="px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-sm shadow-md hover-scale flex items-center space-x-2 transition-colors"
              >
                <span>Find a Doctor</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/register"
                className="px-6 py-3.5 bg-white dark:bg-darkBg-light border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm hover-scale"
              >
                Create Free Account
              </Link>
            </div>
          </motion.div>

          {/* Hero Media Asset */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex justify-center"
          >
            {/* Visual background gradient glow */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gradient-to-tr from-primary-400 to-secondary-500 opacity-20 filter blur-3xl -z-10"></div>
            
            {/* Glass Box graphic overlay simulating doctor schedule dashboard */}
            <div className="glass-panel w-full max-w-md bg-white/70 dark:bg-darkBg-light/70 p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60">
                <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">Active Consultations</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
              <div className="space-y-4 mt-6">
                <div className="flex items-center space-x-4 p-3 bg-slate-50 dark:bg-darkBg-deep/50 rounded-2xl border border-slate-150/40 dark:border-slate-800/40">
                  <div className="h-10 w-10 bg-primary-500 rounded-xl flex items-center justify-center font-bold text-white">S</div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300">Dr. Sarah Jenkins</h4>
                    <p className="text-xxs text-primary-500 font-semibold">Cardiologist - Special consultation</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-slate-50 dark:bg-darkBg-deep/50 rounded-2xl border border-slate-150/40 dark:border-slate-800/40">
                  <div className="h-10 w-10 bg-secondary-500 rounded-xl flex items-center justify-center font-bold text-white">J</div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300">Dr. James Carter</h4>
                    <p className="text-xxs text-secondary-500 font-semibold">Neurologist - Scheduled at 4:30 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Features Grid */}
      <section className="bg-slate-100/50 dark:bg-darkBg-light/20 py-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-slate-800 dark:text-white">Why Choose TeleHealth Pro?</h2>
            <p className="text-slate-400 text-sm mt-3">We provide all-in-one clinics capability directly inside your browser.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="glass-panel bg-white/60 dark:bg-darkBg-light/60 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 space-y-4">
              <div className="p-3 bg-primary-500/10 dark:bg-primary-400/10 rounded-2xl w-fit">
                <Stethoscope className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="font-bold text-lg text-slate-850 dark:text-slate-200">Verified Doctors</h3>
              <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed">Search through hundreds of verified specialists matching your specific symptoms.</p>
            </div>
            {/* Feature 2 */}
            <div className="glass-panel bg-white/60 dark:bg-darkBg-light/60 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 space-y-4">
              <div className="p-3 bg-secondary-500/10 dark:bg-secondary-400/10 rounded-2xl w-fit">
                <Calendar className="h-6 w-6 text-secondary-650 dark:text-secondary-400" />
              </div>
              <h3 className="font-bold text-lg text-slate-850 dark:text-slate-200">Instant Booking</h3>
              <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed">Schedule dates, confirm slots via Stripe billing, and log events automatically.</p>
            </div>
            {/* Feature 3 */}
            <div className="glass-panel bg-white/60 dark:bg-darkBg-light/60 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 space-y-4">
              <div className="p-3 bg-primary-500/10 dark:bg-primary-400/10 rounded-2xl w-fit">
                <Video className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="font-bold text-lg text-slate-850 dark:text-slate-200">Video Consultations</h3>
              <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed">Join WebRTC powered secure calls with your consulting doctor in a click.</p>
            </div>
            {/* Feature 4 */}
            <div className="glass-panel bg-white/60 dark:bg-darkBg-light/60 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 space-y-4">
              <div className="p-3 bg-secondary-500/10 dark:bg-secondary-400/10 rounded-2xl w-fit">
                <ShieldCheck className="h-6 w-6 text-secondary-650 dark:text-secondary-400" />
              </div>
              <h3 className="font-bold text-lg text-slate-850 dark:text-slate-200">Secure Storage</h3>
              <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed">All prescriptions, payments history, and PDFs are protected under secure role authorizations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Platform Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel bg-gradient-to-r from-primary-500 to-primary-650 p-8 sm:p-12 rounded-3xl shadow-xl text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/20">
            <div className="pt-6 md:pt-0">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary-200" />
              <h4 className="text-3xl font-extrabold">10,000+</h4>
              <p className="text-xs text-primary-100 mt-1 uppercase font-bold tracking-wider">Active Patients</p>
            </div>
            <div className="pt-6 md:pt-0">
              <Star className="h-8 w-8 mx-auto mb-2 text-primary-200 animate-spin-slow" />
              <h4 className="text-3xl font-extrabold">4.9/5.0</h4>
              <p className="text-xs text-primary-100 mt-1 uppercase font-bold tracking-wider">Consultation Review</p>
            </div>
            <div className="pt-6 md:pt-0">
              <ShieldCheck className="h-8 w-8 mx-auto mb-2 text-primary-200" />
              <h4 className="text-3xl font-extrabold">100%</h4>
              <p className="text-xs text-primary-100 mt-1 uppercase font-bold tracking-wider">Secure Encryptions</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
