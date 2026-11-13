import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let sql: NeonQueryFunction<false, false> | null = null;

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("The shelf database is not configured.");
    this.name = "DatabaseNotConfiguredError";
  }
}

/** Lazily-created SQL tag. Queries written as sql`...${value}` are always parameterized. */
export function getSql(): NeonQueryFunction<false, false> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new DatabaseNotConfiguredError();
  sql ??= neon(url);
  return sql;
}
