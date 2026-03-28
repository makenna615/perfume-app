interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input({
  label,
  error,
  helperText,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-perfume-accent mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 rounded-lg bg-perfume-surface border focus:ring-2 focus:outline-none transition-all duration-300 placeholder-pale-purple/40 text-white ${
          error
            ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
            : "border-slate-700 focus:border-perfume-accent focus:ring-perfume-accent/20 hover:border-perfume-accent/50"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-red-400 text-sm mt-1.5 font-medium">{error}</p>}
      {helperText && <p className="text-pale-purple/70 text-sm mt-1.5">{helperText}</p>}
    </div>
  );
}
