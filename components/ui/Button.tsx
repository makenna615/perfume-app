interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "luxury";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "font-semibold rounded-2xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-perfume-accent disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap will-change-transform cursor-pointer inline-flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0";

  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg tracking-wide",
  };

  const variantStyles = {
    primary:
      "border-transparent bg-gradient-to-r from-perfume-accent via-pale-purple to-pale-blue shadow-premium text-white tracking-wide hover:shadow-luxury hover:brightness-110 active:brightness-95",
    secondary:
      "border-slate-500/70 bg-gradient-to-r from-perfume-surface via-perfume-accent/25 to-pale-blue/25 text-pale-blue hover:border-perfume-accent/80 hover:shadow-lg hover:shadow-perfume-accent/25 hover:brightness-110 active:opacity-90",
    outline:
      "border-perfume-accent/80 bg-gradient-to-r from-perfume-accent/25 via-pale-purple/25 to-pale-blue/20 text-pale-blue hover:from-perfume-accent/35 hover:to-pale-blue/30 hover:shadow-lg hover:shadow-perfume-accent/30 active:opacity-90",
    luxury:
      "border-transparent bg-gradient-to-r from-pale-purple via-perfume-accent to-pale-blue shadow-premium text-white hover:shadow-luxury hover:brightness-110 active:brightness-95",
  };

  const finalClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  return (
    <button
      disabled={disabled || isLoading}
      className={finalClassName}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
}
