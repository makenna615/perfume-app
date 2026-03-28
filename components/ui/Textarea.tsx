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
        <label className="block text-sm font-medium text-perfume-accent mb-2">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors resize-none bg-perfume-surface placeholder-pale-purple/40 text-white ${
          error
            ? "border-red-500/50 focus:ring-red-500/20 focus:border-red-500"
            : "border-slate-700 focus:ring-perfume-accent/20 focus:border-perfume-accent hover:border-perfume-accent/50"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-red-400 text-sm mt-1 font-medium">{error}</p>}
      {helperText && <p className="text-pale-purple/70 text-sm mt-1">{helperText}</p>}
    </div>
  );
}
