interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`gradient-card rounded-xl shadow-lg shadow-perfume-accent/5 hover:shadow-xl hover:shadow-perfume-accent/15 transition-all duration-300 cursor-pointer ${className}`}
    >
      {children}
    </div>
  );
}
