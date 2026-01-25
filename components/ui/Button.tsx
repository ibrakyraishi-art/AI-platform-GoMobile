import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  loading = false,
  icon,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'btn';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${
        loading || disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      disabled={loading || disabled}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
