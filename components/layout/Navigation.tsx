"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import PerfumeLogoIcon from "@/components/ui/PerfumeLogoIcon";

const links = [
  { href: "/discover", label: "Discover", numeral: "I" },
  { href: "/builder", label: "Compose", numeral: "II" },
  { href: "/ingredients", label: "Materials", numeral: "III" },
  { href: "/shelf", label: "Shelf", numeral: "IV" },
];

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname === "/login") {
    return null;
  }

  // Public collection page: visitors get the wordmark only — no links into the private app.
  if (pathname === "/collection") {
    return (
      <header className="border-b border-line bg-paper/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5 sm:px-8">
          <PerfumeLogoIcon className="h-8 w-8 text-ink" />
          <span className="font-display text-xl leading-none tracking-tight">
            Memories <span className="italic text-ink-soft">into</span> Perfumes
          </span>
        </div>
      </header>
    );
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
          <PerfumeLogoIcon className="h-8 w-8 text-ink transition-colors group-hover:text-resin" />
          <span className="font-display text-xl leading-none tracking-tight">
            Memories <span className="italic text-ink-soft">into</span> Perfumes
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-baseline gap-1.5 py-1 text-sm transition-colors ${
                  active ? "text-ink" : "text-ink-soft hover:text-ink"
                }`}
              >
                <span className="font-display text-xs italic text-ink-faint">{link.numeral}</span>
                {link.label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-px bg-resin transition-all ${
                    active ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="cursor-pointer text-sm text-ink-faint transition-colors hover:text-ink"
          >
            Log out
          </button>
        </nav>

        <button
          className="flex h-10 w-10 cursor-pointer flex-col items-center justify-center gap-1.5 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <span className={`h-px w-5 bg-ink transition-transform ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
          <span className={`h-px w-5 bg-ink transition-transform ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-line bg-paper md:hidden" aria-label="Main">
          <ul className="mx-auto max-w-6xl px-5 py-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline gap-3 border-b border-line py-4 font-display text-2xl"
                >
                  <span className="w-6 text-sm italic text-ink-faint">{link.numeral}</span>
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <button onClick={handleLogout} className="cursor-pointer py-4 text-sm text-ink-faint">
                Log out
              </button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
