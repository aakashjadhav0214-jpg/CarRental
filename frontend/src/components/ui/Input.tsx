import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, id, className = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
        {label}
      </label>
      <input
        id={id}
        className="px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-white font-medium transition-colors"
        {...props}
      />
    </div>
  );
};
