import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import {
  clearAllImages,
  clearImageSlot,
  deleteBlogCluster,
  findInitialImages,
  generateClusterFromKeyword,
  refreshImageSlot,
  removeKeywordFromCluster,
  renameBlogCluster,
  toggleImageInclude,
} from "@/lib/actions/blog-builder";
import { Button, Field, Input } from "../../../../../_components/ui";

export const dynamic = "force-dynamic";

const IMAGE_SLOTS = 5;

const ERRORS: Record<string, string> = {
  "invalid-name": "Cluster name is required.",
  "cant-remove-primary":
    "You can't drop the primary keyword. Delete the cluster or regenerate it from a different root.",
  "no-key":
    "ANTHROPIC_API_KEY isn't set on the server — add it and redeploy to use Generate cluster.",
  "claude-error":
    "Claude returned an error. Check server logs for details and try again.",
  "bad-output":
    "Claude returned an unparseable response. Try regenerating.",
  "missing-root":
    "This cluster has no primary keyword. Regenerate from a root keyword to set one.",
  "no-pexels-key":
    "PEXELS_API_KEY isn't set on the server — add it and redeploy to fetch images.",
  "pexels-error":
    "Pexels returned an error. Check server logs and try again.",
  "no-pexels-results":
    "Pexels has no more landscape photos for this phrase. Try a related keyword.",
};

type ImageRow = {
  id: string;
  slot: number;
  include_in_post: boolean;
  source_id: string;
  url_large: string;
  source_url: string | null;
  photographer: string | null;
  photographer_url: string | null;
  alt: string | null;
};

type ClusterRow = {
  id: string;
  name: string;
  intent: string | null;
  primary_keyword_id: string | null;
  model_used: string | null;
  generated_post_id: string | null;
  created_at: string;
  updated_at: string;
};

type MemberRow = {
  keyword_id: string;
  phrase: string;
  intent: string | null;
  status: string;
  is_primary: boolean;
};

function formatDate(s: string | null): string {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
}

