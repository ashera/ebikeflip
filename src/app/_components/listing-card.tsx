import Link from "next/link";
import { Badge, ButtonLink } from "./ui";

export type ListingCardSpec = { k: string; v: string };

export type ListingCardData = {
  id: string;
  title: string;
  subtitle?: string | null;
  price: string;
  loc?: string | null;
  condition?: string | null;
  badge?: string | null;
  classBadge?: string | null;
  categoryBadge?: string | null;
  sellerInitials?: string;
  sellerName?: string | null;
  photo?: string;
  specs: ListingCardSpec[];
};

export type ListingCardRow = {
  id: string;
  title: string;
  price_cents: number;
  seller_email: string | null;
  primary_image_id?: string | null;
  // detail attributes (all optional)
  make_name: string | null;
  model: string | null;
  year: number | null;
  condition_label: string | null;
  bike_class_label: string | null;
  bike_category_label: string | null;
  location_postal: string | null;
  frame_size: string | null;
  frame_style_label: string | null;
  frame_material_label: string | null;
  gender_fit_label: string | null;
  wheel_size_label: string | null;
  suspension_type_label: string | null;
  brake_type_label: string | null;
  motor_brand_name: string | null;
  motor_type_label: string | null;
  motor_watts_nominal: number | null;
  battery_wh: number | null;
  top_speed_mph: number | null;
  range_miles_min: number | null;
  range_miles_max: number | null;
  drive_mode_label: string | null;
  mileage: number | null;
  color: string | null;
  weight_lbs: string | null;
  has_warranty: boolean | null;
};

function initials(email?: string | null): string {
  if (!email) return "??";
  const local = email.split("@")[0] ?? email;
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0]! + parts[1][0]!).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

function compactClass(label: string | null): string | null {
  if (!label) return null;
  const m = label.match(/^Class\s+(\d)/i);
  return m ? `Class ${m[1]}` : label;
}

function fmtNum(n: number | string | null, suffix = ""): string | null {
  if (n === null || n === undefined || n === "") return null;
  const num = typeof n === "string" ? Number(n) : n;
  if (!Number.isFinite(num)) return null;
  return `${num}${suffix}`;
}

function fmtRange(
  min: number | null,
  max: number | null,
  suffix: string,
): string | null {
  if (min == null && max == null) return null;
  if (min != null && max != null && min !== max)
    return `${min}–${max}${suffix}`;
  return `${min ?? max}${suffix}`;
}

function buildSpecs(row: ListingCardRow): ListingCardSpec[] {
  const specs: ListingCardSpec[] = [];
  const motor = [
    fmtNum(row.motor_watts_nominal, " W"),
    row.motor_type_label,
  ]
    .filter(Boolean)
    .join(" · ");
  if (motor) specs.push({ k: "Motor", v: motor });
  if (row.motor_brand_name)
    specs.push({ k: "Motor brand", v: row.motor_brand_name });
  const battery = fmtNum(row.battery_wh, " Wh");
  if (battery) specs.push({ k: "Battery", v: battery });
  const top = fmtNum(row.top_speed_mph, " mph");
  if (top) specs.push({ k: "Top speed", v: top });
  const range = fmtRange(row.range_miles_min, row.range_miles_max, " mi");
  if (range) specs.push({ k: "Range", v: range });
  if (row.drive_mode_label) specs.push({ k: "Drive", v: row.drive_mode_label });
  const mileage = fmtNum(row.mileage, " mi");
  if (mileage) specs.push({ k: "Mileage", v: mileage });
  if (row.frame_size) specs.push({ k: "Frame size", v: row.frame_size });
  if (row.frame_style_label)
    specs.push({ k: "Frame style", v: row.frame_style_label });
  if (row.frame_material_label)
    specs.push({ k: "Material", v: row.frame_material_label });
  if (row.wheel_size_label) specs.push({ k: "Wheels", v: row.wheel_size_label });
  if (row.suspension_type_label)
    specs.push({ k: "Suspension", v: row.suspension_type_label });
  if (row.brake_type_label) specs.push({ k: "Brakes", v: row.brake_type_label });
  if (row.gender_fit_label) specs.push({ k: "Fit", v: row.gender_fit_label });
  if (row.color) specs.push({ k: "Color", v: row.color });
  const weight = fmtNum(row.weight_lbs, " lb");
  if (weight) specs.push({ k: "Weight", v: weight });
  if (row.has_warranty) specs.push({ k: "Warranty", v: "Yes" });
  return specs;
}

export function listingFromRow(row: ListingCardRow): ListingCardData {
  const priceFmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  const sellerName = row.seller_email
    ? row.seller_email.split("@")[0] ?? row.seller_email
    : null;

  const subParts: string[] = [];
  if (row.year) subParts.push(String(row.year));
  if (row.make_name) subParts.push(row.make_name);
  if (row.model) subParts.push(row.model);
  const subtitle = subParts.length > 0 ? subParts.join(" · ") : null;

  return {
    id: row.id,
    title: row.title,
    subtitle,
    price: priceFmt.format(row.price_cents / 100),
    sellerInitials: initials(row.seller_email),
    sellerName,
    loc: row.location_postal,
    condition: row.condition_label,
    classBadge: compactClass(row.bike_class_label),
    categoryBadge: row.bike_category_label,
    photo: row.primary_image_id
      ? `/api/listings/${row.id}/images/${row.primary_image_id}`
      : undefined,
    specs: buildSpecs(row),
  };
}

export function ListingCard({ data }: { data: ListingCardData }) {
  const detailHref = `/listings/${data.id}`;
  return (
    <article className="listing">
      <div className="img-wrap">
        {data.photo ? (
          <div
            className="photo"
            style={{ backgroundImage: `url(${data.photo})` }}
          />
        ) : (
          <div className="img">eBike photo</div>
        )}
        <div className="img-flag">
          {data.classBadge && (
            <Badge variant="volt">{data.classBadge}</Badge>
          )}
          {data.categoryBadge && (
            <Badge variant="ink">{data.categoryBadge}</Badge>
          )}
          {data.condition && (
            <Badge variant="volt-soft">{data.condition}</Badge>
          )}
        </div>
      </div>
      <div className="body">
        <div className="meta-row">
          <div className="seller">
            {data.sellerInitials && (
              <span className="avatar">{data.sellerInitials}</span>
            )}
            {data.sellerName && <span>{data.sellerName}</span>}
          </div>
          {data.loc && <span className="loc">{data.loc}</span>}
        </div>
        <Link href={detailHref} className="title-link">
          <h3 className="title">{data.title}</h3>
        </Link>
        {data.subtitle && <p className="subtitle">{data.subtitle}</p>}
        {data.specs.length > 0 && (
          <dl className="card-specs">
            {data.specs.map((s) => (
              <div key={s.k} className="card-spec">
                <dt>{s.k}</dt>
                <dd>{s.v}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="price-row">
          <div className="price">{data.price}</div>
          <ButtonLink
            href={detailHref}
            variant="dark"
            size="sm"
            iconRight="arrow"
          >
            View details
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
