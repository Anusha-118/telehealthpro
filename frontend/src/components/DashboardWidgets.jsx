import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatsCard = ({ title, value, icon: Icon, description, trend, trendType = 'up' }) => {
  return (
    <div className="glass-panel bg-white/60 dark:bg-darkBg-light/60 rounded-3xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">{value}</h3>
        </div>
        <div className="p-3 bg-primary-500/10 dark:bg-primary-400/10 rounded-2xl">
          <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
      </div>
      {(trend || description) && (
        <div className="mt-4 flex items-center space-x-1.5 text-xs">
          {trend && (
            <span className={`flex items-center font-bold ${
              trendType === 'up' ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {trendType === 'up' ? (
                <ArrowUpRight className="h-4 w-4 mr-0.5" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-0.5" />
              )}
              {trend}
            </span>
          )}
          {description && (
            <span className="text-slate-400 font-medium">{description}</span>
          )}
        </div>
      )}
    </div>
  );
};

export const ProgressRing = ({ percentage, size = 120, strokeWidth = 10, title, subtitle }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white/40 dark:bg-darkBg-light/40 rounded-3xl glass-panel text-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-95 w-full h-full">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="text-slate-200 dark:text-slate-700"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="text-primary-500 dark:text-primary-400 transition-all duration-1000 ease-out"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>
        {/* Inner Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-slate-800 dark:text-slate-100">{percentage}%</span>
          {subtitle && <span className="text-xxs text-slate-400">{subtitle}</span>}
        </div>
      </div>
      {title && <h5 className="font-bold text-sm text-slate-700 dark:text-slate-200 mt-4">{title}</h5>}
    </div>
  );
};
