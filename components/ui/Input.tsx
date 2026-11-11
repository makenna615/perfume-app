interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
}

export default function Input({ label, helperText, className = "", id, ...props }: InputProps) {
  const inputId = id ?? (label ? `input-${label.replace(/\W+/g, "-").toLowerCase()}` : undefined);
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="eyebrow mb-2 block">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`h-12 w-full border-0 border-b border-line-strong bg-transparent px-0 font-display text-2xl text-ink outline-none transition-colors focus:border-ink focus-visible:outline-none ${className}`}
        {...props}
      />
      {helperText && <p className="mt-2 text-xs text-ink-faint">{helperText}</p>}
    </div>
  );
}
