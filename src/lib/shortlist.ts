import "server-only";
import { query } from "@/lib/db";

/** Returns the set of listing ids the user has shortlisted. Empty when null. */
export async function getShortlistIds(
  userId: string | null | undefined,
): Promise<Set<string>> {
  if (!userId) return new Set();
  try {
    const r = await query<{ listing_id: string }>(
      `SELECT listing_id::text FROM shortlists WHERE user_id = $1::bigint`,
      [userId],
    );
    return new Set(r.rows.map((row) => row.listing_id));
  } catch {
    return new Set();
  }
}

export async function getShortlistCount(
  userId: string | null | undefined,
): Promise<number> {
  if (!userId) return 0;
  try {
    const r = await query<{ n: string }>(
      `SELECT COUNT(*)::text AS n FROM shortlists WHERE user_id = $1::bigint`,
      [userId],
    );
    return Number(r.rows[0]?.n ?? 0);
  } catch {
    return 0;
  }
}
