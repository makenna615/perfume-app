interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
}

export default function Textarea({ label, helperText, className = "", id, ...props }: TextareaProps) {
  const inputId = id ?? (label ? `textarea-${label.replace(/\W+/g, "-").toLowerCase()}` : undefined);
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="eyebrow mb-2 block">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`w-full resize-none rounded-sm border border-line-strong bg-card px-4 py-3 font-display text-xl leading-snug text-ink outline-none transition-colors focus:border-ink focus-visible:outline-none ${className}`}
        {...props}
      />
      {helperText && <p className="mt-2 text-xs text-ink-faint">{helperText}</p>}
    </div>
  );
}
