"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Formula } from "@/types";

// Saved formulas live in this browser only (localStorage).
const KEY = "mip:notebook:v1";
const EVENT = "mip:notebook-change";
const EMPTY: Formula[] = [];

let cachedRaw: string | null = null;
let cachedList: Formula[] = EMPTY;

function read(): Formula[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cachedRaw) return cachedList;
    cachedRaw = raw;
    cachedList = raw ? (JSON.parse(raw) as Formula[]) : EMPTY;
    return cachedList;
  } catch {
    return EMPTY;
  }
}

function write(list: Formula[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // storage unavailable (private mode / quota) — keep working without persistence
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useNotebook() {
  const formulas = useSyncExternalStore(subscribe, read, () => EMPTY);

  const save = useCallback((formula: Formula): Formula => {
    const id = formula.id ?? `f-${Date.now().toString(36)}`;
    const entry = { ...formula, id, createdAt: formula.createdAt ?? new Date().toISOString() };
    write([entry, ...read().filter((f) => f.id !== id)].slice(0, 50));
    return entry;
  }, []);

  const remove = useCallback((id: string) => {
    write(read().filter((f) => f.id !== id));
  }, []);

  const isSaved = useCallback((id?: string) => Boolean(id && formulas.some((f) => f.id === id)), [formulas]);

  return { formulas, save, remove, isSaved };
}
