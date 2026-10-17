import { useEffect, useState } from "react";
import { api } from "../../../api/admin";
import { getPages } from "../utils";

const PAGE_SIZE = 6;
// Today in Manila time (YYYY-MM-DD)
const TODAY = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);

const STATUSES = ["Pending", "Paid", "Refunded", "Failed"];
const METHODS = ["Cash", "Card", "GCash", "Maya"];
const TYPES = ["Downpayment (50%)", "Balance (50%)"];

const PRESETS = [
  { key: "today", label: "Today", days: 0 },
  { key: "7", label: "Last 7 days", days: 7 },
  { key: "30", label: "Last 30 days", days: 30 },
  { key: "custom", label: "Custom" },
];

// Date helpers (UTC-based so timezones never shift the day)
const addDays = (iso, n) => {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const fmt = (iso, withYear) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short", day: "numeric", ...(withYear && { year: "numeric" }), timeZone: "UTC",
  });
const peso = (n) => "₱" + Number(n).toLocaleString();

const DEFAULT_FILTERS = {
  search: "", status: "all", method: "all", type: "all",
  preset: "30", start: addDays(TODAY, -30), end: TODAY,
};
const CLEARED_FILTERS = { ...DEFAULT_FILTERS, preset: "", start: "", end: "" };

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [draft, setDraft] = useState(DEFAULT_FILTERS);     // what's in the form
  const [applied, setApplied] = useState(DEFAULT_FILTERS); // what's actually filtering
  const [newestFirst, setNewestFirst] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    api
      .get("/admin/transactions")
      .then(({ data }) => setTransactions(data))
      .catch((err) => setLoadError(err.response?.data?.message || "Could not load transactions."))
      .finally(() => setLoading(false));
  }, []);

  const setField = (e) => setDraft({ ...draft, [e.target.name]: e.target.value });

  const choosePreset = (p) => {
    if (p.key === "custom") return setDraft({ ...draft, preset: "custom" });
    setDraft({ ...draft, preset: p.key, start: addDays(TODAY, -p.days), end: TODAY });
  };

  const handleDate = (e) =>
    setDraft({ ...draft, [e.target.name]: e.target.value, preset: "custom" });

  const apply = () => { setApplied(draft); setPage(1); };
  const clear = () => { setDraft(CLEARED_FILTERS); setApplied(CLEARED_FILTERS); setPage(1); };
  const removeDateChip = () => {
    const next = { ...applied, preset: "", start: "", end: "" };
    setApplied(next);
    setDraft({ ...draft, preset: "", start: "", end: "" });
    setPage(1);
  };

  const filtered = transactions
    .filter((t) => {
      const q = applied.search.trim().toLowerCase();
      if (q && ![t.id, t.customer, t.booking].some((v) => v.toLowerCase().includes(q))) return false;
      if (applied.status !== "all" && t.status !== applied.status) return false;
      if (applied.method !== "all" && t.method !== applied.method) return false;
      if (applied.type !== "all" && t.type !== applied.type) return false;
      if (applied.start && t.date < applied.start) return false;
      if (applied.end && t.date > applied.end) return false;
      return true;
    })
    .sort((a, b) => {
      const cmp = a.date === b.date ? a.id.localeCompare(b.id) : a.date.localeCompare(b.date);
      return newestFirst ? -cmp : cmp;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);
  const goTo = (p) => { if (p >= 1 && p <= totalPages) setPage(p); };

  const dateChip =
    applied.start || applied.end
      ? `Date: ${applied.start ? fmt(applied.start) : "…"} – ${applied.end ? fmt(applied.end, true) : "…"}`
      : null;

  const handleExport = () => {
    const header = ["Txn ID", "Customer", "Booking", "Payment type", "Method", "Amount", "Status", "Date"];
    const lines = filtered.map((t) =>
      [t.id, t.customer, t.booking, t.type, t.method, t.amount, t.status, t.date]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const url = URL.createObjectURL(new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Transactions</h1>
          <p className="muted">Every booking requires a 50% downpayment. Track balances and refunds here.</p>
        </div>
        <button className="btn-primary" onClick={handleExport}>Export</button>
      </div>

      {/* Filters */}
      <div className="card filters-card">
        <div className="filters-row">
          <div className="field grow">
            <label>Search</label>
            <input
              name="search"
              placeholder="Search txn ID, customer or booking #"
              value={draft.search}
              onChange={setField}
              onKeyDown={(e) => e.key === "Enter" && apply()}
            />
          </div>
          <div className="field">
            <label>Status</label>
            <select name="status" value={draft.status} onChange={setField}>
              <option value="all">All statuses</option>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Payment method</label>
            <select name="method" value={draft.method} onChange={setField}>
              <option value="all">All methods</option>
              {METHODS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Payment type</label>
            <select name="type" value={draft.type} onChange={setField}>
              <option value="all">All types</option>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="filters-row bottom">
          <div className="field">
            <label>Date range</label>
            <div className="filter-pills">
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  className={draft.preset === p.key ? "active" : ""}
                  onClick={() => choosePreset(p)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Start date</label>
            <input type="date" name="start" value={draft.start} max={draft.end || undefined} onChange={handleDate} />
          </div>
          <div className="field">
            <label>End date</label>
            <input type="date" name="end" value={draft.end} min={draft.start || undefined} onChange={handleDate} />
          </div>
          <button className="btn-white" onClick={clear}>Clear filters</button>
          <button className="btn-primary" onClick={apply}>Apply filters</button>
        </div>
      </div>

      {/* Summary line */}
      <div className="summary-row">
        <div className="summary-left">
          <strong>{filtered.length} transactions</strong>
          {dateChip && (
            <span className="chip">
              {dateChip} <button onClick={removeDateChip} aria-label="Remove date filter">×</button>
            </span>
          )}
        </div>
        <button className="sort-btn" onClick={() => setNewestFirst(!newestFirst)}>
          Sort: <strong>{newestFirst ? "Newest first" : "Oldest first"}</strong>
        </button>
      </div>

      {/* Table */}
      <div className="card table-card vehicles-card">
        <table className="vehicles-table">
          <thead>
            <tr>
              <th>Txn ID</th><th>Customer</th><th>Booking</th><th>Payment type</th>
              <th>Method</th><th>Amount</th><th>Status</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} className="empty-row">Loading transactions...</td></tr>
            )}
            {!loading && loadError && (
              <tr><td colSpan={8} className="empty-row">{loadError}</td></tr>
            )}
            {!loading && !loadError && visible.map((t) => (
              <tr key={t.key}>
                <td>{t.id}</td>
                <td className="vehicle-name">{t.customer}</td>
                <td>{t.booking}</td>
                <td>{t.type}</td>
                <td>{t.method}</td>
                <td>{peso(t.amount)}</td>
                <td><span className={`badge txn-${t.status.toLowerCase()}`}>{t.status}</span></td>
                <td>{fmt(t.date)}</td>
              </tr>
            ))}
            {!loading && !loadError && visible.length === 0 && (
              <tr><td colSpan={8} className="empty-row">No transactions match your filters.</td></tr>
            )}
          </tbody>
        </table>

        <div className="table-footer">
          <span className="muted small">
            Showing {filtered.length === 0 ? 0 : start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)} of {filtered.length} transactions
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
    </>
  );
}