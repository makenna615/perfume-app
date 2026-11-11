interface PageHeaderProps {
  numeral: string;
  eyebrow: string;
  title: React.ReactNode;
  intro: React.ReactNode;
}

export default function PageHeader({ numeral, eyebrow, title, intro }: PageHeaderProps) {
  return (
    <header className="grid gap-6 border-b border-line pb-10 md:grid-cols-[1fr_1.1fr] md:items-end md:gap-12">
      <div>
        <p className="eyebrow mb-4">
          <span className="mr-2 font-display text-sm normal-case italic tracking-normal text-resin">
            {numeral}.
          </span>
          {eyebrow}
        </p>
        <h1 className="text-5xl sm:text-6xl">{title}</h1>
      </div>
      <p className="max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">{intro}</p>
    </header>
  );
}
