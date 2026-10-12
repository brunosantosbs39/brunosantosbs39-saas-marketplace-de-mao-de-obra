import { readFile, readdir } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";
if (!process.env.DATABASE_URL)
  throw new Error("Defina DATABASE_URL para o ambiente desejado.");
const sql = neon(process.env.DATABASE_URL);
await sql`CREATE TABLE IF NOT EXISTS ml_schema_migrations(name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`;
for (const name of (await readdir(new URL("../migrations/", import.meta.url)))
  .filter((n) => /^\d+.*\.sql$/.test(n))
  .sort()) {
  const source = await readFile(
    new URL("../migrations/" + name, import.meta.url),
    "utf8",
  );
  const applied =
    await sql`SELECT name FROM ml_schema_migrations WHERE name=${name}`;
  if (applied.length) continue;
  await sql.transaction([
    ...source
      .split(";")
      .map((x) => x.trim())
      .filter(Boolean)
      .map((q) => sql.query(q)),
    sql`INSERT INTO ml_schema_migrations(name) VALUES(${name})`,
  ]);
  console.log("Migration aplicada:", name);
}
