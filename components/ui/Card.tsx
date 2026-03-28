interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'luxury' | 'hover';
}

export default function Card({ children, className = "", onClick, variant = 'default' }: CardProps) {
  const baseStyles = "rounded-2xl transition-all duration-200";
  
  const isClickable = onClick ? "cursor-pointer hover:border-perfume-accent/40" : "";

  const variants = {
    default: "gradient-card shadow-premium hover:shadow-luxury",
    luxury: "card-luxury",
    hover: "gradient-card-hover",
  };

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${isClickable} ${className}`}
    >
      {children}
    </div>
  );
}
