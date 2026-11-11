/** Three notes evaporating in sequence: top, heart, base. */
export default function Loader({ label, detail }: { label: string; detail?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="flex items-end gap-2" aria-hidden>
        <span className="h-2.5 w-2.5 animate-evaporate rounded-full bg-citrus" />
        <span className="h-2.5 w-2.5 animate-evaporate rounded-full bg-heart [animation-delay:200ms]" />
        <span className="h-2.5 w-2.5 animate-evaporate rounded-full bg-wood [animation-delay:400ms]" />
      </div>
      <p className="font-display text-2xl italic text-ink-soft">{label}</p>
      {detail && <p className="max-w-sm text-sm text-ink-faint">{detail}</p>}
    </div>
  );
}
