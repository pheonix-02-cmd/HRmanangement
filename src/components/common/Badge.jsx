import React from 'react';

const variantClasses = {
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
  info: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',
  neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export const Badge = ({ children, variant = 'neutral', size = 'sm' }) => {
  const sizeClass = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';
  const colorClass = variantClasses[variant] || variantClasses.neutral;

  return (
    <span className={`inline-flex items-center font-medium rounded-md ${sizeClass} ${colorClass}`}>
      {children}
    </span>
  );
};