export default async function ClusterReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { saved, error } = await searchParams;
  const errorMessage = error ? ERRORS[error] ?? "Something went wrong." : null;

  if (!/^\d+$/.test(id)) notFound();

  const [clusterRes, membersRes, imageRes] = await Promise.all([
    query<ClusterRow>(
      `SELECT id::text,
              name,
              intent,
              primary_keyword_id::text,
              model_used,
              generated_post_id::text,
              created_at::text,
              updated_at::text
         FROM blog_clusters WHERE id = $1::bigint LIMIT 1`,
      [id],
    ),
    query<MemberRow>(
      `SELECT k.id::text   AS keyword_id,
              k.phrase,
              k.intent,
              k.status,
              kc.is_primary
         FROM blog_keyword_clusters kc
         JOIN blog_keywords k ON k.id = kc.keyword_id
        WHERE kc.cluster_id = $1::bigint
        ORDER BY kc.is_primary DESC, k.phrase`,
      [id],
    ),
    query<ImageRow>(
      `SELECT id::text,
              slot,
              include_in_post,
              source_id,
              url_large,
              source_url,
              photographer,
              photographer_url,
              alt
         FROM blog_cluster_images
        WHERE cluster_id = $1::bigint
        ORDER BY slot`,
      [id],
    ),
  ]);
  const cluster = clusterRes.rows[0];
  if (!cluster) notFound();
  const members = membersRes.rows;
  const primary = members.find((m) => m.is_primary) ?? null;
  const imagesBySlot = new Map<number, ImageRow>(
    imageRes.rows.map((r) => [r.slot, r]),
  );
  const slots: Array<ImageRow | null> = Array.from(
    { length: IMAGE_SLOTS },
    (_, i) => imagesBySlot.get(i) ?? null,
  );
  const hasAnyImage = slots.some((s) => s != null);
  const includedCount = slots.filter((s) => s?.include_in_post).length;

  return (
    <div className="page admin-page" style={{ maxWidth: 880 }}>
      <Link href="/admin/blog/builder" className="back-link">
        ← Keyword bank
      </Link>

      <header className="admin-header">
        <p className="eyebrow">Admin · Blog · Builder · Cluster</p>
        <h1>{cluster.name}</h1>
        <p className="sub">
          {cluster.intent ?? "no intent"} · {members.length} keywords ·
          generated {formatDate(cluster.created_at)}
          {cluster.model_used ? ` · ${cluster.model_used}` : ""}
        </p>
      </header>

      {saved && !errorMessage && (
        <p className="form-success" style={{ marginBottom: "var(--s-5)" }}>
          Saved.
        </p>
      )}
      {errorMessage && (
        <p className="form-error" style={{ marginBottom: "var(--s-5)" }}>
          {errorMessage}
        </p>
      )}

      <section className="form-card" style={{ marginBottom: "var(--s-5)" }}>
        <h2 className="card-heading">Name</h2>
        <p className="card-sub">
          Defaults to the primary keyword. Edit if you want a friendlier
          label for the bank list.
        </p>
        <form
          action={renameBlogCluster}
          style={{
            display: "flex",
            gap: "var(--s-3)",
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <input type="hidden" name="clusterId" value={cluster.id} />
          <Field label="Cluster name" htmlFor="name">
            <Input
              id="name"
              name="name"
              required
              maxLength={200}
              defaultValue={cluster.name}
            />
          </Field>
          <Button type="submit" variant="dark">
            Save name
          </Button>
        </form>
      </section>

      <section className="form-card" style={{ marginBottom: "var(--s-5)" }}>
        <h2 className="card-heading">Members</h2>
        <p className="card-sub">
          The primary keyword anchors the cluster — its intent defines the
          set, and one cluster maps to one article. Drop any related
          keywords that don&rsquo;t feel right.
        </p>

        {members.length === 0 ? (
          <p style={{ color: "var(--ink-3)", margin: 0 }}>
            No members. (How did this happen? Try regenerating.)
          </p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {members.map((m) => (
              <li
                key={m.keyword_id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  gap: "var(--s-3)",
                  alignItems: "center",
                  padding: "8px 12px",
                  background: m.is_primary
                    ? "var(--surface-sunken)"
                    : "#fff",
                  border: "1px solid var(--hairline)",
                  borderRadius: 8,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <Link
                    href={`/admin/blog/builder/${m.keyword_id}`}
                    style={{
                      fontWeight: m.is_primary ? 700 : 600,
                      color: "var(--ink-1)",
                      textDecoration: "none",
                    }}
                  >
                    {m.phrase}
                  </Link>
                  {m.is_primary && (
                    <span
                      className="users-tag --admin"
                      style={{ marginLeft: 8 }}
                    >
                      Primary
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--ink-3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {m.intent ?? "—"}
                </span>
                {m.is_primary ? (
                  <span style={{ width: 80 }} />
                ) : (
                  <form action={removeKeywordFromCluster}>
                    <input type="hidden" name="clusterId" value={cluster.id} />
                    <input
                      type="hidden"
                      name="keywordId"
                      value={m.keyword_id}
                    />
                    <button
                      type="submit"
                      title="Remove from cluster (keeps the keyword in the bank)"
                      style={{
                        background: "transparent",
                        border: "1px solid var(--hairline)",
                        color: "var(--ink-3)",
                        padding: "4px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="form-card" style={{ marginBottom: "var(--s-5)" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "var(--s-3)",
            flexWrap: "wrap",
            alignItems: "flex-start",
            marginBottom: "var(--s-4)",
          }}
        >
          <div>
            <h2 className="card-heading" style={{ margin: 0 }}>
              Hero images ({includedCount}/{IMAGE_SLOTS} included)
            </h2>
            <p className="card-sub" style={{ marginTop: 4 }}>
              Up to {IMAGE_SLOTS} Pexels candidates, searched against the
              primary keyword{primary ? ` (“${primary.phrase}”)` : ""}.
              Refresh each slot independently and toggle{" "}
              <strong>Include</strong> on the ones the post should use.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <form action={findInitialImages}>
              <input type="hidden" name="clusterId" value={cluster.id} />
              <Button type="submit" variant={hasAnyImage ? "ghost" : "primary"}>
                {hasAnyImage ? "Re-fill empty slots" : "Find images"}
              </Button>
            </form>
            {hasAnyImage && (
              <form action={clearAllImages}>
                <input type="hidden" name="clusterId" value={cluster.id} />
                <Button type="submit" variant="ghost">
                  Clear all
                </Button>
              </form>
            )}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "var(--s-3)",
          }}
        >
          {slots.map((img, slot) => (
            <div
              key={slot}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                padding: "var(--s-3)",
                background: img?.include_in_post
                  ? "var(--volt-50)"
                  : "var(--surface-sunken)",
                border: `1px solid ${
                  img?.include_in_post
                    ? "var(--volt-300)"
                    : "var(--hairline)"
                }`,
                borderRadius: 10,
                opacity: img && !img.include_in_post ? 0.65 : 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--ink-3)",
                }}
              >
                <span>Slot {slot + 1}</span>
                {img?.include_in_post && (
                  <span
                    className="users-tag --ok"
                    style={{ fontSize: 10 }}
                  >
                    Included
                  </span>
                )}
              </div>

              {img ? (
                <>
                  <img
                    src={img.url_large}
                    alt={img.alt ?? cluster.name}
                    style={{
                      width: "100%",
                      aspectRatio: "16 / 10",
                      objectFit: "cover",
                      borderRadius: 8,
                      background: "#fff",
                      display: "block",
                    }}
                  />
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--ink-3)",
                      lineHeight: 1.4,
                    }}
                  >
                    by{" "}
                    {img.photographer_url ? (
                      <a
                        href={img.photographer_url}
                        target="_blank"
                        rel="noopener"
                        style={{ color: "var(--ink-2)" }}
                      >
                        {img.photographer}
                      </a>
                    ) : (
                      img.photographer
                    )}{" "}
                    ·{" "}
                    {img.source_url ? (
                      <a
                        href={img.source_url}
                        target="_blank"
                        rel="noopener"
                        style={{ color: "var(--ink-2)" }}
                      >
                        Pexels
                      </a>
                    ) : (
                      "Pexels"
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                      marginTop: 4,
                    }}
                  >
                    <form action={toggleImageInclude}>
                      <input
                        type="hidden"
                        name="clusterId"
                        value={cluster.id}
                      />
                      <input type="hidden" name="slot" value={slot} />
                      <button
                        type="submit"
                        style={{
                          padding: "4px 10px",
                          fontSize: 12,
                          background: img.include_in_post
                            ? "#fff"
                            : "var(--ink-1)",
                          color: img.include_in_post
                            ? "var(--ink-1)"
                            : "#fff",
                          border: "1px solid var(--ink-1)",
                          borderRadius: 999,
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        {img.include_in_post ? "Exclude" : "Include"}
                      </button>
                    </form>
                    <form action={refreshImageSlot}>
                      <input
                        type="hidden"
                        name="clusterId"
                        value={cluster.id}
                      />
                      <input type="hidden" name="slot" value={slot} />
                      <button
                        type="submit"
                        style={{
                          padding: "4px 10px",
                          fontSize: 12,
                          background: "transparent",
                          color: "var(--ink-2)",
                          border: "1px solid var(--hairline)",
                          borderRadius: 999,
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        Refresh
                      </button>
                    </form>
                    <form action={clearImageSlot}>
                      <input
                        type="hidden"
                        name="clusterId"
                        value={cluster.id}
                      />
                      <input type="hidden" name="slot" value={slot} />
                      <button
                        type="submit"
                        title="Empty this slot"
                        style={{
                          padding: "4px 10px",
                          fontSize: 12,
                          background: "transparent",
                          color: "var(--ink-3)",
                          border: "1px solid var(--hairline)",
                          borderRadius: 999,
                          cursor: "pointer",
                        }}
                      >
                        ✕
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <>
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "16 / 10",
                      border: "1px dashed var(--hairline)",
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--ink-3)",
                      fontSize: 12,
                    }}
                  >
                    Empty
                  </div>
                  <form action={refreshImageSlot}>
                    <input
                      type="hidden"
                      name="clusterId"
                      value={cluster.id}
                    />
                    <input type="hidden" name="slot" value={slot} />
                    <button
                      type="submit"
                      style={{
                        width: "100%",
                        padding: "6px 10px",
                        fontSize: 12,
                        background: "transparent",
                        color: "var(--ink-2)",
                        border: "1px solid var(--hairline)",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Find a photo
                    </button>
                  </form>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {primary && (
        <section className="form-card" style={{ marginBottom: "var(--s-5)" }}>
          <h2 className="card-heading">Regenerate</h2>
          <p className="card-sub">
            Re-runs the cluster prompt against the primary keyword. Old
            members stay in the bank; new keywords get added to a fresh
            cluster.
          </p>
          <form action={generateClusterFromKeyword}>
            <input type="hidden" name="keywordId" value={primary.keyword_id} />
            <Button type="submit" variant="ghost">
              Regenerate from &ldquo;{primary.phrase}&rdquo;
            </Button>
          </form>
        </section>
      )}

      <form
        action={deleteBlogCluster}
        style={{
          marginTop: "var(--s-7)",
          paddingTop: "var(--s-5)",
          borderTop: "1px solid var(--hairline)",
          textAlign: "center",
        }}
      >
        <input type="hidden" name="clusterId" value={cluster.id} />
        <button
          type="submit"
          style={{
            background: "transparent",
            border: 0,
            color: "var(--ink-3)",
            fontSize: "var(--t-body-s)",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Delete this cluster (members stay in the bank)
        </button>
      </form>
    </div>
  );
}
