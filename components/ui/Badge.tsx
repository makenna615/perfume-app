interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning";
  size?: "sm" | "md";
}

export default function Badge({ children, variant = "primary", size = "md" }: BadgeProps) {
  const baseStyles = "rounded-full font-semibold inline-block";
  
  const sizeStyles = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  };

  const variantStyles = {
    primary: "bg-perfume-accent/15 text-perfume-accent border border-perfume-accent/40",
    secondary: "bg-pale-blue/15 text-pale-blue border border-pale-blue/40",
    success: "bg-pale-green/15 text-pale-green border border-pale-green/40",
    warning: "bg-amber-500/15 text-amber-300 border border-amber-500/40",
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]}`}>
      {children}
    </span>
  );
}
