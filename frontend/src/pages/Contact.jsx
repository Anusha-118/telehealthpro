import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message! Our customer care team will get back to you shortly.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 min-h-screen">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white">Get in Touch</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Have any questions about booking consultations or setting up your doctor profile? Message us directly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="glass-panel p-8 rounded-3xl bg-white/50 dark:bg-darkBg-light/50 border border-slate-200/50 dark:border-slate-800/50 space-y-6">
            <h3 className="font-extrabold text-xl text-slate-800 dark:text-white">Support & Emergency Details</h3>
            <p className="text-slate-450 dark:text-slate-400 text-xs leading-relaxed">For clinical emergencies, please call your local emergency service immediately. For general portal inquiries, billing checks, or account issues, contact our support line.</p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="h-5 w-5 text-primary-500" />
                <span className="text-slate-700 dark:text-slate-350">+1 (800) 555-0199</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="h-5 w-5 text-primary-500" />
                <span className="text-slate-700 dark:text-slate-350">care@telehealthpro.com</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <MapPin className="h-5 w-5 text-primary-500" />
                <span className="text-slate-700 dark:text-slate-350">Medical Plaza Suite 400, San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="glass-panel p-8 rounded-3xl bg-white/70 dark:bg-darkBg-light/70 border border-slate-200/50 dark:border-slate-800/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Your Name</label>
              <input required type="text" className="block w-full px-4 py-3 bg-slate-50 dark:bg-darkBg-deep text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <input required type="email" className="block w-full px-4 py-3 bg-slate-50 dark:bg-darkBg-deep text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Message</label>
              <textarea required rows={4} className="block w-full px-4 py-3 bg-slate-50 dark:bg-darkBg-deep text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" placeholder="Write your message here..."></textarea>
            </div>
            <button type="submit" className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-sm shadow-md hover-scale flex justify-center items-center space-x-1.5 transition-colors">
              <Send className="h-4.5 w-4.5" />
              <span>Send Message</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
