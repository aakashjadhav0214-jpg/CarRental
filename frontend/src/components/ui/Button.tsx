import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', isLoading, className = '', ...props }) => {
  const baseStyles = 'rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center';
  
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-lg shadow-indigo-600/20',
    secondary: 'bg-slate-800 text-slate-200 hover:bg-slate-700 focus:ring-slate-500 border border-slate-700',
    danger: 'bg-red-600/20 text-red-400 hover:bg-red-600/30 focus:ring-red-500 border border-red-500/20',
    outline: 'border border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10 focus:ring-indigo-500'
  };
  
  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? <span className="mr-2 animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></span> : null}
      {children}
    </button>
  );
};
