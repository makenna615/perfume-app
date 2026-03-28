interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning";
  size?: "sm" | "md";
}

export default function Badge({ children, variant = "primary", size = "md" }: BadgeProps) {
  const baseStyles = "rounded-full font-semibold inline-block backdrop-blur-sm transition-all duration-300 font-inter tracking-wide";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  };

  const variantStyles = {
    primary: "bg-perfume-accent/20 text-perfume-accent border border-perfume-accent/50 shadow-premium hover:shadow-lg hover:bg-perfume-accent/30",
    secondary: "bg-pale-blue/20 text-pale-blue border border-pale-blue/50 shadow-premium hover:shadow-lg hover:bg-pale-blue/30",
    success: "bg-pale-green/20 text-pale-green border border-pale-green/50 shadow-premium hover:shadow-lg hover:bg-pale-green/30",
    warning: "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-premium hover:shadow-lg hover:bg-amber-500/30",
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]}`}>
      {children}
    </span>
  );
}
