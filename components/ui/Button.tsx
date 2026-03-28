interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
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
  ...props
}: ButtonProps) {
  const baseStyles = "font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-perfume-accent disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const variantStyles = {
    primary: "bg-gradient-to-r from-perfume-accent to-pale-purple hover:shadow-xl hover:shadow-perfume-accent/40 text-white",
    secondary: "bg-perfume-surface hover:bg-perfume-hover border border-slate-700 text-perfume-accent hover:border-perfume-accent hover:shadow-lg hover:shadow-perfume-accent/15",
    outline: "border-2 border-perfume-accent text-perfume-accent hover:bg-perfume-accent/10 hover:shadow-lg hover:shadow-perfume-accent/20",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]}`}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
}
