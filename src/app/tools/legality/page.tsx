import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AU eBike legality check · ebikeflip",
  description:
    "Pick your state and your eBike's specs — find out if it's road-legal as a pedelec under Australian rules.",
};

const STATES = [
  { value: "vic", label: "Victoria" },
  { value: "nsw", label: "New South Wales" },
  { value: "qld", label: "Queensland" },
  { value: "sa", label: "South Australia" },
  { value: "wa", label: "Western Australia" },
  { value: "tas", label: "Tasmania" },
  { value: "act", label: "ACT" },
  { value: "nt", label: "Northern Territory" },
];

type Verdict = "legal" | "off-road-only" | "not-road-legal" | "needs-info";

type Reason = { text: string; ok: boolean };

function evaluate(opts: {
  power: number;
  speedCutoff: number;
  throttleMode: string;
  state: string;
}): { verdict: Verdict; reasons: Reason[]; summary: string } {
  const reasons: Reason[] = [];

  // 250W continuous output is the federal pedelec cap. Above that, not
  // road-legal as a standard EPAC anywhere in AU.
  if (opts.power > 250) {
    reasons.push({
      text: `Motor rated ${opts.power}W — exceeds the 250W continuous cap for road-legal pedelecs.`,
      ok: false,
    });
  } else {
    reasons.push({
      text: `Motor rated ${opts.power}W — within the 250W cap.`,
      ok: true,
    });
  }

  // 25 km/h is the speed at which motor assistance must cut out.
  if (opts.speedCutoff > 25) {
    reasons.push({
      text: `Motor assists up to ${opts.speedCutoff} km/h — exceeds the 25 km/h cutoff.`,
      ok: false,
    });
  } else {
    reasons.push({
      text: `Motor cuts out by ${opts.speedCutoff} km/h — within the 25 km/h limit.`,
      ok: true,
    });
  }

  // Throttle handling: most modern EPAC bikes allow only walk-assist
  // (≤6 km/h) when the rider isn't pedalling. Older 200W "PAPC" bikes had
  // looser throttle rules in some states; we flag throttle-only as the
  // common failure mode for newer 250W-class bikes.
  if (opts.throttleMode === "full") {
    reasons.push({
      text: "Throttle works at full speed without pedalling — not road-legal under EPAC rules.",
      ok: false,
    });
  } else if (opts.throttleMode === "walk") {
    reasons.push({
      text: "Throttle limited to walk-assist (6 km/h) — within EPAC rules.",
      ok: true,
    });
  } else {
    reasons.push({
      text: "No throttle — pedal-only assistance is always EPAC-compliant.",
      ok: true,
    });
  }

  const allOk = reasons.every((r) => r.ok);
  if (allOk) {
    return {
      verdict: "legal",
      reasons,
      summary: `Road-legal as a pedelec in ${stateLabel(opts.state)}. Helmet mandatory, no rego or licence needed.`,
    };
  }

  // If only the throttle rule fails, the bike could be made legal in
  // software (limit throttle to walk-assist) on most controllers. Otherwise
  // it's off-road only.
  const onlyThrottle =
    opts.throttleMode === "full" &&
    opts.power <= 250 &&
    opts.speedCutoff <= 25;

  if (onlyThrottle) {
    return {
      verdict: "not-road-legal",
      reasons,
      summary:
        "Not road-legal as configured. Most controllers can be set to walk-assist-only — once the throttle is restricted, the bike becomes road-legal.",
    };
  }

  return {
    verdict: "off-road-only",
    reasons,
    summary:
      "Not road-legal as a pedelec. You can ride it on private property or off-road, but it can't be used on public roads or shared paths.",
  };
}

function stateLabel(value: string): string {
  return STATES.find((s) => s.value === value)?.label ?? value.toUpperCase();
}

