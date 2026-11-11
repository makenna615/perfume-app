interface EmptyStateProps {
  title: string;
  description: React.ReactNode;
  children?: React.ReactNode;
}

export default function EmptyState({ title, description, children }: EmptyStateProps) {
  return (
    <div className="py-14 text-center">
      <p className="font-display text-3xl italic text-ink-soft">{title}</p>
      <div className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-faint">{description}</div>
      {children && <div className="mt-6 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}
