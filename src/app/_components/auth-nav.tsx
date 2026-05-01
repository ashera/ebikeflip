import Link from "next/link";
import { logout } from "@/lib/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { resolveCurrentRegion } from "@/lib/regions";
import { unreadMessageCount } from "@/lib/messages";
import { Button, ButtonLink } from "./ui";
import { MobileMenu } from "./mobile-menu";

async function getDbOk(): Promise<boolean> {
  try {
    await query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

async function getListingCount(): Promise<number | null> {
  try {
    const result = await query<{ n: string }>(
      "SELECT COUNT(*)::text AS n FROM listings",
    );
    return Number(result.rows[0]?.n ?? 0);
  } catch {
    return null;
  }
}

export async function AuthNav() {
  const [user, dbOk, listingCount, region] = await Promise.all([
    getCurrentUser(),
    getDbOk(),
    getListingCount(),
    resolveCurrentRegion(),
  ]);
  const currentRegion =
    region.kind === "selected" || region.kind === "auto" ? region.region : null;
  const unread = user ? await unreadMessageCount(user.id) : 0;

  return (
    <header className="topbar">
      <div className="brand-row">
        <Link href="/" className="brand">
          <span className="brand-mark">eb</span>
          ebikeflip
        </Link>
        <div
          className={`topbar-stats ${dbOk ? "--ok" : "--err"}`}
          title={dbOk ? "Database connected" : "Database unreachable"}
        >
          <span>
            <b>{listingCount ?? "—"}</b> listings
          </span>
          <span className="sep" aria-hidden>
            ·
          </span>
          <span className="dot" aria-hidden />
          <span>{dbOk ? "Live" : "Down"}</span>
        </div>
      </div>

      <MobileMenu>
        <div className="topbar-menu-panel">
          <nav>
            <Link href="/listings">Browse</Link>
            <Link href="/listings/new">Sell</Link>
            {user && <Link href="/listings/mine">My listings</Link>}
            {user && (
              <Link href="/messages" className="nav-messages">
                Messages
                {unread > 0 && (
                  <span className="nav-badge" aria-label={`${unread} unread`}>
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </Link>
            )}
            <Link href="/status">Status</Link>
            {user?.isAdmin && (
              <Link href="/admin" className="nav-admin">
                Admin
              </Link>
            )}
          </nav>

          <div className="actions">
            <Link
              href="/regions/pick"
              className="region-pill"
              title="Click to change region"
            >
              <span>{currentRegion ? currentRegion.label : "Pick region"}</span>
              <span className="region-pill-x" aria-hidden>
                ⌄
              </span>
            </Link>

            {user ? (
              <>
                <Link href="/profile" className="who">
                  {user.email}
                </Link>
                <form action={logout}>
                  <Button type="submit" variant="ghost" size="sm">
                    Log out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <ButtonLink href="/login" variant="ghost" size="sm">
                  Log in
                </ButtonLink>
                <ButtonLink
                  href="/register"
                  variant="dark"
                  size="sm"
                  icon="plus"
                >
                  Register
                </ButtonLink>
              </>
            )}
          </div>
        </div>
      </MobileMenu>
    </header>
  );
}
