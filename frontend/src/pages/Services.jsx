import React from 'react';
import { Heart, Brain, Baby, Activity, Shield, Sparkles } from 'lucide-react';

const Services = () => {
  const specialties = [
    { title: 'Cardiology', desc: 'Heart diagnostics, vascular treatments, and hypertension oversight.', icon: Heart },
    { title: 'Neurology', desc: 'Brain, spinal cord, and sensory neurological consultations.', icon: Brain },
    { title: 'Pediatrics', desc: 'Dedicated child health monitoring, vaccinations guidance, and care.', icon: Baby },
    { title: 'General Medicine', desc: 'Routine general checkups, symptoms diagnoses, and referrals.', icon: Activity },
    { title: 'Dermatology', desc: 'Skin conditions treatment, allergies controls, and cosmetic advice.', icon: Sparkles },
    { title: 'Mental Well-being', desc: 'Psychiatry consults, depression assessments, and anxiety therapies.', icon: Shield }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 min-h-screen">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white">Our Medical Specialties</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Connect immediately with specialized medical professionals across a wide array of domains.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {specialties.map((spec) => {
          const Icon = spec.icon;
          return (
            <div key={spec.title} className="glass-panel p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 space-y-4 hover-scale bg-white/50 dark:bg-darkBg-light/50">
              <div className="p-4 bg-primary-500/10 dark:bg-primary-400/10 rounded-2xl w-fit">
                <Icon className="h-6 w-6 text-primary-650 dark:text-primary-400" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">{spec.title}</h3>
              <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed">{spec.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Services;
