import Link from "next/link";
import type { RefOption } from "@/lib/ref-data";
import { Button, Field, Input } from "./ui";

export type ActiveFilters = {
  q?: string;
  make_id?: string[];
  bike_class_id?: string[];
  bike_category_id?: string[];
  condition_id?: string[];
  min_price?: string;
  max_price?: string;
  min_year?: string;
  max_year?: string;
};

type Props = {
  active: ActiveFilters;
  options: {
    makes: RefOption[];
    classes: RefOption[];
    categories: RefOption[];
    conditions: RefOption[];
  };
};

export function activeFilterCount(f: ActiveFilters): number {
  let n = 0;
  if (f.q) n++;
  if (f.make_id?.length) n++;
  if (f.bike_class_id?.length) n++;
  if (f.bike_category_id?.length) n++;
  if (f.condition_id?.length) n++;
  if (f.min_price) n++;
  if (f.max_price) n++;
  if (f.min_year) n++;
  if (f.max_year) n++;
  return n;
}

function ChipGroup({
  name,
  options,
  selected,
}: {
  name: string;
  options: RefOption[];
  selected: string[] | undefined;
}) {
  const sel = new Set(selected ?? []);
  return (
    <div className="chip-group">
      {options.map((o) => (
        <label key={o.id} className="chip-check">
          <input
            type="checkbox"
            name={name}
            value={o.id}
            defaultChecked={sel.has(o.id)}
          />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
}

export function ListingsFilters({ active, options }: Props) {
  const count = activeFilterCount(active);
  return (
    <details className="filters" open={count > 0}>
      <summary className="filters-summary">
        <span>Filters & search</span>
        {count > 0 && <span className="filters-count">{count} active</span>}
      </summary>

      <form method="get" action="/listings" className="filters-form">
        <Field
          label="Search"
          htmlFor="q"
          help="Matches title, model, make, and description."
        >
          <Input
            id="q"
            name="q"
            type="search"
            placeholder="e.g. Specialized commuter, Bosch, cargo…"
            defaultValue={active.q ?? ""}
            maxLength={120}
          />
        </Field>

        <fieldset className="filter-fieldset">
          <legend>Make</legend>
          <ChipGroup
            name="make_id"
            options={options.makes}
            selected={active.make_id}
          />
        </fieldset>

        <fieldset className="filter-fieldset">
          <legend>Class</legend>
          <ChipGroup
            name="bike_class_id"
            options={options.classes}
            selected={active.bike_class_id}
          />
        </fieldset>

        <fieldset className="filter-fieldset">
          <legend>Category</legend>
          <ChipGroup
            name="bike_category_id"
            options={options.categories}
            selected={active.bike_category_id}
          />
        </fieldset>

        <fieldset className="filter-fieldset">
          <legend>Condition</legend>
          <ChipGroup
            name="condition_id"
            options={options.conditions}
            selected={active.condition_id}
          />
        </fieldset>

        <div className="filters-grid">
          <Field label="Min price ($)" htmlFor="min_price">
            <Input
              id="min_price"
              name="min_price"
              type="number"
              min={0}
              defaultValue={active.min_price ?? ""}
              placeholder="0"
            />
          </Field>
          <Field label="Max price ($)" htmlFor="max_price">
            <Input
              id="max_price"
              name="max_price"
              type="number"
              min={0}
              defaultValue={active.max_price ?? ""}
              placeholder="∞"
            />
          </Field>
          <Field label="Min year" htmlFor="min_year">
            <Input
              id="min_year"
              name="min_year"
              type="number"
              min={1990}
              defaultValue={active.min_year ?? ""}
              placeholder="1990"
            />
          </Field>
          <Field label="Max year" htmlFor="max_year">
            <Input
              id="max_year"
              name="max_year"
              type="number"
              min={1990}
              defaultValue={active.max_year ?? ""}
              placeholder="now"
            />
          </Field>
        </div>

        <div className="filters-actions">
          <Button type="submit" variant="primary" iconRight="arrow">
            Apply
          </Button>
          {count > 0 && (
            <Link href="/listings" className="filters-clear">
              Clear all
            </Link>
          )}
        </div>
      </form>
    </details>
  );
}
