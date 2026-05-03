import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "eBike vs car: cost calculator · ebikeflip",
  description:
    "Annual running cost: eBike vs car for your commute. Real numbers from RACV 2024 data.",
};

// Annual cost ranges in AUD. Sources/assumptions kept conservative so the
// comparison reads as honest, not as marketing.
const CAR_BASE_LOW = 14000;
const CAR_BASE_HIGH = 18000;

const EBIKE_FIXED_LOW = 400; // electricity + amortised consumables, no battery
const EBIKE_FIXED_HIGH = 600;

// Battery amortisation (~$1000 every 4 years)
const EBIKE_BATTERY_ANNUAL = 250;

function compute(distanceKm: number, daysPerWeek: number) {
  // 50 working weeks per year
  const annualKm = distanceKm * 2 * daysPerWeek * 50;
  // eBike electricity at ~10 Wh/km, $0.30/kWh
  const electricityCost = (annualKm * 10) / 1000 * 0.3;
  const ebikeLow = EBIKE_FIXED_LOW + EBIKE_BATTERY_ANNUAL + electricityCost;
  const ebikeHigh = EBIKE_FIXED_HIGH + EBIKE_BATTERY_ANNUAL + electricityCost;
  const carLow = CAR_BASE_LOW;
  const carHigh = CAR_BASE_HIGH;
  const savingsLow = carLow - ebikeHigh;
  const savingsHigh = carHigh - ebikeLow;
  // Break-even on a $3,000 used eBike, average savings
  const avgSavings = (savingsLow + savingsHigh) / 2;
  const breakEvenMonths = avgSavings > 0 ? (3000 / avgSavings) * 12 : null;
  return {
    annualKm,
    electricityCost,
    ebikeLow,
    ebikeHigh,
    carLow,
    carHigh,
    savingsLow,
    savingsHigh,
    breakEvenMonths,
  };
}

function fmt(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

export default async function CostVsCarPage({
  searchParams,
}: {
  searchParams: Promise<{ distance?: string; days?: string }>;
}) {
  const params = await searchParams;
  const distance = Number(params.distance ?? "");
  const days = Number(params.days ?? "");
  const submitted =
    Number.isFinite(distance) && distance > 0 && Number.isFinite(days) && days > 0;
  const result = submitted ? compute(distance, days) : null;

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
          eBike vs car
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
          What does your commute actually cost?
        </h1>
        <p style={{ color: "var(--ink-2)", margin: 0, lineHeight: 1.5 }}>
          Quick annual running-cost comparison for your specific commute. Car
          numbers anchored to RACV 2024 data for a small-to-medium hatch.
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
        <Field label="One-way commute (km)">
          <input
            name="distance"
            type="number"
            min="1"
            max="100"
            step="0.5"
            placeholder="e.g. 12"
            defaultValue={params.distance ?? ""}
            className="input"
            required
          />
        </Field>
        <Field label="Commute days per week">
          <input
            name="days"
            type="number"
            min="1"
            max="7"
            step="1"
            placeholder="e.g. 5"
            defaultValue={params.days ?? ""}
            className="input"
            required
          />
        </Field>
        <button
          type="submit"
          className="btn --primary"
          style={{ gridColumn: "1 / -1" }}
        >
          Compare costs
        </button>
      </form>

      {result && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "var(--s-3)",
              marginBottom: "var(--s-5)",
            }}
          >
            <CostCard
              label="Car (annual)"
              value={`${fmt(result.carLow)}–${fmt(result.carHigh)}`}
              tone="neutral"
            />
            <CostCard
              label="eBike (annual)"
              value={`${fmt(result.ebikeLow)}–${fmt(result.ebikeHigh)}`}
              tone="ok"
            />
            <CostCard
              label="Annual savings"
              value={`${fmt(result.savingsLow)}–${fmt(result.savingsHigh)}`}
              tone="ok"
            />
          </div>

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
              Your commute, in numbers
            </p>
            <p
              style={{
                margin: "var(--s-2) 0 0",
                color: "var(--ink-1)",
                fontSize: 16,
                lineHeight: 1.6,
              }}
            >
              <strong>{result.annualKm.toLocaleString()} km/year</strong> —
              that&rsquo;s {distance}km × 2 × {days} days × 50 weeks. The
              electricity to ride that distance is{" "}
              <strong>{fmt(result.electricityCost)}/year</strong>.
            </p>
            {result.breakEvenMonths != null && (
              <p
                style={{
                  margin: "var(--s-3) 0 0",
                  color: "var(--ink-2)",
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                A $3,000 used eBike would pay for itself in roughly{" "}
                <strong>
                  {Math.ceil(result.breakEvenMonths)} months
                </strong>{" "}
                of replaced car commutes.
              </p>
            )}
          </div>
        </>
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
          What&rsquo;s in each number
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
            <strong>Car</strong>: $14,000–$18,000/year for a small-to-medium
            hatch (RACV 2024). Includes depreciation, fuel, insurance, rego,
            servicing, tyres.
          </li>
          <li>
            <strong>eBike</strong>: $400–$600/year fixed (chain, brake pads,
            tyres, tubes amortised) + $250/year battery amortisation
            (~$1,000 every 4 years) + electricity (~10 Wh/km at $0.30/kWh).
          </li>
          <li>
            <strong>Not included</strong>: parking, tolls, public-transport
            fares replaced, time saved sitting in traffic. All of these
            usually push the comparison further toward the eBike.
          </li>
        </ul>
      </section>
    </div>
  );
}

function CostCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "ok" | "neutral";
}) {
  const accent =
    tone === "ok"
      ? { bg: "var(--volt-50)", border: "var(--volt-300)" }
      : { bg: "#fff", border: "var(--hairline)" };
  return (
    <div
      style={{
        padding: "var(--s-4)",
        background: accent.bg,
        border: `1px solid ${accent.border}`,
        borderRadius: 12,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--ink-3)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 22,
          fontWeight: 700,
          color: "var(--ink-1)",
        }}
      >
        {value}
      </div>
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
