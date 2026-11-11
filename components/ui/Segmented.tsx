"use client";

interface Option<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

/** Tab-like single choice rendered as a row of underlined labels. */
export default function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-x-6 gap-y-2 border-b border-line">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`-mb-px cursor-pointer border-b-2 pb-3 text-left transition-colors ${
              active ? "border-ink text-ink" : "border-transparent text-ink-faint hover:text-ink-soft"
            }`}
          >
            <span className="block text-sm font-medium">{option.label}</span>
            {option.hint && <span className="mt-0.5 block text-xs text-ink-faint">{option.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}
