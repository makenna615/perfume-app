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
        <label className="block text-sm font-semibold text-pale-blue mb-3 tracking-wide">
          {label}
        </label>
      )}
      <input
        className={`w-full px-5 py-3.5 rounded-2xl bg-perfume-surface/40 backdrop-blur border font-inter focus:ring-2 focus:outline-none transition-all duration-200 placeholder-pale-purple/30 text-pale-blue/90 shadow-premium cursor-text hover:border-perfume-accent/60 ${
          error
            ? "border-red-500/40 focus:border-red-500 focus:ring-red-500/20"
            : "border-slate-700/40 focus:border-perfume-accent focus:ring-perfume-accent/20 hover:border-perfume-accent/40"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-red-400 text-sm mt-2 font-medium">{error}</p>}
      {helperText && <p className="text-slate-400 text-sm mt-2">{helperText}</p>}
    </div>
  );
}
