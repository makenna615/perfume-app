"use client";

import { useRef, useState } from "react";
import type { ApiResponse, PerfumeIntelligenceResponse, ShelfStatus } from "@/types";
import Button from "@/components/ui/Button";
import Notice from "@/components/ui/Notice";
import Segmented from "@/components/ui/Segmented";
import SourceLinks from "@/components/features/SourceLinks";
import { addToShelf, findPhotoAndRender } from "@/lib/hooks/useShelf";
import { LIMITS, SHELF_STATUSES, STATUS_LABEL, detailsFromLookup } from "@/lib/shelf/model";

async function lookUp(query: string): Promise<PerfumeIntelligenceResponse> {
  const response = await fetch("/api/perfume-intelligence", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ perfumeName: query }),
  });
  const payload = (await response.json().catch(() => ({}))) as ApiResponse<PerfumeIntelligenceResponse>;
  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error || "Lookup failed.");
  }
  return payload.data;
}

const field = "w-full rounded-sm border border-line bg-card px-3 py-2 text-sm";

function StatusSelect({ value, onChange }: { value: ShelfStatus; onChange: (s: ShelfStatus) => void }) {
  return (
    <select className={field} value={value} onChange={(e) => onChange(e.target.value as ShelfStatus)} aria-label="Status">
      {SHELF_STATUSES.map((s) => (
        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
      ))}
    </select>
  );
}

// ---------------------------------------------------------------------------

const CONCENTRATIONS = ["", "Eau de Cologne", "Eau de Toilette", "Eau de Parfum", "Parfum", "Extrait de Parfum", "Elixir"];

