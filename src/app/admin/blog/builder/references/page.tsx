import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { loadBlogReferences, type ReferenceFile } from "@/lib/blog-references";
import { renderMarkdown } from "@/lib/blog";

export const dynamic = "force-dynamic";

// Repo for the "Edit on GitHub" deep links. Update if the repo moves or you
// fork. The branch is set to main since deploys come from main.
const GITHUB_REPO = "ashera/ebikeflip";
const GITHUB_BRANCH = "main";

const TITLES: Record<string, string> = {
  voice: "Voice",
  humour: "Humour",
  opinions: "Opinions",
  stats: "Stats",
  stories: "Stories",
  "used-keywords": "Used keywords",
};

const DESCRIPTIONS: Record<string, string> = {
  voice:
    "Who's writing, sentence rhythm, vocabulary. Always injected into the system prompt for every generation.",
  humour:
    "How the brand makes the reader smile. Mandatory dad-energy rules and examples — also injected into every prompt.",
  opinions:
    "Editorial stance: the takes that make the post feel human instead of generic. The generator picks 1–2 per article.",
  stats:
    "Canonical numbers — pricing, response times, comparisons. Used verbatim, never rounded or invented.",
  stories:
    "Recurring anecdotes the generator can adapt. One or two per post brings the prose alive.",
  "used-keywords":
    "Primary keywords already targeted on the site. Consulted before clustering so we don't cannibalise existing pages.",
};

function formatBytes(n: number): string {
  if (n === 0) return "0 B";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

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

function githubEditUrl(path: string): string {
  return `https://github.com/${GITHUB_REPO}/edit/${GITHUB_BRANCH}/${path}`;
}

function githubViewUrl(path: string): string {
  return `https://github.com/${GITHUB_REPO}/blob/${GITHUB_BRANCH}/${path}`;
}

function FileSection({ file }: { file: ReferenceFile }) {
  const html = file.body ? renderMarkdown(file.body) : "";
  return (
    <section
      id={file.key}
      className="form-card"
      style={{ marginBottom: "var(--s-5)" }}
    >
      <div
        style={{
          display: "flex",
          gap: "var(--s-3)",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "var(--s-4)",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h2 className="card-heading" style={{ margin: 0 }}>
            {TITLES[file.key] ?? file.key}
          </h2>
          <p className="card-sub" style={{ marginTop: 4, marginBottom: 0 }}>
            {DESCRIPTIONS[file.key] ?? ""}
          </p>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--ink-3)",
              margin: "var(--s-2) 0 0",
              wordBreak: "break-all",
            }}
          >
            {file.path} · {formatBytes(file.bytes)}
            {file.modifiedAt ? ` · last edited ${formatDate(file.modifiedAt)}` : ""}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            flexShrink: 0,
          }}
        >
          <a
            href={githubViewUrl(file.path)}
            target="_blank"
            rel="noopener"
            className="btn --ghost --sm"
          >
            View on GitHub
          </a>
          <a
            href={githubEditUrl(file.path)}
            target="_blank"
            rel="noopener"
            className="btn --primary --sm"
          >
            Edit on GitHub →
          </a>
        </div>
      </div>

      {!file.body ? (
        <div className="form-error">
          File not found at <code>{file.path}</code>. Create it in your repo
          and commit to populate this section.
        </div>
      ) : (
        <>
          <div
            className="prose"
            style={{ fontSize: 15 }}
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <details
            style={{
              marginTop: "var(--s-5)",
              paddingTop: "var(--s-4)",
              borderTop: "1px solid var(--hairline)",
            }}
          >
            <summary
              style={{
                cursor: "pointer",
                fontSize: "var(--t-body-s)",
                color: "var(--ink-3)",
                fontWeight: 600,
              }}
            >
              View raw markdown source
            </summary>
            <pre
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                lineHeight: 1.5,
                background: "var(--surface-sunken)",
                border: "1px solid var(--hairline)",
                borderRadius: 8,
                padding: "var(--s-3)",
                marginTop: "var(--s-3)",
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                color: "var(--ink-2)",
              }}
            >
              {file.body}
            </pre>
          </details>
        </>
      )}
    </section>
  );
}

export default async function ReferencesPage() {
  await requireAdmin();
  const files = await loadBlogReferences();

  return (
    <div className="page admin-page" style={{ maxWidth: 880 }}>
      <Link href="/admin/blog/builder" className="back-link">
        ← Keyword bank
      </Link>

      <header className="admin-header">
        <p className="eyebrow">Admin · Blog · Builder · References</p>
        <h1>Reference library</h1>
        <p className="sub">
          The voice, humour, opinions, stats, and stories that the
          generator pulls from. The files live in the repo and are the
          source of truth — edit them on GitHub and the next deploy picks
          up the change.
        </p>
      </header>

      <nav
        aria-label="Jump to file"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: "var(--s-5)",
          padding: "var(--s-3)",
          background: "var(--surface-sunken)",
          border: "1px solid var(--hairline)",
          borderRadius: 10,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--ink-3)",
            alignSelf: "center",
          }}
        >
          Jump to:
        </span>
        {files.map((f) => (
          <a
            key={f.key}
            href={`#${f.key}`}
            style={{
              fontSize: "var(--t-body-s)",
              color: "var(--ink-1)",
              textDecoration: "none",
              fontWeight: 600,
              padding: "4px 10px",
              border: "1px solid var(--hairline)",
              borderRadius: 999,
              background: "#fff",
            }}
          >
            {TITLES[f.key] ?? f.key}
          </a>
        ))}
      </nav>

      {files.map((f) => (
        <FileSection key={f.key} file={f} />
      ))}
    </div>
  );
}
