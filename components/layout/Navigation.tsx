"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/discover", label: "🔍 Discover" },
    { href: "/builder", label: "🧪 Builder" },
    { href: "/ingredients", label: "🧬 Ingredients" },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-perfume-dark/80 backdrop-blur-md border-b border-slate-700/50 shadow-lg shadow-perfume-accent/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
            <span className="text-3xl group-hover:scale-110 transition-transform duration-300">🧴</span>
            <span className="font-bold text-xl bg-gradient-to-r from-perfume-accent to-pale-blue bg-clip-text text-transparent">Scent Lab</span>
          </Link>

          <div className="flex gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  pathname === link.href
                    ? "bg-perfume-accent text-white shadow-lg shadow-perfume-accent/50"
                    : "text-perfume-accent/70 hover:text-perfume-accent hover:bg-perfume-surface"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
