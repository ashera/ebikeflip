import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "eBike battery voltage check · ebikeflip",
  description:
    "Quick multimeter check: a used eBike's battery should hit a specific voltage at full charge. Lower than that = tired cells.",
};

type Verdict = "healthy" | "tired" | "gone" | "overvoltage";

type Spec = {
  nominal: number;
  cells: number;
  fullCharge: number;
  worryBelow: number;
  failBelow: number;
};

const SPECS: Record<string, Spec> = {
  "36": { nominal: 36, cells: 10, fullCharge: 42.0, worryBelow: 39.5, failBelow: 38.0 },
  "48": { nominal: 48, cells: 13, fullCharge: 54.6, worryBelow: 51.5, failBelow: 49.5 },
  "52": { nominal: 52, cells: 14, fullCharge: 58.8, worryBelow: 55.5, failBelow: 53.0 },
};

function evaluateVoltage(spec: Spec, measured: number): {
  verdict: Verdict;
  capacityEstimate: string;
  detail: string;
} {
  if (measured > spec.fullCharge + 0.5) {
    return {
      verdict: "overvoltage",
      capacityEstimate: "—",
      detail:
        "Reading is higher than the cells should ever produce. Check your multimeter, the leads, and that you measured at the battery terminals (not after the BMS). If you're sure of the reading, stop charging — overvoltage is a safety risk.",
    };
  }
  if (measured >= spec.fullCharge - 0.5) {
    return {
      verdict: "healthy",
      capacityEstimate: "~95–100%",
      detail:
        "Cells are charging to spec. This battery has plenty of life left.",
    };
  }
  if (measured >= spec.worryBelow) {
    const drop = spec.fullCharge - measured;
    const pct = Math.max(70, 100 - drop * 8);
    return {
      verdict: "tired",
      capacityEstimate: `~${Math.round(pct)}–85%`,
      detail:
        "Cells are reaching a lower peak than they should. Battery still works but range is reduced. Use it for negotiation — a replacement pack is $700–$1,500 for a name-brand bike.",
    };
  }
  if (measured >= spec.failBelow) {
    return {
      verdict: "tired",
      capacityEstimate: "~50–70%",
      detail:
        "Cells are clearly tired. Plan on replacing the battery within 12 months. Factor that into the price.",
    };
  }
  return {
    verdict: "gone",
    capacityEstimate: "<50%",
    detail:
      "Cells are gone. Either the battery was abused (left on the charger constantly, stored flat for months) or it's just old. Walk away or offer a price that assumes a $1,000+ replacement.",
  };
}

export default async function BatteryVoltagePage({
  searchParams,
}: {
  searchParams: Promise<{ nominal?: string; measured?: string }>;
}) {
  const params = await searchParams;
  const nominal = params.nominal ?? "36";
  const spec = SPECS[nominal] ?? SPECS["36"];
  const measuredRaw = params.measured?.trim() ?? "";
  const measured = measuredRaw === "" ? null : Number(measuredRaw);
  const result =
    measured != null && Number.isFinite(measured) && measured > 0
      ? evaluateVoltage(spec, measured)
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
          Battery voltage check
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
          Is this battery actually charged?
        </h1>
        <p style={{ color: "var(--ink-2)", margin: 0, lineHeight: 1.5 }}>
          A healthy Li-ion eBike battery hits a known voltage right off the
          charger. If it doesn&rsquo;t, the cells are tired. 30 seconds with a
          $25 multimeter saves you a $1,000 mistake.
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
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span
            style={{
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--ink-3)",
            }}
          >
            Nominal voltage
          </span>
          <select name="nominal" defaultValue={nominal} className="input">
            <option value="36">36V (10 cells)</option>
            <option value="48">48V (13 cells)</option>
            <option value="52">52V (14 cells)</option>
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span
            style={{
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--ink-3)",
            }}
          >
            Measured at full charge (V)
          </span>
          <input
            name="measured"
            type="number"
            step="0.1"
            min="0"
            max="80"
            placeholder={`e.g. ${spec.fullCharge.toFixed(1)}`}
            defaultValue={measuredRaw}
            className="input"
          />
        </label>
        <button
          type="submit"
          className="btn --primary"
          style={{ gridColumn: "1 / -1" }}
        >
          Check it
        </button>
      </form>

      {result && (
        <ResultCard
          verdict={result.verdict}
          spec={spec}
          measured={measured!}
          capacityEstimate={result.capacityEstimate}
          detail={result.detail}
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
          Voltage spot-check table
        </h2>
        <p
          className="card-sub"
          style={{ marginTop: 4, marginBottom: "var(--s-3)" }}
        >
          What a healthy pack reads at full charge, and where to start worrying.
        </p>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14,
          }}
        >
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th style={{ padding: "8px 12px", color: "var(--ink-3)" }}>
                Nominal
              </th>
              <th style={{ padding: "8px 12px", color: "var(--ink-3)" }}>
                Full charge
              </th>
              <th style={{ padding: "8px 12px", color: "var(--ink-3)" }}>
                Worry below
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.values(SPECS).map((s) => (
              <tr
                key={s.nominal}
                style={{ borderTop: "1px solid var(--hairline)" }}
              >
                <td
                  style={{
                    padding: "8px 12px",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {s.nominal}V
                </td>
                <td
                  style={{
                    padding: "8px 12px",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                  }}
                >
                  {s.fullCharge.toFixed(1)}V
                </td>
                <td
                  style={{
                    padding: "8px 12px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--ink-3)",
                  }}
                >
                  {s.worryBelow.toFixed(1)}V
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p
          style={{
            marginTop: "var(--s-3)",
            marginBottom: 0,
            color: "var(--ink-3)",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          Charge the battery to 100%, leave it on the charger an extra 15
          minutes, then take it off and measure at the battery terminals.
          Reading the voltage on the bike&rsquo;s display doesn&rsquo;t count
          — it can mask a tired pack.
        </p>
      </section>
    </div>
  );
}

function ResultCard({
  verdict,
  spec,
  measured,
  capacityEstimate,
  detail,
}: {
  verdict: Verdict;
  spec: Spec;
  measured: number;
  capacityEstimate: string;
  detail: string;
}) {
  const tone =
    verdict === "healthy"
      ? { bg: "var(--volt-50)", border: "var(--volt-300)", label: "Healthy" }
      : verdict === "tired"
        ? { bg: "#fff7e6", border: "#f5d188", label: "Tired" }
        : verdict === "overvoltage"
          ? { bg: "#fff2f2", border: "#f5c2c2", label: "Check your meter" }
          : { bg: "#fff2f2", border: "#f5c2c2", label: "Cells are gone" };

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
        Your reading: <strong>{measured.toFixed(1)}V</strong> on a {spec.nominal}V
        pack. Healthy is{" "}
        <strong>{spec.fullCharge.toFixed(1)}V at full charge</strong>.
      </p>
      <p
        style={{
          margin: "var(--s-3) 0 0",
          color: "var(--ink-2)",
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        Capacity estimate: <strong>{capacityEstimate}</strong>
      </p>
      <p
        style={{
          margin: "var(--s-3) 0 0",
          color: "var(--ink-2)",
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        {detail}
      </p>
    </div>
  );
}
