import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

const chapters = [
  {
    numeral: "I",
    title: "Discover",
    href: "/discover",
    body: "Look up a perfume’s published note pyramid and accords, find honest alternatives — from near-identical dupes to loose cousins — or search by the notes you love.",
    examples: [
      { label: "What smells like Santal 33?", href: "/discover?mode=similar&q=Le%20Labo%20Santal%2033" },
      { label: "Notes in Shalimar", href: "/discover?mode=details&q=Shalimar%20by%20Guerlain" },
    ],
  },
  {
    numeral: "II",
    title: "Compose",
    href: "/builder",
    body: "Describe a memory, list what’s on your shelf, or reinterpret a classic. Get a weighable formula of real materials, scaled to your bottle, with safety notes.",
    examples: [
      { label: "A rainy pine forest at dusk", href: "/builder?mode=vibe&q=A%20rainy%20pine%20forest%20at%20dusk" },
      { label: "Inspired by Terre d’Hermès", href: "/builder?mode=inspired&q=Terre%20d%27Herm%C3%A8s" },
    ],
  },
  {
    numeral: "III",
    title: "Materials",
    href: "/ingredients",
    body: "Learn the raw materials behind every note — how they smell, how long they last, how much to use, and which are restricted or phototoxic.",
    examples: [
      { label: "What is “white musk”?", href: "/ingredients?q=white%20musk" },
      { label: "Iso E Super", href: "/ingredients?q=Iso%20E%20Super" },
    ],
  },
];

const concentrations = [
  { name: "Eau de Cologne", range: "2–5%" },
  { name: "Eau de Toilette", range: "5–15%" },
  { name: "Eau de Parfum", range: "15–20%" },
  { name: "Extrait de Parfum", range: "20–30%+" },
];

