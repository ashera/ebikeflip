import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "eBike range calculator · ebikeflip",
  description:
    "Estimate real-world eBike range based on battery size, assist level, rider weight, and terrain. Defensible numbers, not marketing.",
};

const ASSIST: Record<string, { label: string; whPerKm: number; note: string }> =
  {
    eco: {
      label: "Eco / low",
      whPerKm: 8,
      note: "Light assist. Best for fitness-focused commuting.",
    },
    medium: {
      label: "Medium / sport",
      whPerKm: 11,
      note: "The default for most commuters most of the time.",
    },
    max: {
      label: "Max / boost",
      whPerKm: 16,
      note: "Full power into hills, headwinds, or just because.",
    },
    throttle: {
      label: "Throttle (no pedalling)",
      whPerKm: 22,
      note: "Throttle-only burns the battery fastest. Most efficient when paired with pedalling.",
    },
  };

const TERRAIN: Record<
  string,
  { label: string; multiplier: number; note: string }
> = {
  flat: { label: "Mostly flat", multiplier: 1.0, note: "Pancake-flat suburbs" },
  rolling: {
    label: "Rolling hills",
    multiplier: 1.15,
    note: "Inner-suburb gradients",
  },
  hilly: {
    label: "Hilly",
    multiplier: 1.35,
    note: "You feel the climbs",
  },
  steep: {
    label: "Steep / mountainous",
    multiplier: 1.6,
    note: "Sustained 8%+ gradients",
  },
};

function computeRange(
  batteryWh: number,
  assistKey: string,
  weightKg: number,
  terrainKey: string,
): {
  rangeLowKm: number;
  rangeHighKm: number;
  whPerKm: number;
  assistLabel: string;
  terrainLabel: string;
} {
  const assist = ASSIST[assistKey] ?? ASSIST.medium;
  const terrain = TERRAIN[terrainKey] ?? TERRAIN.flat;
  // Rider weight: every 10kg above 75kg adds ~5%; below 75kg, no bonus
  // (most modeling assumes ≥75kg as the base).
  const weightFactor = 1 + Math.max(0, (weightKg - 75) / 10) * 0.05;
  const whPerKm = assist.whPerKm * terrain.multiplier * weightFactor;
  // Manufacturer-style range claims usually quote the eco-on-flat best
  // case. Real-world spans ~75–110% of the steady-state estimate, so we
  // show a band rather than a false-precise single number.
  const center = batteryWh / whPerKm;
  return {
    rangeLowKm: Math.max(1, Math.round(center * 0.85)),
    rangeHighKm: Math.round(center * 1.1),
    whPerKm,
    assistLabel: assist.label,
    terrainLabel: terrain.label,
  };
}

export default async function RangeCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{
    battery?: string;
    assist?: string;
    weight?: string;
    terrain?: string;
  }>;
}) {
  const params = await searchParams;
  const battery = Number(params.battery ?? "");
  const weight = Number(params.weight ?? "");
  const assistKey = params.assist ?? "medium";
  const terrainKey = params.terrain ?? "flat";

  const result =
    Number.isFinite(battery) && battery > 0 && Number.isFinite(weight) && weight > 0
      ? computeRange(battery, assistKey, weight, terrainKey)
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
          Range calculator
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
          How far will this eBike actually go?
        </h1>
        <p style={{ color: "var(--ink-2)", margin: 0, lineHeight: 1.5 }}>
          Marketing range claims assume eco assist, flat ground, a 70kg rider,
          and no wind. Plug in your real numbers for an honest estimate.
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
        <Field label="Battery (Wh)">
          <input
            name="battery"
            type="number"
            min="100"
            max="2000"
            step="10"
            placeholder="e.g. 500"
            defaultValue={params.battery ?? ""}
            className="input"
            required
          />
        </Field>
        <Field label="Rider weight (kg)">
          <input
            name="weight"
            type="number"
            min="40"
            max="180"
            step="1"
            placeholder="e.g. 80"
            defaultValue={params.weight ?? ""}
            className="input"
            required
          />
        </Field>
        <Field label="Typical assist level">
          <select name="assist" defaultValue={assistKey} className="input">
            {Object.entries(ASSIST).map(([key, a]) => (
              <option key={key} value={key}>
                {a.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Terrain">
          <select name="terrain" defaultValue={terrainKey} className="input">
            {Object.entries(TERRAIN).map(([key, t]) => (
              <option key={key} value={key}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <button
          type="submit"
          className="btn --primary"
          style={{ gridColumn: "1 / -1" }}
        >
          Estimate range
        </button>
      </form>

      {result && (
        <div
          style={{
            padding: "var(--s-5)",
            background: "var(--volt-50)",
            border: "1px solid var(--volt-300)",
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
            Estimated range
          </p>
          <h2
            style={{
              margin: "var(--s-2) 0",
              fontSize: 36,
              color: "var(--ink-1)",
            }}
          >
            {result.rangeLowKm}&ndash;{result.rangeHighKm} km
          </h2>
          <p
            style={{
              margin: 0,
              color: "var(--ink-2)",
              fontSize: 15,
              lineHeight: 1.5,
            }}
          >
            On a {battery} Wh battery at{" "}
            <strong>{result.assistLabel.toLowerCase()}</strong> assist,{" "}
            {weight}kg rider, on{" "}
            <strong>{result.terrainLabel.toLowerCase()}</strong> terrain.
          </p>
          <p
            style={{
              margin: "var(--s-3) 0 0",
              color: "var(--ink-3)",
              fontSize: 13,
              fontFamily: "var(--font-mono)",
            }}
          >
            ~{result.whPerKm.toFixed(1)} Wh/km
          </p>
        </div>
      )}

      <section
        style={{
          marginTop: "var(--s-5)",
          padding: "var(--s-4)",
          background: "var(--surface-sunken)",
          border: "1px solid var(--hairline)",
          borderRadius: 12,
        }}
      >
        <h2 className="card-heading" style={{ margin: 0 }}>
          Where the numbers come from
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
            Eco assist averages 8 Wh/km, medium 11, max 16, throttle 22.
          </li>
          <li>
            Hills add 15–60% more draw depending on gradient.
          </li>
          <li>
            Every 10kg above 75kg rider weight adds ~5% to consumption.
          </li>
          <li>
            We show a band (±15%) because tyre pressure, headwind, and stop-go
            traffic all swing the real number.
          </li>
        </ul>
      </section>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
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
        {label}
      </span>
      {children}
    </label>
  );
}
