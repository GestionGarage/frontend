interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  variant?: 'default' | 'raised';
}

export default function Card({ children, className = '', padding = true, variant = 'default' }: CardProps) {
  return (
    <div
      className={`rounded-2xl shadow-card ${padding ? 'p-6' : ''} ${className}`}
      style={{
        backgroundColor: variant === 'raised' ? 'var(--bg-raised)' : 'var(--bg-card)',
        border: '1px solid var(--border-default)',
      }}
    >
      {children}
    </div>
  );
}