function EvaporationFigure() {
  return (
    <figure className="w-full">
      <svg viewBox="0 0 400 230" className="w-full" role="img" aria-labelledby="evap-title evap-desc">
        <title id="evap-title">How a perfume evaporates</title>
        <desc id="evap-desc">
          Top notes peak in the first minutes, heart notes over the first hours, and base notes last longest.
        </desc>
        <line x1="20" y1="190" x2="390" y2="190" stroke="var(--color-line-strong)" />
        {[
          { x: 20, label: "0" },
          { x: 80, label: "30 min" },
          { x: 200, label: "4 h" },
          { x: 375, label: "8 h +" },
        ].map((tick) => (
          <g key={tick.label}>
            <line x1={tick.x} y1="190" x2={tick.x} y2="195" stroke="var(--color-line-strong)" />
            <text x={tick.x} y="210" textAnchor="middle" fontSize="10" fill="var(--color-ink-faint)" fontFamily="var(--font-mono)">
              {tick.label}
            </text>
          </g>
        ))}
        <path d="M20,190 C34,40 54,34 72,84 S110,186 150,190 Z" fill="var(--color-citrus)" fillOpacity="0.14" />
        <path d="M20,190 C34,40 54,34 72,84 S110,186 150,190" fill="none" stroke="var(--color-citrus)" strokeWidth="1.5" />
        <path d="M20,190 C60,160 80,64 122,62 S210,150 290,189 Z" fill="var(--color-heart)" fillOpacity="0.12" />
        <path d="M20,190 C60,160 80,64 122,62 S210,150 290,189" fill="none" stroke="var(--color-heart)" strokeWidth="1.5" />
        <path d="M20,190 C90,186 140,108 205,100 S330,124 390,150 L390,190 Z" fill="var(--color-wood)" fillOpacity="0.1" />
        <path d="M20,190 C90,186 140,108 205,100 S330,124 390,150" fill="none" stroke="var(--color-wood)" strokeWidth="1.5" />
        <text x="58" y="30" fontSize="15" fontStyle="italic" fill="var(--color-citrus)" fontFamily="var(--font-display)">top</text>
        <text x="112" y="52" fontSize="15" fontStyle="italic" fill="var(--color-heart)" fontFamily="var(--font-display)">heart</text>
        <text x="236" y="96" fontSize="15" fontStyle="italic" fill="var(--color-wood)" fontFamily="var(--font-display)">base</text>
      </svg>
      <figcaption className="mt-2 text-xs text-ink-faint">
        Illustrative — how strongly each layer is perceived over time on skin.
      </figcaption>
    </figure>
  );
}

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8">
      {/* Hero */}
      <section className="grid gap-12 py-16 md:grid-cols-[1.25fr_1fr] md:items-center md:py-24">
        <div className="animate-rise">
          <p className="eyebrow mb-6">A fragrance studio · Discover · Compose · Learn</p>
          <h1 className="text-6xl sm:text-7xl lg:text-8xl">
            Every memory
            <br />
            has a <em className="text-resin">scent.</em>
          </h1>
          <p className="mt-8 max-w-lg text-lg leading-relaxed text-ink-soft">
            Find perfumes that truly smell alike, read their real note pyramids, and compose your own — with materials
            you can actually buy, weigh and mix.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/discover" size="lg">
              Find a perfume
            </ButtonLink>
            <ButtonLink href="/builder" variant="secondary" size="lg">
              Compose a formula
            </ButtonLink>
          </div>
        </div>
        <div className="animate-rise [animation-delay:120ms]">
          <EvaporationFigure />
        </div>
      </section>

      {/* Chapters */}
      <section className="pb-16 md:pb-20">
        <ol className="divide-y divide-line border-y border-line">
          {chapters.map((chapter) => (
            <li key={chapter.href} className="grid gap-4 py-10 md:grid-cols-[6rem_16rem_1fr] md:gap-8">
              <span className="font-display text-5xl italic text-ink-faint">{chapter.numeral}</span>
              <Link href={chapter.href} className="group">
                <h2 className="text-5xl transition-colors group-hover:text-resin">{chapter.title}</h2>
                <span className="mt-2 inline-block text-sm text-ink-faint transition-transform group-hover:translate-x-1">
                  Open →
                </span>
              </Link>
              <div>
                <p className="max-w-xl leading-relaxed text-ink-soft">{chapter.body}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {chapter.examples.map((example) => (
                    <Link
                      key={example.href}
                      href={example.href}
                      className="rounded-full border border-line px-3 py-1 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
                    >
                      {example.label}
                    </Link>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Primer */}
      <section className="pb-8">
        <p className="eyebrow mb-3">A short primer</p>
        <h2 className="max-w-2xl text-5xl">Three things worth knowing before you mix</h2>

        <div className="mt-10 grid gap-px overflow-hidden rounded-sm border border-line bg-line md:grid-cols-3">
          <div className="bg-card p-6">
            <p className="font-display text-2xl">Notes aren’t ingredients</p>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              A note list describes how a perfume smells. “Sea notes” are usually Calone; “white musk” is a family of
              synthetic musks like Galaxolide; “amberwood” often means Ambroxan. Lily of the valley, lilac and gardenia
              have no usable natural extract at all.
            </p>
          </div>
          <div className="bg-card p-6">
            <p className="font-display text-2xl">The pyramid is about time</p>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Top notes (citrus, aldehydes) fade within about half an hour; heart notes (florals, spices) carry the first
              few hours; base notes (woods, resins, musks, vanilla) can last all day and longer on fabric.
            </p>
          </div>
          <div className="bg-card p-6">
            <p className="font-display text-2xl">Strength is a dilution</p>
            <table className="mt-3 w-full text-sm">
              <tbody>
                {concentrations.map((c) => (
                  <tr key={c.name} className="border-b border-line/70 last:border-0">
                    <td className="py-1.5 text-ink-soft">{c.name}</td>
                    <td className="tabular py-1.5 text-right">{c.range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-ink-faint">Share of perfume concentrate in alcohol. Ranges vary by brand.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
