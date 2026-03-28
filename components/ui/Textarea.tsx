interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Textarea({
  label,
  error,
  helperText,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-pale-blue mb-3 tracking-wide">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-5 py-3.5 border rounded-2xl focus:ring-2 focus:outline-none transition-all resize-none bg-perfume-surface/40 backdrop-blur placeholder-pale-purple/30 text-pale-blue/90 font-inter shadow-premium ${
          error
            ? "border-red-500/40 focus:ring-red-500/20 focus:border-red-500"
            : "border-slate-700/40 focus:ring-perfume-accent/20 focus:border-perfume-accent hover:border-perfume-accent/40"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-red-400 text-sm mt-2 font-medium">{error}</p>}
      {helperText && <p className="text-slate-400 text-sm mt-2">{helperText}</p>}
    </div>
  );
}
