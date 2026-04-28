#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set. Add it to .env.local or your shell.");
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  ssl:
    process.env.DATABASE_SSL === "true"
      ? { rejectUnauthorized: false }
      : undefined,
});

const files = ["db/schema.sql", "db/seed.sql"];

await client.connect();
try {
  for (const relPath of files) {
    const sql = await readFile(join(repoRoot, relPath), "utf8");
    process.stdout.write(`→ ${relPath} ... `);
    await client.query(sql);
    process.stdout.write("ok\n");
  }
} finally {
  await client.end();
}