export default async function LegalityPage({
  searchParams,
}: {
  searchParams: Promise<{
    state?: string;
    power?: string;
    speed?: string;
    throttle?: string;
  }>;
}) {
  const params = await searchParams;
  const state = params.state ?? "vic";
  const power = Number(params.power ?? "");
  const speed = Number(params.speed ?? "");
  const throttle = params.throttle ?? "none";

  const submitted =
    Number.isFinite(power) && power > 0 && Number.isFinite(speed) && speed > 0;
  const result = submitted
    ? evaluate({ power, speedCutoff: speed, throttleMode: throttle, state })
    : null;

  return (
    <div className="page page--pad" style={{ maxWidth: 720, margin: "0 auto" }}>
      <Link
        href="/tools"
        style={{
          color: "var(--ink-3)",
          fontSize: "var(--t-body-s)",
          textDecoration: "none",
        }}
      >
        ← All tools
      </Link>

      <header style={{ margin: "var(--s-5) 0 var(--s-7)" }}>
        <p className="eyebrow" style={{ margin: 0 }}>
          AU legality check
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--t-h1)",
            color: "var(--ink-1)",
            margin: "var(--s-2) 0 var(--s-3)",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          Is this eBike road-legal here?
        </h1>
        <p style={{ color: "var(--ink-2)", margin: 0, lineHeight: 1.5 }}>
          Australian rules cap pedelecs at 250W continuous and 25 km/h
          motor-assist cutoff, with throttle limited to walk-assist (6 km/h).
          Cross-checks the bike&rsquo;s specs against those rules.
        </p>
      </header>

      <form
        method="get"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--s-3)",
          padding: "var(--s-4)",
          background: "#fff",
          border: "1px solid var(--hairline)",
          borderRadius: 12,
          marginBottom: "var(--s-5)",
        }}
      >
        <Field label="State" wide>
          <select name="state" defaultValue={state} className="input">
            {STATES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Motor power (W continuous)">
          <input
            name="power"
            type="number"
            min="0"
            max="3000"
            step="50"
            placeholder="e.g. 250"
            defaultValue={params.power ?? ""}
            className="input"
            required
          />
        </Field>
        <Field label="Speed cutoff (km/h)">
          <input
            name="speed"
            type="number"
            min="0"
            max="60"
            step="1"
            placeholder="e.g. 25"
            defaultValue={params.speed ?? ""}
            className="input"
            required
          />
        </Field>
        <Field label="Throttle behaviour" wide>
          <select name="throttle" defaultValue={throttle} className="input">
            <option value="none">No throttle (pedal-only)</option>
            <option value="walk">Walk-assist only (6 km/h)</option>
            <option value="full">Full throttle without pedalling</option>
          </select>
        </Field>
        <button
          type="submit"
          className="btn --primary"
          style={{ gridColumn: "1 / -1" }}
        >
          Check legality
        </button>
      </form>

      {result && (
        <ResultPanel
          verdict={result.verdict}
          reasons={result.reasons}
          summary={result.summary}
        />
      )}

      <section
        style={{
          marginTop: "var(--s-7)",
          padding: "var(--s-4)",
          background: "var(--surface-sunken)",
          border: "1px solid var(--hairline)",
          borderRadius: 12,
        }}
      >
        <h2 className="card-heading" style={{ margin: 0 }}>
          Federal pedelec rules
        </h2>
        <ul
          style={{
            marginTop: "var(--s-3)",
            marginBottom: 0,
            paddingLeft: 20,
            color: "var(--ink-2)",
            fontSize: 14,
            lineHeight: 1.6,
            listStyle: "disc outside",
          }}
        >
          <li>
            <strong>250W</strong> continuous (rated) output max
          </li>
          <li>
            Motor assistance must <strong>cut out at 25 km/h</strong>
          </li>
          <li>
            Throttle without pedalling: <strong>walk-assist only (6 km/h)</strong>
          </li>
          <li>
            Helmet <strong>mandatory</strong>, all states
          </li>
          <li>
            <strong>No registration or licence</strong> needed for compliant
            bikes
          </li>
          <li>
            Speed pedelecs (45 km/h cutoff) are <strong>not road-legal</strong>{" "}
            in any Australian state — off-road use only
          </li>
        </ul>
        <p
          style={{
            marginTop: "var(--s-3)",
            marginBottom: 0,
            color: "var(--ink-3)",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          Some states still recognise a separate older 200W
          &ldquo;power-assisted pedal cycle&rdquo; class with looser throttle
          rules. If you&rsquo;re relying on that classification, double-check
          your state transport authority before riding on the road.
        </p>
      </section>
    </div>
  );
}

function ResultPanel({
  verdict,
  reasons,
  summary,
}: {
  verdict: Verdict;
  reasons: Reason[];
  summary: string;
}) {
  const tone =
    verdict === "legal"
      ? { bg: "var(--volt-50)", border: "var(--volt-300)", label: "Road-legal" }
      : verdict === "off-road-only"
        ? {
            bg: "#fff7e6",
            border: "#f5d188",
            label: "Off-road only",
          }
        : { bg: "#fff2f2", border: "#f5c2c2", label: "Not road-legal" };
  return (
    <div
      style={{
        padding: "var(--s-5)",
        background: tone.bg,
        border: `1px solid ${tone.border}`,
        borderRadius: 12,
        marginBottom: "var(--s-5)",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--ink-3)",
        }}
      >
        Verdict
      </p>
      <h2
        style={{
          margin: "var(--s-2) 0",
          fontSize: 28,
          color: "var(--ink-1)",
        }}
      >
        {tone.label}
      </h2>
      <p
        style={{
          margin: 0,
          color: "var(--ink-2)",
          fontSize: 15,
          lineHeight: 1.5,
        }}
      >
        {summary}
      </p>
      <ul
        style={{
          marginTop: "var(--s-4)",
          marginBottom: 0,
          padding: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {reasons.map((r, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              gap: "var(--s-2)",
              alignItems: "flex-start",
              fontSize: 14,
              color: "var(--ink-2)",
              lineHeight: 1.5,
            }}
          >
            <span
              aria-hidden
              style={{
                flex: "0 0 18px",
                color: r.ok ? "var(--volt-700)" : "#a01818",
                fontWeight: 700,
              }}
            >
              {r.ok ? "✓" : "✗"}
            </span>
            <span>{r.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        gridColumn: wide ? "1 / -1" : undefined,
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--ink-3)",
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
