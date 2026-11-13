// Applies db/migrations/*.sql in order, once each. Usage: npm run db:migrate
// Reads DATABASE_URL from the environment (npm script loads .env.local). Never prints it.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const sql = neon(url);
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "db", "migrations");

await sql`CREATE TABLE IF NOT EXISTS schema_migrations (
  name text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
)`;

const applied = new Set((await sql`SELECT name FROM schema_migrations`).map((row) => row.name));
const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

for (const file of files) {
  if (applied.has(file)) {
    console.log(`skip   ${file}`);
    continue;
  }
  const text = await readFile(path.join(dir, file), "utf8");
  const statements = text
    .split(/;\s*$/m)
    .map((s) => s.replace(/^\s*--.*$/gm, "").trim())
    .filter(Boolean);
  await sql.transaction([
    ...statements.map((statement) => sql.query(statement)),
    sql`INSERT INTO schema_migrations (name) VALUES (${file})`,
  ]);
  console.log(`apply  ${file} (${statements.length} statements)`);
}

console.log("Migrations up to date.");
