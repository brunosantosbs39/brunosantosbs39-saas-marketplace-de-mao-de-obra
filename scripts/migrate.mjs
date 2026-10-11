import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";
if (!process.env.DATABASE_URL)
  throw new Error("Defina DATABASE_URL para o ambiente desejado.");
const sql = neon(process.env.DATABASE_URL);
const source = await readFile(
  new URL("../migrations/001-marketplace.sql", import.meta.url),
  "utf8",
);
await sql.transaction(
  source
    .split(";")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((q) => sql.query(q)),
);
console.log("Migration 001 aplicada.");