function splitList(value: string): string[] {
  return value
    .split(/[,;\n]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

/** For perfumes no source can find (new releases, private blends, small makers). */
function ManualAdd({ initialQuery, onAdded, onCancel }: { initialQuery: string; onAdded: (name: string) => void; onCancel: () => void }) {
  const byIndex = initialQuery.toLowerCase().indexOf(" by ");
  const [name, setName] = useState(byIndex > 0 ? initialQuery.slice(0, byIndex).trim() : initialQuery.trim());
  const [brand, setBrand] = useState(byIndex > 0 ? initialQuery.slice(byIndex + 4).trim() : "");
  const [concentration, setConcentration] = useState("");
  const [family, setFamily] = useState("");
  const [top, setTop] = useState("");
  const [heart, setHeart] = useState("");
  const [base, setBase] = useState("");
  const [status, setStatus] = useState<ShelfStatus>("full");
  const [size, setSize] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    const notes = { top: splitList(top), middle: splitList(heart), base: splitList(base) };
    // Only "heart" filled in → treat it as a flat (linear) note list.
    const linear = notes.middle.length > 0 && notes.top.length === 0 && notes.base.length === 0;
    try {
      const created = await addToShelf({
        name: name.trim(),
        brand: brand.trim(),
        concentration,
        status,
        sizeMl: size.trim() ? Number(size) : null,
        details: {
          perfumers: [],
          accords: [],
          fragranceFamily: family.trim() || undefined,
          notesStructure: linear ? "linear" : "pyramid",
          notes,
          source: "manual",
        },
      });
      void findPhotoAndRender(created.id); // background; the illustration shows until the photo and render are ready
      onAdded(name.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't add this perfume.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-sm border border-line bg-card p-4">
      <p className="eyebrow">Add manually</p>
      <div className="grid grid-cols-2 gap-3">
        <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Perfume name *" aria-label="Perfume name" maxLength={LIMITS.name} required />
        <input className={field} value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand" aria-label="Brand" maxLength={LIMITS.brand} />
        <select className={field} value={concentration} onChange={(e) => setConcentration(e.target.value)} aria-label="Concentration">
          {CONCENTRATIONS.map((c) => (
            <option key={c} value={c}>{c || "Concentration (optional)"}</option>
          ))}
        </select>
        <input className={field} value={family} onChange={(e) => setFamily(e.target.value)} placeholder="Scent family, e.g. Woody Amber" aria-label="Scent family" maxLength={60} />
      </div>
      <input className={field} value={top} onChange={(e) => setTop(e.target.value)} placeholder="Top notes, comma-separated" aria-label="Top notes" maxLength={600} />
      <input className={field} value={heart} onChange={(e) => setHeart(e.target.value)} placeholder="Heart notes (or the full list if there's no pyramid)" aria-label="Heart notes" maxLength={600} />
      <input className={field} value={base} onChange={(e) => setBase(e.target.value)} placeholder="Base notes" aria-label="Base notes" maxLength={600} />
      <div className="grid grid-cols-2 gap-3">
        <StatusSelect value={status} onChange={setStatus} />
        <input className={field} type="number" min={0.1} max={5000} step="0.1" value={size} onChange={(e) => setSize(e.target.value)} placeholder="Size (ml, optional)" aria-label="Bottle size in ml" />
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={!name.trim()} isLoading={busy}>{busy ? "Drawing the bottle…" : "Add to shelf"}</Button>
        <button type="button" className="link cursor-pointer text-sm" onClick={onCancel}>Back to search</button>
      </div>
    </form>
  );
}

function SingleAdd({ initialQuery, onAdded }: { initialQuery: string; onAdded: (name: string) => void }) {
  const [manual, setManual] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<PerfumeIntelligenceResponse | null>(null);
  const [status, setStatus] = useState<ShelfStatus>("full");
  const [size, setSize] = useState("");
  const [busy, setBusy] = useState<"lookup" | "add" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const search = async (q: string) => {
    if (!q.trim()) return;
    setQuery(q);
    setBusy("lookup");
    setError(null);
    setResult(null);
    try {
      setResult(await lookUp(q.trim()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed.");
    } finally {
      setBusy(null);
    }
  };

  const add = async () => {
    const p = result?.perfume;
    if (!p) return;
    setBusy("add");
    setError(null);
    try {
      const created = await addToShelf({
        name: p.name,
        brand: p.brand,
        concentration: p.concentration ?? "",
        status,
        sizeMl: size.trim() ? Number(size) : null,
        details: detailsFromLookup(p),
      });
      void findPhotoAndRender(created.id); // background; the illustration shows until the photo and render are ready
      onAdded(p.name);
      setResult(null);
      setQuery("");
      setSize("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't add this perfume.");
    } finally {
      setBusy(null);
    }
  };

  const p = result?.found ? result.perfume : null;

  if (manual) {
    return (
      <ManualAdd
        initialQuery={query}
        onCancel={() => setManual(false)}
        onAdded={(name) => {
          setManual(false);
          setResult(null);
          setQuery("");
          onAdded(name);
        }}
      />
    );
  }

  return (
    <div className="space-y-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void search(query);
        }}
        className="flex gap-2"
      >
        <input
          className={field}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Santal 33 by Le Labo"
          maxLength={LIMITS.name + LIMITS.brand}
          aria-label="Perfume name"
          autoFocus
        />
        <Button type="submit" size="md" disabled={!query.trim()} isLoading={busy === "lookup"}>Look up</Button>
      </form>
      {busy === "lookup" ? (
        <p className="-mt-2 text-xs text-ink-faint">Niche and indie perfumes are searched on the web — this can take up to 20 seconds.</p>
      ) : (
        !p && (
          <p className="-mt-2 text-xs text-ink-faint">
            Can&apos;t find it?{" "}
            <button type="button" className="link cursor-pointer" onClick={() => setManual(true)}>Add it manually</button>
          </p>
        )
      )}

      {error && <Notice tone="error">{error}</Notice>}

      {p && (
        <div className="space-y-4 rounded-sm border border-line bg-card p-4">
          <div>
            <p className="font-display text-2xl leading-tight">{p.name}</p>
            <p className="text-sm text-ink-soft">
              {[p.brand, p.concentration, p.releaseYear].filter(Boolean).join(" · ")}
            </p>
            {p.fragranceFamily && <p className="mt-1 text-sm italic text-resin">{p.fragranceFamily}</p>}
            <p className="mt-2 text-xs text-ink-faint">
              {[...p.notes.top, ...p.notes.middle, ...p.notes.base].slice(0, 8).join(", ")}
            </p>
            {p.source === "web" && (
              <p className="mt-2"><SourceLinks sources={p.sources} /></p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatusSelect value={status} onChange={setStatus} />
            <input className={field} type="number" min={0.1} max={5000} step="0.1" value={size} onChange={(e) => setSize(e.target.value)} placeholder="Size (ml, optional)" aria-label="Bottle size in ml" />
          </div>
          <Button onClick={add} isLoading={busy === "add"} className="w-full">
            {busy === "add" ? "Drawing the bottle…" : "Add to shelf"}
          </Button>
          {result?.alternatives && result.alternatives.length > 0 && (
            <p className="text-xs text-ink-faint">
              Not this one?{" "}
              {result.alternatives.map((alt, i) => (
                <span key={`${alt.name}-${alt.brand}`}>
                  {i > 0 && ", "}
                  <button className="link cursor-pointer" onClick={() => search(`${alt.name} by ${alt.brand}`)}>
                    {alt.name} by {alt.brand}
                  </button>
                </span>
              ))}
            </p>
          )}
        </div>
      )}

      {result && !result.found && (
        <Notice tone="info" title={result.ambiguous ? "Several perfumes share that name" : "We couldn't identify that perfume"}>
          {result.suggestions.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {result.suggestions.map((s) => (
                <button
                  key={`${s.name}-${s.brand}`}
                  onClick={() => search(`${s.name} by ${s.brand}`)}
                  className="cursor-pointer rounded-full border border-line bg-card px-3 py-1 text-sm hover:border-ink"
                >
                  {s.name} <span className="text-ink-faint">by {s.brand}</span>
                </button>
              ))}
            </div>
          ) : (
            "We searched our sources and the web. Check the spelling or add the brand, e.g. “Aventus by Creed”."
          )}
          <p className="mt-3">
            <button type="button" className="link cursor-pointer" onClick={() => setManual(true)}>Add it manually instead</button>
          </p>
        </Notice>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

type RowState = "queued" | "working" | "added" | "duplicate" | "not-found" | "error";
interface Row {
  query: string;
  state: RowState;
  detail?: string;
}

const ROW_LABEL: Record<RowState, string> = {
  queued: "Waiting",
  working: "Adding…",
  added: "Added",
  duplicate: "Already on shelf",
  "not-found": "Not found",
  error: "Failed",
};

function BulkAdd({ onRetry }: { onRetry: (query: string) => void }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<ShelfStatus>("full");
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);
  const cancelled = useRef(false);

  const lines = Array.from(new Set(text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)));
  const tooMany = lines.length > LIMITS.bulkLines;

  const patchRow = (index: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const start = async () => {
    const queue = lines.slice(0, LIMITS.bulkLines);
    setRows(queue.map((query) => ({ query, state: "queued" })));
    setRunning(true);
    cancelled.current = false;
    let next = 0;

    const worker = async () => {
      while (!cancelled.current && next < queue.length) {
        const index = next++;
        patchRow(index, { state: "working" });
        try {
          const result = await lookUp(queue[index]);
          if (!result.found || !result.perfume) {
            patchRow(index, {
              state: "not-found",
              detail: result.ambiguous ? "Several perfumes share this name — add it individually." : undefined,
            });
            continue;
          }
          const p = result.perfume;
          const created = await addToShelf({
            name: p.name,
            brand: p.brand,
            concentration: p.concentration ?? "",
            status,
            details: detailsFromLookup(p),
          });
          // Awaited inside the worker so a long list never fires dozens of searches at once.
          const withPhoto = await findPhotoAndRender(created.id);
          patchRow(index, { state: "added", detail: `${p.name} by ${p.brand}${withPhoto?.photo ? "" : " (illustration)"}` });
        } catch (e) {
          const message = e instanceof Error ? e.message : "Failed.";
          patchRow(index, { state: /already on your shelf/i.test(message) ? "duplicate" : "error", detail: message });
        }
      }
    };

    // Three at a time: fast enough for 100+ bottles without hammering the AI API.
    await Promise.all([worker(), worker(), worker()]);
    setRunning(false);
  };

  const done = rows.filter((r) => r.state !== "queued" && r.state !== "working").length;
  const added = rows.filter((r) => r.state === "added").length;

  if (rows.length > 0) {
    return (
      <div className="space-y-4">
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span>{running ? "Adding your perfumes…" : `Done — ${added} added`}</span>
            <span className="tabular text-ink-faint">{done} / {rows.length}</span>
          </div>
          <div className="h-1.5 rounded-full bg-paper-deep">
            <div className="h-1.5 rounded-full bg-resin transition-all" style={{ width: `${(done / rows.length) * 100}%` }} />
          </div>
        </div>
        <ul className="max-h-[50vh] divide-y divide-line overflow-y-auto rounded-sm border border-line bg-card text-sm">
          {rows.map((row, i) => (
            <li key={`${row.query}-${i}`} className="flex items-start justify-between gap-3 px-3 py-2">
              <span className="min-w-0">
                <span className="block truncate">{row.query}</span>
                {row.detail && row.state !== "added" && <span className="block text-xs text-ink-faint">{row.detail}</span>}
              </span>
              <span className="flex shrink-0 items-center gap-2">
                {(row.state === "not-found" || row.state === "error") && !running && (
                  <button className="link cursor-pointer text-xs" onClick={() => onRetry(row.query)}>Fix</button>
                )}
                <span
                  className={`text-xs ${
                    row.state === "added" ? "text-moss" : row.state === "not-found" || row.state === "error" ? "text-alert" : "text-ink-faint"
                  }`}
                >
                  {ROW_LABEL[row.state]}
                </span>
              </span>
            </li>
          ))}
        </ul>
        {running ? (
          <Button variant="secondary" size="sm" onClick={() => (cancelled.current = true)}>Stop after current</Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => { setRows([]); setText(""); }}>Add another list</Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block space-y-1 text-sm">
        <span className="text-ink-soft">One perfume per line — adding the brand helps (“Shalimar by Guerlain”).</span>
        <textarea
          className={`${field} min-h-56 resize-y font-mono text-[13px]`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"Baccarat Rouge 540 by Maison Francis Kurkdjian\nSantal 33 by Le Labo\nSauvage Elixir by Dior"}
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-44"><StatusSelect value={status} onChange={setStatus} /></div>
        <span className="text-sm text-ink-faint">
          {lines.length} perfume{lines.length === 1 ? "" : "s"}
          {tooMany && ` — only the first ${LIMITS.bulkLines} will be added`}
        </span>
      </div>
      <p className="text-xs text-ink-faint">
        Each perfume is looked up and drawn by the AI, so a long list takes a few minutes. You can keep this panel open
        and watch progress; duplicates are skipped automatically.
      </p>
      <Button onClick={start} disabled={lines.length === 0} className="w-full">
        Add {Math.min(lines.length, LIMITS.bulkLines) || ""} to shelf
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------

export default function AddPerfumePanel({ initialQuery = "" }: { initialQuery?: string }) {
  const [tab, setTab] = useState<"single" | "bulk">("single");
  const [singleQuery, setSingleQuery] = useState(initialQuery);
  const [singleKey, setSingleKey] = useState(0);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <Segmented
        label="Add mode"
        value={tab}
        onChange={setTab}
        options={[
          { value: "single", label: "One perfume", hint: "Look it up and confirm" },
          { value: "bulk", label: "Paste a list", hint: "Add many at once" },
        ]}
      />
      {/* Both tabs stay mounted so a running bulk import keeps its progress while you fix a line. */}
      <div hidden={tab !== "single"} className="space-y-6">
        {lastAdded && <Notice tone="info">Added {lastAdded} to your shelf.</Notice>}
        <SingleAdd key={singleKey} initialQuery={singleQuery} onAdded={setLastAdded} />
      </div>
      <div hidden={tab !== "bulk"}>
        <BulkAdd
          onRetry={(query) => {
            setSingleQuery(query);
            setSingleKey((k) => k + 1);
            setLastAdded(null);
            setTab("single");
          }}
        />
      </div>
    </div>
  );
}
