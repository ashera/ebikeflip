import "server-only";
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

export type ReferenceKey =
  | "voice"
  | "humour"
  | "opinions"
  | "stats"
  | "stories"
  | "used-keywords";

export type ReferenceFile = {
  key: ReferenceKey;
  filename: string;
  /** Relative to repo root, for display + GitHub deep links. */
  path: string;
  body: string | null;
  bytes: number;
  modifiedAt: string | null;
};

const REFERENCES: Array<{ key: ReferenceKey; filename: string }> = [
  { key: "voice", filename: "voice.md" },
  { key: "humour", filename: "humour.md" },
  { key: "opinions", filename: "opinions.md" },
  { key: "stats", filename: "stats.md" },
  { key: "stories", filename: "stories.md" },
  { key: "used-keywords", filename: "used-keywords.md" },
];

const REFERENCES_DIR = "references";

// Module-scope cache so a single Node process reads each file once.
// Cleared on every deploy / process restart, which is fine — references
// only change between deploys anyway.
const cache = new Map<string, ReferenceFile>();

async function readOne(
  key: ReferenceKey,
  filename: string,
): Promise<ReferenceFile> {
  const cached = cache.get(filename);
  if (cached) return cached;

  const fullPath = join(process.cwd(), REFERENCES_DIR, filename);
  const path = `${REFERENCES_DIR}/${filename}`;
  let body: string | null = null;
  let bytes = 0;
  let modifiedAt: string | null = null;
  try {
    const [text, info] = await Promise.all([
      readFile(fullPath, "utf8"),
      stat(fullPath),
    ]);
    body = text;
    bytes = info.size;
    modifiedAt = info.mtime.toISOString();
  } catch {
    // File missing — leave body null so the UI can flag it.
  }

  const result: ReferenceFile = {
    key,
    filename,
    path,
    body,
    bytes,
    modifiedAt,
  };
  cache.set(filename, result);
  return result;
}

export async function loadBlogReferences(): Promise<ReferenceFile[]> {
  return Promise.all(REFERENCES.map((r) => readOne(r.key, r.filename)));
}

export async function loadBlogReference(
  key: ReferenceKey,
): Promise<ReferenceFile | null> {
  const ref = REFERENCES.find((r) => r.key === key);
  if (!ref) return null;
  return readOne(ref.key, ref.filename);
}
