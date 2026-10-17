import { useEffect, useState } from "react";
import { getPages } from "../utils";

const PAGE_SIZE = 5;

const TABS = [
  { key: "reservations", label: "Reservations" },
  { key: "vehicles", label: "Vehicles" },
  { key: "users", label: "Users" },
];

const initialData = {
  reservations: [
    { id: 1, record: "#DE-0931", details: "Ford Ranger · Ana Reyes", archivedOn: "2026-06-02", archivedBy: "Liza Ramos", reason: "Completed" },
    { id: 2, record: "#DE-0902", details: "Honda City · Maria Santos", archivedOn: "2026-05-20", archivedBy: "Liza Ramos", reason: "Completed" },
    { id: 3, record: "#DE-0877", details: "Toyota Vios · Paolo Cruz", archivedOn: "2026-05-04", archivedBy: "Carlo Mendoza", reason: "Cancelled" },
    { id: 4, record: "#DE-0851", details: "Toyota Hiace · Ben Torres", archivedOn: "2026-04-18", archivedBy: "Carlo Mendoza", reason: "Completed" },
    { id: 5, record: "#DE-0820", details: "Mitsubishi Xpander · Juan D.", archivedOn: "2026-04-02", archivedBy: "Liza Ramos", reason: "Completed" },
    { id: 6, record: "#DE-0799", details: "Toyota Fortuner · Maria Santos", archivedOn: "2026-03-21", archivedBy: "Carlo Mendoza", reason: "Completed" },
    { id: 7, record: "#DE-0764", details: "Byd Han · Ana Reyes", archivedOn: "2026-03-09", archivedBy: "Liza Ramos", reason: "Cancelled" },
    { id: 8, record: "#DE-0731", details: "Honda City · Ben Torres", archivedOn: "2026-02-26", archivedBy: "Carlo Mendoza", reason: "Completed" },
  ],
  vehicles: [
    { id: 101, record: "NAB 4410", details: "Toyota Innova", archivedOn: "2026-08-14", archivedBy: "Carlo Mendoza", reason: "Sold" },
    { id: 102, record: "CXD 2087", details: "Nissan Almera", archivedOn: "2026-06-30", archivedBy: "Liza Ramos", reason: "Retired" },
    { id: 103, record: "DEF 1193", details: "Suzuki Ertiga", archivedOn: "2026-05-11", archivedBy: "Carlo Mendoza", reason: "Retired" },
  ],
  users: [
    { id: 201, record: "USR-0012", details: "Jenny Lim · Staff", archivedOn: "2026-09-12", archivedBy: "Carlo Mendoza", reason: "Inactive" },
    { id: 202, record: "USR-0009", details: "Rico Alvarez · Customer", archivedOn: "2026-08-02", archivedBy: "Liza Ramos", reason: "Inactive" },
    { id: 203, record: "USR-0007", details: "Dina Cruz · Customer", archivedOn: "2026-07-19", archivedBy: "Liza Ramos", reason: "Requested removal" },
    { id: 204, record: "USR-0004", details: "Tom Reyes · Staff", archivedOn: "2026-06-05", archivedBy: "Carlo Mendoza", reason: "Resigned" },
    { id: 205, record: "USR-0002", details: "Ella Tan · Customer", archivedOn: "2026-04-22", archivedBy: "Liza Ramos", reason: "Inactive" },
  ],
};

const DATE_RANGES = [
  { value: "any", label: "Archived: any time" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "year", label: "This year" },
];

const formatDate = (iso) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

const inRange = (iso, range) => {
  if (range === "any") return true;
  const date = new Date(iso + "T00:00:00");
  if (range === "year") return date.getFullYear() === new Date().getFullYear();
  return (Date.now() - date.getTime()) / 86400000 <= Number(range);
};

