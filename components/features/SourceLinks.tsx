import type { SourceLink } from "@/types";

function host(url: string): string | null {
  try {
    const u = new URL(url);
    // Defense in depth: links were validated server-side, but never render other schemes.
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** "Found via web search · fragrantica.com · parfumo.com" with safe external links. */
export default function SourceLinks({ sources, label = "Found via web search" }: { sources?: SourceLink[]; label?: string }) {
  const links = (sources ?? [])
    .map((s) => ({ ...s, host: host(s.url) }))
    .filter((s): s is SourceLink & { host: string } => Boolean(s.host))
    // One link per site keeps it readable.
    .filter((s, i, all) => all.findIndex((o) => o.host === s.host) === i)
    .slice(0, 4);

  return (
    <span className="text-xs text-ink-faint">
      {label}
      {links.map((s) => (
        <span key={s.url}>
          {" · "}
          <a className="link" href={s.url} target="_blank" rel="noopener noreferrer nofollow" title={s.title ?? s.url}>
            {s.host}
          </a>
        </span>
      ))}
      {links.length > 0 && " — check the notes there"}
    </span>
  );
}
