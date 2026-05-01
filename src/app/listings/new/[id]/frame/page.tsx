import { loadListingRefOptions } from "@/lib/ref-data";
import { saveDraftFrame } from "@/lib/actions/listing-wizard";
import { Field, Input } from "../../../../_components/ui";
import {
  loadDraft,
  StepNav,
  STEP_ERRORS,
  WizardHero,
  WizardShell,
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

export default async function WizardFramePage({
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
    loadDraft(id, "frame"),
    loadListingRefOptions(),
  ]);

  const d: DraftRow = draft;

  return (
    <WizardShell step="frame" draftId={draft.id} errorMessage={errorMessage}>
      <WizardHero
        icon="shield"
        headline="The chassis"
        body="What kind of bike, and how it's built. Class and category are required so buyers can filter — the rest sharpens your match for the right rider."
      />

      <form
        action={saveDraftFrame}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--s-7)",
        }}
      >
        <input type="hidden" name="listingId" value={draft.id} />

        <section className="form-card">
          <h2 className="card-heading">Class &amp; category</h2>
          <p className="card-sub">Required to continue.</p>

          <div className="grid-2">
            <Field label="Class" htmlFor="bike_class_id">
              <Select
                name="bike_class_id"
                options={refs.classes}
                defaultValue={d.bike_class_id}
                required
              />
            </Field>
            <Field label="Category" htmlFor="bike_category_id">
              <Select
                name="bike_category_id"
                options={refs.categories}
                defaultValue={d.bike_category_id}
                required
              />
            </Field>
          </div>
        </section>

        <section className="form-card">
          <h2 className="card-heading">Frame, wheels &amp; brakes</h2>
          <p className="card-sub">All optional — fill in what you know.</p>

          <div className="grid-2">
            <Field label="Frame size" htmlFor="frame_size" help="e.g. M, 17.5″, 52cm.">
              <Input
                id="frame_size"
                name="frame_size"
                maxLength={32}
                defaultValue={d.frame_size ?? ""}
              />
            </Field>
            <Field label="Frame style" htmlFor="frame_style_id">
              <Select
                name="frame_style_id"
                options={refs.frameStyles}
                defaultValue={d.frame_style_id}
              />
            </Field>
          </div>

          <div className="grid-2">
            <Field label="Frame material" htmlFor="frame_material_id">
              <Select
                name="frame_material_id"
                options={refs.frameMaterials}
                defaultValue={d.frame_material_id}
              />
            </Field>
            <Field label="Gender fit" htmlFor="gender_fit_id">
              <Select
                name="gender_fit_id"
                options={refs.genderFits}
                defaultValue={d.gender_fit_id}
              />
            </Field>
          </div>

          <div className="grid-2">
            <Field label="Wheel size" htmlFor="wheel_size_id">
              <Select
                name="wheel_size_id"
                options={refs.wheelSizes}
                defaultValue={d.wheel_size_id}
              />
            </Field>
            <Field label="Suspension" htmlFor="suspension_type_id">
              <Select
                name="suspension_type_id"
                options={refs.suspensionTypes}
                defaultValue={d.suspension_type_id}
              />
            </Field>
          </div>

          <div className="grid-2">
            <Field label="Brakes" htmlFor="brake_type_id">
              <Select
                name="brake_type_id"
                options={refs.brakeTypes}
                defaultValue={d.brake_type_id}
              />
            </Field>
            <Field label="Color" htmlFor="color">
              <Input
                id="color"
                name="color"
                maxLength={32}
                defaultValue={d.color ?? ""}
              />
            </Field>
          </div>
        </section>

        <StepNav prevHref={`/listings/new/${draft.id}/photos`} />
      </form>
    </WizardShell>
  );
}
