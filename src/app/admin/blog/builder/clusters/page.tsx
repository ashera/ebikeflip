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
  serp_analyzed_at: string | null;
  images_included: string;
};

function Check({ done, label }: { done: boolean; label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        fontSize: 11,
        fontFamily: "var(--font-mono)",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        borderRadius: 999,
        border: `1px solid ${done ? "var(--volt-300)" : "var(--hairline)"}`,
        background: done ? "var(--volt-50)" : "transparent",
        color: done ? "var(--ink-1)" : "var(--ink-3)",
        fontWeight: done ? 600 : 500,
      }}
    >
      <span aria-hidden style={{ fontSize: 12, lineHeight: 1 }}>
        {done ? "✓" : "○"}
      </span>
      {label}
    </span>
  );
}

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
            c.generated_post_id::text,
            c.serp_analyzed_at::text,
            (SELECT COUNT(*)::text FROM blog_cluster_images
              WHERE cluster_id = c.id AND include_in_post = TRUE)
                AS images_included
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
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginTop: 6,
                  }}
                >
                  <Check
                    done={Boolean(c.serp_analyzed_at)}
                    label="SERP"
                  />
                  <Check
                    done={Number(c.images_included) > 0}
                    label={
                      Number(c.images_included) > 0
                        ? `Images · ${c.images_included}`
                        : "Images"
                    }
                  />
                  <Check
                    done={Boolean(c.generated_post_id)}
                    label="Post"
                  />
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
