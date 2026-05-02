"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { query, withTransaction } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { callClaude, extractJson } from "@/lib/anthropic";

const PHRASE_MAX = 200;
const NOTES_MAX = 2000;

const VALID_INTENTS = new Set([
  "informational",
  "commercial",
  "navigational",
  "transactional",
]);

const VALID_STATUSES = new Set([
  "idea",
  "clustered",
  "drafted",
  "published",
]);

function getString(formData: FormData, key: string, max?: number): string {
  const raw = String(formData.get(key) ?? "").trim();
  if (max && raw.length > max) return raw.slice(0, max);
  return raw;
}

function nullableString(s: string): string | null {
  return s.length === 0 ? null : s;
}

function getOptionalInt(formData: FormData, key: string): number | null {
  const raw = getString(formData, key);
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function getIntentOrNull(formData: FormData, key: string): string | null {
  const v = getString(formData, key).toLowerCase();
  return VALID_INTENTS.has(v) ? v : null;
}

function getStatusOrIdea(formData: FormData, key: string): string {
  const v = getString(formData, key).toLowerCase();
  return VALID_STATUSES.has(v) ? v : "idea";
}

export async function createBlogKeyword(formData: FormData): Promise<void> {
  await requireAdmin();
  const phrase = getString(formData, "phrase", PHRASE_MAX);
  if (!phrase) redirect("/admin/blog/builder/new?error=invalid-phrase");

  const intent = getIntentOrNull(formData, "intent");
  const searchVolume = getOptionalInt(formData, "search_volume");
  const difficulty = getOptionalInt(formData, "difficulty");
  const notes = nullableString(getString(formData, "notes", NOTES_MAX));
  const status = getStatusOrIdea(formData, "status");

  try {
    await query(
      `INSERT INTO blog_keywords (phrase, intent, search_volume, difficulty, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [phrase, intent, searchVolume, difficulty, notes, status],
    );
  } catch (err) {
    if ((err as { code?: string }).code === "23505") {
      redirect("/admin/blog/builder/new?error=duplicate");
    }
    throw err;
  }

  revalidatePath("/admin/blog/builder");
  redirect("/admin/blog/builder?saved=1");
}

export async function bulkCreateBlogKeywords(
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  const intent = getIntentOrNull(formData, "intent");
  const status = getStatusOrIdea(formData, "status");
  const raw = String(formData.get("phrases") ?? "");
  const phrases = raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length <= PHRASE_MAX);

  if (phrases.length === 0) {
    redirect("/admin/blog/builder/new?error=empty-bulk");
  }

  // One insert; phrase rows fan out via VALUES, intent + status are shared.
  // ON CONFLICT skips dupes against the lowercase-unique index on phrase.
  const placeholders = phrases.map((_, i) => `($${i + 3})`).join(", ");
  await query(
    `INSERT INTO blog_keywords (intent, status, phrase)
     SELECT $1, $2, p.phrase
       FROM (VALUES ${placeholders}) AS p(phrase)
       ON CONFLICT DO NOTHING`,
    [intent, status, ...phrases],
  );

  revalidatePath("/admin/blog/builder");
  redirect(
    `/admin/blog/builder?saved=1&added=${phrases.length}`,
  );
}

export async function updateBlogKeyword(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("keywordId") ?? "");
  if (!/^\d+$/.test(id)) redirect("/admin/blog/builder");

  const phrase = getString(formData, "phrase", PHRASE_MAX);
  if (!phrase)
    redirect(`/admin/blog/builder/${id}?error=invalid-phrase`);

  const intent = getIntentOrNull(formData, "intent");
  const searchVolume = getOptionalInt(formData, "search_volume");
  const difficulty = getOptionalInt(formData, "difficulty");
  const notes = nullableString(getString(formData, "notes", NOTES_MAX));
  const status = getStatusOrIdea(formData, "status");

  try {
    await query(
      `UPDATE blog_keywords
          SET phrase = $2,
              intent = $3,
              search_volume = $4,
              difficulty = $5,
              notes = $6,
              status = $7,
              updated_at = NOW()
        WHERE id = $1::bigint`,
      [id, phrase, intent, searchVolume, difficulty, notes, status],
    );
  } catch (err) {
    if ((err as { code?: string }).code === "23505") {
      redirect(`/admin/blog/builder/${id}?error=duplicate`);
    }
    throw err;
  }

  revalidatePath("/admin/blog/builder");
  redirect(`/admin/blog/builder/${id}?saved=1`);
}

export async function deleteBlogKeyword(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("keywordId") ?? "");
  if (!/^\d+$/.test(id)) redirect("/admin/blog/builder");

  await query(`DELETE FROM blog_keywords WHERE id = $1::bigint`, [id]);

  revalidatePath("/admin/blog/builder");
  redirect("/admin/blog/builder?saved=1");
}

// ---------------------------------------------------------------------------
// Cluster generation
// ---------------------------------------------------------------------------

const CLUSTER_SYSTEM_PROMPT = `You are a senior SEO strategist for ebikeflip, a peer-to-peer marketplace for buying and selling used eBikes.

Your job: given one root search keyword, output a tight cluster of 8 to 14 closely-related search queries that share the SAME search intent as the root, suitable for targeting on a single article.

Rules:
- All queries must share the root's search intent (one of: informational, commercial, navigational, transactional). Do NOT mix intents.
- Each query is a phrase a real person would type into Google: 3-10 words, lowercase, no punctuation, no quotes.
- Do not repeat the root verbatim.
- Avoid pure synonyms that would target the same exact page (e.g., "best ebike" vs "best electric bike" — pick one).
- Prefer phrases that surface long-tail variations: questions, qualifiers (year, price, use case), and specific sub-topics.

Output ONLY a single valid JSON object — no prose, no markdown fences. Shape:

{
  "name": "short cluster name (typically the root or a tightened version)",
  "intent": "informational" | "commercial" | "navigational" | "transactional",
  "keywords": ["phrase 1", "phrase 2", ...]
}`;

type ClusterPayload = {
  name?: string;
  intent?: string;
  keywords?: string[];
};

const CLUSTER_INTENTS = new Set([
  "informational",
  "commercial",
  "navigational",
  "transactional",
]);

function normalisePhrase(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateClusterFromKeyword(
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const rootId = String(formData.get("keywordId") ?? "");
  if (!/^\d+$/.test(rootId)) redirect("/admin/blog/builder");

  const r = await query<{
    id: string;
    phrase: string;
    intent: string | null;
    notes: string | null;
  }>(
    `SELECT id::text, phrase, intent, notes
       FROM blog_keywords WHERE id = $1::bigint LIMIT 1`,
    [rootId],
  );
  const root = r.rows[0];
  if (!root)
    redirect(`/admin/blog/builder/${rootId}?error=missing-root`);

  const userPrompt = [
    `Root keyword: "${root.phrase}"`,
    `Existing intent guess: "${root.intent ?? "unknown"}"`,
    `Notes from the editor: "${root.notes ?? "none"}"`,
    "",
    "Return the JSON cluster now.",
  ].join("\n");

  const result = await callClaude({
    system: CLUSTER_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
    maxTokens: 1500,
  });
  if (!result.ok) {
    const code = result.error.includes("ANTHROPIC_API_KEY")
      ? "no-key"
      : "claude-error";
    // eslint-disable-next-line no-console
    console.error("[cluster] Claude call failed", result.error);
    redirect(`/admin/blog/builder/${rootId}?error=${code}`);
  }

  const parsed = extractJson<ClusterPayload>(result.text);
  if (!parsed || !Array.isArray(parsed.keywords) || parsed.keywords.length === 0) {
    // eslint-disable-next-line no-console
    console.error(
      "[cluster] Could not parse cluster JSON",
      result.text.slice(0, 400),
    );
    redirect(`/admin/blog/builder/${rootId}?error=bad-output`);
  }

  // Clean + dedupe member phrases (excluding the root verbatim).
  const seen = new Set<string>([normalisePhrase(root.phrase)]);
  const cleaned: string[] = [];
  for (const raw of parsed.keywords) {
    if (typeof raw !== "string") continue;
    const norm = normalisePhrase(raw);
    if (!norm || norm.length > 200) continue;
    if (seen.has(norm)) continue;
    seen.add(norm);
    cleaned.push(norm);
  }
  if (cleaned.length === 0) {
    redirect(`/admin/blog/builder/${rootId}?error=bad-output`);
  }

  const intent = CLUSTER_INTENTS.has(String(parsed.intent ?? "").toLowerCase())
    ? String(parsed.intent).toLowerCase()
    : root.intent ?? null;
  const name =
    typeof parsed.name === "string" && parsed.name.trim().length > 0
      ? parsed.name.trim().slice(0, 200)
      : root.phrase;

  // Persist: upsert the new keywords, then build cluster + m2m. The unique
  // index on LOWER(phrase) keeps duplicates tidy, and DO UPDATE flips the
  // status so RETURNING gives us IDs for both inserts and existing rows.
  const clusterId = await withTransaction(async (client) => {
    const upsert = await client.query<{ id: string; phrase: string }>(
      `INSERT INTO blog_keywords (phrase, intent, status)
       SELECT phrase, $1, 'clustered'
         FROM unnest($2::text[]) AS phrase
       ON CONFLICT (LOWER(phrase)) DO UPDATE
         SET status = 'clustered', updated_at = NOW()
       RETURNING id::text, phrase`,
      [intent, cleaned],
    );

    // Always include the root in the cluster, marked primary.
    await client.query(
      `UPDATE blog_keywords
          SET status = 'clustered', updated_at = NOW()
        WHERE id = $1::bigint`,
      [root.id],
    );

    const cluster = await client.query<{ id: string }>(
      `INSERT INTO blog_clusters
        (name, intent, primary_keyword_id, model_used)
       VALUES ($1, $2, $3::bigint, $4)
       RETURNING id::text`,
      [name, intent, root.id, result.ok ? result.model : null],
    );
    const cId = cluster.rows[0]!.id;

    // Link rows: root first (primary), then every member.
    await client.query(
      `INSERT INTO blog_keyword_clusters (cluster_id, keyword_id, is_primary)
       VALUES ($1::bigint, $2::bigint, TRUE)
       ON CONFLICT DO NOTHING`,
      [cId, root.id],
    );
    if (upsert.rows.length > 0) {
      const ids = upsert.rows.map((r) => r.id);
      await client.query(
        `INSERT INTO blog_keyword_clusters (cluster_id, keyword_id, is_primary)
         SELECT $1::bigint, kid::bigint, FALSE
           FROM unnest($2::bigint[]) AS kid
         ON CONFLICT DO NOTHING`,
        [cId, ids],
      );
    }

    return cId;
  });

  revalidatePath("/admin/blog/builder");
  revalidatePath(`/admin/blog/builder/${rootId}`);
  revalidatePath(`/admin/blog/builder/cluster/${clusterId}`);
  redirect(`/admin/blog/builder/cluster/${clusterId}`);
}

export async function renameBlogCluster(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("clusterId") ?? "");
  if (!/^\d+$/.test(id)) redirect("/admin/blog/builder");
  const name = String(formData.get("name") ?? "")
    .trim()
    .slice(0, 200);
  if (!name) redirect(`/admin/blog/builder/cluster/${id}?error=invalid-name`);

  await query(
    `UPDATE blog_clusters SET name = $1, updated_at = NOW()
      WHERE id = $2::bigint`,
    [name, id],
  );
  revalidatePath(`/admin/blog/builder/cluster/${id}`);
  redirect(`/admin/blog/builder/cluster/${id}?saved=1`);
}

export async function removeKeywordFromCluster(
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const clusterId = String(formData.get("clusterId") ?? "");
  const keywordId = String(formData.get("keywordId") ?? "");
  if (!/^\d+$/.test(clusterId) || !/^\d+$/.test(keywordId)) {
    redirect("/admin/blog/builder");
  }

  // Refuse to remove the primary — user should regenerate or delete cluster.
  const r = await query<{ is_primary: boolean }>(
    `SELECT is_primary FROM blog_keyword_clusters
      WHERE cluster_id = $1::bigint AND keyword_id = $2::bigint LIMIT 1`,
    [clusterId, keywordId],
  );
  if (r.rows[0]?.is_primary) {
    redirect(`/admin/blog/builder/cluster/${clusterId}?error=cant-remove-primary`);
  }

  await query(
    `DELETE FROM blog_keyword_clusters
      WHERE cluster_id = $1::bigint AND keyword_id = $2::bigint`,
    [clusterId, keywordId],
  );

  revalidatePath(`/admin/blog/builder/cluster/${clusterId}`);
  redirect(`/admin/blog/builder/cluster/${clusterId}?saved=1`);
}

export async function deleteBlogCluster(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("clusterId") ?? "");
  if (!/^\d+$/.test(id)) redirect("/admin/blog/builder");

  await query(`DELETE FROM blog_clusters WHERE id = $1::bigint`, [id]);
  revalidatePath("/admin/blog/builder");
  redirect("/admin/blog/builder?saved=1");
}

