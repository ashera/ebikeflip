import { loadListingRefOptions } from "@/lib/ref-data";
import {
  deleteDraftImage,
  saveDraftPhotos,
} from "@/lib/actions/listing-wizard";
import { query } from "@/lib/db";
import { Field, Input } from "../../../../_components/ui";
import {
  loadDraft,
  StepNav,
  STEP_ERRORS,
  WizardHero,
  WizardShell,
  WizardTip,
} from "../_wizard";

export const dynamic = "force-dynamic";

const CURRENT_YEAR = new Date().getUTCFullYear();

type DraftImageRow = {
  id: string;
  is_primary: boolean;
  position: number;
};

async function fetchDraftImages(listingId: string): Promise<DraftImageRow[]> {
  try {
    const r = await query<DraftImageRow>(
      `SELECT id::text, is_primary, position
         FROM listing_images
        WHERE listing_id = $1::bigint
        ORDER BY is_primary DESC, position, id`,
      [listingId],
    );
    return r.rows;
  } catch {
    return [];
  }
}

export default async function WizardPhotosPage({
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
    loadDraft(id, "photos"),
    loadListingRefOptions(),
  ]);
  const images = await fetchDraftImages(draft.id);

  return (
    <WizardShell step="photos" draftId={draft.id} errorMessage={errorMessage}>
      <WizardHero
        icon="camera"
        headline="Lead with a great photo"
        body="Listings with a clean hero shot get roughly twice the inquiries. Shoot the drive side in daylight, against a plain wall — no clutter, no garage door."
      />

      {images.length > 0 && (
        <section className="form-card" style={{ marginBottom: "var(--s-5)" }}>
          <h2 className="card-heading">Already uploaded</h2>
          <p className="card-sub">
            {images.length === 1
              ? "1 photo on this listing."
              : `${images.length} photos on this listing.`}{" "}
            Add more below, or remove one if it&rsquo;s wrong.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: "var(--s-3)",
              marginTop: "var(--s-3)",
            }}
          >
            {images.map((img) => (
              <div
                key={img.id}
                style={{
                  position: "relative",
                  borderRadius: 10,
                  overflow: "hidden",
                  border: "1px solid var(--line, #e9e5df)",
                  background: "var(--surface-2, #f7f6f3)",
                  aspectRatio: "1 / 1",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <img
                  src={`/api/listings/${draft.id}/images/${img.id}`}
                  alt=""
                  style={{
                    width: "100%",
                    flex: "1 1 auto",
                    objectFit: "cover",
                    minHeight: 0,
                  }}
                />
                {img.is_primary && (
                  <span
                    style={{
                      position: "absolute",
                      top: 6,
                      left: 6,
                      background: "var(--ink-1)",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      padding: "3px 7px",
                      borderRadius: 999,
                      textTransform: "uppercase",
                    }}
                  >
                    Default
                  </span>
                )}
                <form
                  action={deleteDraftImage}
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                  }}
                >
                  <input type="hidden" name="listingId" value={draft.id} />
                  <input type="hidden" name="imageId" value={img.id} />
                  <button
                    type="submit"
                    title="Remove this photo"
                    style={{
                      width: 26,
                      height: 26,
                      border: 0,
                      borderRadius: "50%",
                      background: "rgba(28, 24, 22, 0.7)",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: 14,
                      lineHeight: 1,
                    }}
                  >
                    ✕
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>
      )}

      <form
        action={saveDraftPhotos}
        encType="multipart/form-data"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--s-7)",
        }}
      >
        <input type="hidden" name="listingId" value={draft.id} />

        <section className="form-card">
          <h2 className="card-heading">
            {images.length > 0 ? "Add more photos" : "Photos"}
          </h2>
          <p className="card-sub">
            Up to 10 · JPEG, PNG, WebP · 5 MB each. The first one becomes
            the default — pick the one you&rsquo;d want a buyer to see first.
          </p>
          <Field label="Add photos" htmlFor="images">
            <input
              id="images"
              type="file"
              name="images"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="file-input"
            />
          </Field>
          <WizardTip>
            Five photos beats ten blurry ones. A drive-side hero, the cockpit,
            the motor, the battery, and any wear is plenty.
          </WizardTip>
        </section>

        <section className="form-card">
          <h2 className="card-heading">Bike basics</h2>
          <p className="card-sub">
            All three are required. Your listing title is built automatically
            from these — e.g. &ldquo;2024 Trek Allant+ 7&rdquo;.
          </p>

          <Field label="Make" htmlFor="make_id">
            <select
              id="make_id"
              name="make_id"
              className="input"
              defaultValue={draft.make_id ?? ""}
              required
            >
              <option value="">Select a make</option>
              {refs.makes.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid-2">
            <Field
              label="Model"
              htmlFor="model"
              help="Free text — e.g. Turbo Vado 4.0."
            >
              <Input
                id="model"
                name="model"
                required
                maxLength={100}
                defaultValue={draft.model ?? ""}
              />
            </Field>
            <Field label="Year" htmlFor="year">
              <Input
                id="year"
                name="year"
                type="number"
                required
                min={2000}
                max={CURRENT_YEAR + 1}
                defaultValue={
                  draft.year != null ? String(draft.year) : ""
                }
              />
            </Field>
          </div>
        </section>

        <StepNav />
      </form>
    </WizardShell>
  );
}
