import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  name: string;
  intent: string | null;
  member_count: string;
  primary_phrase: string | null;
  created_at: string;
  generated_post_id: string | null;
};

function formatDate(s: string): string {
  try {
    return new Date(s).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return s;
  }
}

export default async function ClustersListPage() {
  await requireAdmin();
  const r = await query<Row>(
    `SELECT c.id::text,
            c.name,
            c.intent,
            (SELECT COUNT(*)::text FROM blog_keyword_clusters
              WHERE cluster_id = c.id) AS member_count,
            (SELECT k.phrase FROM blog_keywords k
              JOIN blog_keyword_clusters kc ON kc.keyword_id = k.id
             WHERE kc.cluster_id = c.id AND kc.is_primary = TRUE
             LIMIT 1) AS primary_phrase,
            c.created_at::text,
            c.generated_post_id::text
       FROM blog_clusters c
      ORDER BY c.created_at DESC
      LIMIT 200`,
  );
  const rows = r.rows;

  return (
    <div className="page admin-page" style={{ maxWidth: 960 }}>
      <Link href="/admin/blog/builder" className="back-link">
        ← Keyword bank
      </Link>

      <header className="admin-header">
        <p className="eyebrow">Admin · Blog · Builder · Clusters</p>
        <h1>Clusters</h1>
        <p className="sub">
          {rows.length === 1 ? "1 cluster" : `${rows.length} clusters`} in the
          bank. Each cluster maps to one article.
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="empty-state">
          <h3>No clusters yet</h3>
          <p style={{ margin: 0 }}>
            Open a keyword and click <strong>Generate cluster</strong> to
            create one.
          </p>
        </div>
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "var(--s-2)",
          }}
        >
          {rows.map((c) => (
            <li
              key={c.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto auto",
                gap: "var(--s-3)",
                alignItems: "center",
                padding: "var(--s-3) var(--s-4)",
                background: "#fff",
                border: "1px solid var(--hairline)",
                borderRadius: 10,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: "var(--ink-1)" }}>
                  {c.name}
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-3)" }}>
                  {c.primary_phrase ?? "—"} · {formatDate(c.created_at)}
                </div>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--ink-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  minWidth: 96,
                  textAlign: "right",
                }}
              >
                {c.intent ?? "—"}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--ink-3)",
                  minWidth: 80,
                  textAlign: "right",
                }}
              >
                {c.member_count} kw
              </span>
              <Link
                href={`/admin/blog/builder/cluster/${c.id}`}
                style={{
                  fontWeight: 600,
                  color: "var(--ink-1)",
                  fontSize: "var(--t-body-s)",
                  textDecoration: "none",
                }}
              >
                Open →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
