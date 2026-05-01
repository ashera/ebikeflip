import { loadListingRefOptions } from "@/lib/ref-data";
import { saveDraftMotor } from "@/lib/actions/listing-wizard";
import { Field, Input } from "../../../../_components/ui";
import {
  loadDraft,
  StepNav,
  STEP_ERRORS,
  WizardHero,
  WizardShell,
  WizardTip,
  type DraftRow,
} from "../_wizard";
import type { RefOption } from "@/lib/ref-data";

export const dynamic = "force-dynamic";

function Select({
  name,
  options,
  defaultValue,
  required,
  placeholder = "—",
}: {
  name: string;
  options: RefOption[];
  defaultValue?: string | null;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <select
      className="input"
      name={name}
      defaultValue={defaultValue ?? ""}
      required={required}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function nstr(v: number | string | null | undefined): string {
  if (v == null) return "";
  return String(v);
}

export default async function WizardMotorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const errorMessage = error ? STEP_ERRORS[error] ?? null : null;

  const [{ draft }, refs] = await Promise.all([
    loadDraft(id, "motor"),
    loadListingRefOptions(),
  ]);

  const d: DraftRow = draft;

  return (
    <WizardShell step="motor" draftId={draft.id} errorMessage={errorMessage}>
      <WizardHero
        icon="bolt"
        headline="The system that does the work"
        body="Buyers obsess over motor brand, battery size, and real-world range. Every spec you fill in is another way your bike surfaces in their search."
      />

      <form
        action={saveDraftMotor}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--s-7)",
        }}
      >
        <input type="hidden" name="listingId" value={draft.id} />

        <section className="form-card">
          <h2 className="card-heading">Motor</h2>
          <p className="card-sub">All optional.</p>

          <div className="grid-2">
            <Field label="Motor brand" htmlFor="motor_brand_id">
              <Select
                name="motor_brand_id"
                options={refs.motorBrands}
                defaultValue={d.motor_brand_id}
              />
            </Field>
            <Field label="Motor type" htmlFor="motor_type_id">
              <Select
                name="motor_type_id"
                options={refs.motorTypes}
                defaultValue={d.motor_type_id}
              />
            </Field>
          </div>

          <div className="grid-2">
            <Field label="Motor watts (nominal)" htmlFor="motor_watts_nominal">
              <Input
                id="motor_watts_nominal"
                name="motor_watts_nominal"
                type="number"
                min={50}
                max={3000}
                defaultValue={nstr(d.motor_watts_nominal)}
              />
            </Field>
            <Field label="Top speed (km/h)" htmlFor="top_speed_mph">
              <Input
                id="top_speed_mph"
                name="top_speed_mph"
                type="number"
                min={0}
                max={100}
                defaultValue={nstr(d.top_speed_mph)}
              />
            </Field>
          </div>

          <Field label="Drive mode" htmlFor="drive_mode_id">
            <Select
              name="drive_mode_id"
              options={refs.driveModes}
              defaultValue={d.drive_mode_id}
            />
          </Field>
        </section>

        <section className="form-card">
          <h2 className="card-heading">Battery &amp; range</h2>
          <p className="card-sub">All optional, but the data buyers want most.</p>
          <WizardTip>
            Pop the battery — most have a sticker with Wh and voltage. Five
            minutes here saves a week of &ldquo;what&rsquo;s the range?&rdquo;
            messages.
          </WizardTip>

          <div className="grid-2">
            <Field label="Battery (Wh)" htmlFor="battery_wh">
              <Input
                id="battery_wh"
                name="battery_wh"
                type="number"
                min={50}
                max={5000}
                defaultValue={nstr(d.battery_wh)}
              />
            </Field>
            <Field label="Mileage on the bike (km)" htmlFor="mileage">
              <Input
                id="mileage"
                name="mileage"
                type="number"
                min={0}
                max={160000}
                defaultValue={nstr(d.mileage)}
              />
            </Field>
          </div>

          <div className="grid-2">
            <Field label="Range — min (km)" htmlFor="range_miles_min">
              <Input
                id="range_miles_min"
                name="range_miles_min"
                type="number"
                min={0}
                max={600}
                defaultValue={nstr(d.range_miles_min)}
              />
            </Field>
            <Field label="Range — max (km)" htmlFor="range_miles_max">
              <Input
                id="range_miles_max"
                name="range_miles_max"
                type="number"
                min={0}
                max={600}
                defaultValue={nstr(d.range_miles_max)}
              />
            </Field>
          </div>

          <Field label="Weight (kg)" htmlFor="weight_lbs">
            <Input
              id="weight_lbs"
              name="weight_lbs"
              type="number"
              step="0.1"
              min={0}
              max={250}
              defaultValue={d.weight_lbs ?? ""}
            />
          </Field>
        </section>

        <StepNav prevHref={`/listings/new/${draft.id}/frame`} />
      </form>
    </WizardShell>
  );
}
