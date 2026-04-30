import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ReferenceDataPage() {
  await requireAdmin();

  return (
    <div className="page admin-page">
      <Link href="/admin" className="back-link">
        ← Admin console
      </Link>

      <header className="admin-header">
        <p className="eyebrow">Admin · Reference data</p>
        <h1>Manage Reference Data</h1>
        <p className="sub">
          Lookup values shared across the app will live here.
        </p>
      </header>

      <div className="empty-state">
        <h3>Nothing here yet</h3>
        <p style={{ margin: 0 }}>
          This page is a placeholder. Reference-data tables will appear here
          once they exist.
        </p>
      </div>
    </div>
  );
}
