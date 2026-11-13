"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  // The public collection page hides links into the private studio.
  const isPublic = usePathname() === "/collection";
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 text-sm text-ink-soft sm:px-8 md:grid-cols-[2fr_1fr_1fr]">
        <div className="max-w-sm">
          <p className="font-display text-2xl text-ink">Memories into Perfumes</p>
          <p className="mt-3 leading-relaxed">
            A small studio for people who love fragrance — and want the facts behind it. AI answers can be
            wrong; always check note lists and IFRA guidance before mixing.
          </p>
        </div>
        <div hidden={isPublic}>
          <p className="eyebrow mb-3">Studio</p>
          <ul className="space-y-2">
            <li><Link className="link" href="/discover">Discover perfumes</Link></li>
            <li><Link className="link" href="/builder">Compose a formula</Link></li>
            <li><Link className="link" href="/ingredients">Materials library</Link></li>
            <li><Link className="link" href="/shelf">Your shelf</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">Further reading</p>
          <ul className="space-y-2">
            <li><a className="link" href="https://ifrafragrance.org/standards" target="_blank" rel="noreferrer">IFRA Standards</a></li>
            <li><a className="link" href="https://www.fragrantica.com" target="_blank" rel="noreferrer">Fragrantica</a></li>
            <li><a className="link" href="http://www.thegoodscentscompany.com" target="_blank" rel="noreferrer">The Good Scents Company</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
