import Link from "next/link";

export type ListingsView = "cards" | "grid";

type Props = {
  current: ListingsView;
  hrefFor: (view: ListingsView) => string;
};

export function ViewToggle({ current, hrefFor }: Props) {
  return (
    <div className="view-toggle" role="group" aria-label="View">
      <Link
        href={hrefFor("cards")}
        className={`view-toggle-btn ${current === "cards" ? "is-active" : ""}`}
        aria-current={current === "cards" ? "page" : undefined}
      >
        Cards
      </Link>
      <Link
        href={hrefFor("grid")}
        className={`view-toggle-btn ${current === "grid" ? "is-active" : ""}`}
        aria-current={current === "grid" ? "page" : undefined}
      >
        Grid
      </Link>
    </div>
  );
}