export default function Archive({canRestore = true}) {
  const [data, setData] = useState(initialData);
  const [tab, setTab] = useState("reservations");
  const [search, setSearch] = useState("");
  const [range, setRange] = useState("any");
  const [reason, setReason] = useState("all");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState(null);
  const [restoredThisMonth, setRestoredThisMonth] = useState(4);
  const [activeRecords, setActiveRecords] = useState(318);

  const totalArchived = Object.values(data).reduce((sum, list) => sum + list.length, 0);

  // Reset reason + page when the tab changes; reset page when filters change
  useEffect(() => { setReason("all"); }, [tab]);
  useEffect(() => { setPage(1); }, [tab, search, range, reason]);

  const rows = data[tab];
  const reasons = [...new Set(rows.map((r) => r.reason))];

  const filtered = rows.filter((r) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q || [r.record, r.details, r.archivedBy, r.reason].some((v) => v.toLowerCase().includes(q));
    return matchesSearch && inRange(r.archivedOn, range) && (reason === "all" || r.reason === reason);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  const goTo = (p) => { if (p >= 1 && p <= totalPages) setPage(p); };

  const handleRestore = (record) => {
    if (!window.confirm(`Restore ${record.record}?`)) return;
    // TODO: call your backend, e.g. PATCH /api/admin/archive/:type/:id/restore
    setData({ ...data, [tab]: data[tab].filter((r) => r.id !== record.id) });
    setRestoredThisMonth((n) => n + 1);
    setActiveRecords((n) => n + 1);
    setViewing(null);
  };

  const handleExport = () => {
    const header = ["Record", "Details", "Archived on", "Archived by", "Reason"];
    const lines = filtered.map((r) =>
      [r.record, r.details, r.archivedOn, r.archivedBy, r.reason]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header.join(","), ...lines].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `archive-${tab}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Archive</h1>
          <p className="muted">Inactive records kept for reference, separate from active records</p>
        </div>
        <button className="btn-white" onClick={handleExport}>Export archive</button>
      </div>

      {/* Stat cards */}
      <section className="stat-grid stat-grid-3">
        <div className="card">
          <span className="muted">Archived records</span>
          <div className="stat-value">{totalArchived}</div>
          <small className="positive">Kept for reference</small>
        </div>
        <div className="card">
          <span className="muted">Restored this month</span>
          <div className="stat-value">{restoredThisMonth}</div>
          <small className="positive">Moved back to active</small>
        </div>
        <div className="card">
          <span className="muted">Active records</span>
          <div className="stat-value">{activeRecords}</div>
          <small className="positive">Listed in their own pages</small>
        </div>
      </section>

      {/* Tabs */}
      <div className="filter-pills">
        {TABS.map((t) => (
          <button key={t.key} className={tab === t.key ? "active" : ""} onClick={() => setTab(t.key)}>
            {t.label} ({data[t.key].length})
          </button>
        ))}
      </div>

      {/* Search + filters */}
      <div className="archive-filters">
        <input
          className="archive-search"
          placeholder="Search archived records"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="filter-select" value={range} onChange={(e) => setRange(e.target.value)}>
          {DATE_RANGES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <select className="filter-select" value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="all">Reason: all</option>
          {reasons.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card table-card vehicles-card">
        <table className="vehicles-table">
          <thead>
            <tr>
              <th>Record</th>
              <th>Details</th>
              <th>Archived on</th>
              <th>Archived by</th>
              <th>Reason</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id}>
                <td>{r.record}</td>
                <td>{r.details}</td>
                <td>{formatDate(r.archivedOn)}</td>
                <td>{r.archivedBy}</td>
                <td>{r.reason}</td>
                <td>
                  <div className="row-actions">
                    {canRestore && (
                      <button className="btn-restore" onClick={() => handleRestore(r)}>
                        Restore
                      </button>
                    )}
                    <button className="btn-edit" onClick={() => setViewing(r)}>
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-row">No archived records found.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="table-footer">
          <span className="muted small">
            Showing {filtered.length === 0 ? 0 : start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)} of {filtered.length} records
          </span>
          <div className="pagination">
            <button onClick={() => goTo(page - 1)} disabled={page === 1}>‹</button>
            {getPages(totalPages, page).map((p, i) =>
              p === "..." ? (
                <span key={`dots-${i}`} className="dots">…</span>
              ) : (
                <button key={p} className={p === page ? "active" : ""} onClick={() => goTo(p)}>{p}</button>
              )
            )}
            <button onClick={() => goTo(page + 1)} disabled={page === totalPages}>›</button>
          </div>
        </div>
      </div>

      {/* View modal */}
      {viewing && (
        <div className="modal-overlay" onClick={() => setViewing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{viewing.record}</h3>
            <dl>
              <dt>Details</dt><dd>{viewing.details}</dd>
              <dt>Archived on</dt><dd>{formatDate(viewing.archivedOn)}</dd>
              <dt>Archived by</dt><dd>{viewing.archivedBy}</dd>
              <dt>Reason</dt><dd>{viewing.reason}</dd>
            </dl>
            <div className="panel-actions">
              {canRestore && (
                <button className="btn-restore-lg" onClick={() => handleRestore(viewing)}>
                  Restore
                </button>
              )}
              <button className="btn-edit-lg" onClick={() => setViewing(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}