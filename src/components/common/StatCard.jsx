import React from 'react';

export const StatCard = ({ title, value, icon: Icon }) => {
  return (
    <div className="rounded-xl p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <h3 className="text-xl font-bold mt-1 text-slate-900 dark:text-white">{value}</h3>
      </div>
      {Icon && (
        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          <Icon className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
