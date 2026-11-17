"use client";

import { useSyncExternalStore } from "react";
import { THEME_KEY } from "@/lib/theme";

const SunIcon = ({ className }: { className: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" strokeLinecap="round" />
  </svg>
);

const MoonIcon = ({ className }: { className: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" strokeLinejoin="round" />
  </svg>
);

/** Watches the data-theme attribute on <html> (set by the inline script and by this switch). */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
const isDark = () => document.documentElement.getAttribute("data-theme") === "dark";

/**
 * iPhone-style switch: sun on the left, moon on the right, and a knob that slides to the
 * active side carrying its icon. The look is driven by CSS (`dark:`), so it is correct from
 * the first paint; only aria-checked comes from React state.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  const toggle = () => {
    const next = isDark() ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Storage blocked (private mode): the choice still applies for this visit.
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      title="Toggle dark mode"
      onClick={toggle}
      className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border border-line bg-paper-deep transition-colors duration-300 hover:border-line-strong dark:border-resin/40 dark:bg-resin-wash ${className}`}
    >
      {/* track icons: the inactive side stays visible, faintly */}
      <SunIcon className="absolute left-2 h-3.5 w-3.5 text-citrus opacity-70 dark:text-resin" />
      <MoonIcon className="absolute right-2 h-3.5 w-3.5 text-ink-faint" />

      {/* knob */}
      <span
        aria-hidden
        className="absolute left-1 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-card shadow-[0_1px_3px_rgba(0,0,0,0.25)] dark:bg-ink transition-transform duration-300 ease-[cubic-bezier(0.3,1.3,0.5,1)] dark:translate-x-6 motion-reduce:transition-none"
      >
        <SunIcon className="h-3.5 w-3.5 text-resin dark:hidden" />
        <MoonIcon className="hidden h-3.5 w-3.5 text-resin-wash dark:block" />
      </span>
    </button>
  );
}
