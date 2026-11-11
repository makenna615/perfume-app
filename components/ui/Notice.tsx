const toneStyles = {
  info: "border-line bg-paper-deep/60 text-ink-soft",
  warning: "border-citrus/40 bg-citrus-wash/70 text-[#5f4a16]",
  error: "border-alert/30 bg-alert-wash text-alert",
} as const;

export default function Notice({
  tone = "info",
  title,
  children,
}: {
  tone?: keyof typeof toneStyles;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={`rounded-sm border px-4 py-3 text-sm leading-relaxed ${toneStyles[tone]}`}
    >
      {title && <p className="mb-1 font-medium">{title}</p>}
      {children}
    </div>
  );
}
