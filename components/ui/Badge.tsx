interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  const variants = {
    default: 'bg-primary-fixed text-on-primary-fixed-variant',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${variants[variant]}`}>
      {children}
    </span>
  );
}
