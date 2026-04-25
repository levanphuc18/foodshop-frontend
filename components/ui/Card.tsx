interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-surface-container-lowest rounded-2xl shadow-sm shadow-sky-900/5 p-6 ${className}`}>
      {children}
    </div>
  );
}
