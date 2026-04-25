import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-bold rounded-full transition-all active:scale-95';
  const variants = {
    primary: 'bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20',
    secondary: 'bg-secondary text-white hover:opacity-90',
    outline: 'border border-outline-variant hover:bg-surface-container',
    ghost: 'hover:bg-surface-container-high',
  };
  const sizes = { sm: 'px-4 py-2 text-sm', md: 'px-8 py-3', lg: 'px-12 py-5 text-lg' };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
