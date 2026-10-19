import { useCallback, useEffect, useState } from "react";
import { message } from "antd";
import dayjs from "dayjs";
import { api } from "../../../api/admin";
import { getPages } from "../../admin/utils";
import "../staff.css";

const PER_COLUMN = 2; // cards shown per column on each page

const COLUMNS = [
  { key: "requested", title: "Requested" },
  { key: "approved", title: "Approved" },
  { key: "active", title: "Active rental" },
  { key: "returned", title: "Returned" },
];

const range = (a, b) => {
  const s = dayjs(a), e = dayjs(b);
  return s.month() === e.month() ? `${s.format("MMM D")} – ${e.format("D")}` : `${s.format("MMM D")} – ${e.format("MMM D")}`;
};

export default function StaffReservations() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");
  const [busy, setBusy] = useState(null);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      const res = await api.get("/staff/reservations");
      setRows(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not load reservations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [tab]);

  const move = async (r, status, okText) => {
    try {
      setBusy(r.id);
      const res = await api.patch(`/staff/reservations/${r.id}/status`, { status });
      // completed reservations are archived by the server, so they leave the board
      setRows((list) => status === "completed"
        ? list.filter((x) => x.id !== r.id)
        : list.map((x) => (x.id === r.id ? res.data : x)));
      message.success(okText);
    } catch (err) {
      message.error(err.response?.data?.message || "Could not update the reservation");
    } finally {
      setBusy(null);
    }
  };

  const counts = COLUMNS.reduce((a, c) => ({ ...a, [c.key]: rows.filter((r) => r.status === c.key).length }), {});
  const shown = COLUMNS.filter((c) => tab === "all" || tab === c.key);

  // every column pages together: page N shows cards (N-1)*2+1 .. N*2 of each column
  const perCol = tab === "all" ? PER_COLUMN : PER_COLUMN * 4;
  const totalAll = shown.reduce((n, c) => n + (counts[c.key] || 0), 0);
  const totalPages = Math.max(1, Math.max(...shown.map((c) => Math.ceil((counts[c.key] || 0) / perCol))));
  const currentPage = Math.min(page, totalPages);
  const from = (currentPage - 1) * perCol;
  const goTo = (p) => { if (p >= 1 && p <= totalPages) setPage(p); };
  const pageRows = (key) => rows.filter((r) => r.status === key).slice(from, from + perCol);
  const shownCount = shown.reduce((n, c) => n + pageRows(c.key).length, 0);

  const actions = (r) => {
    const off = busy === r.id;
    const Btn = ({ cls, onClick, children }) => (
      <button className={`rsv-btn ${cls}`} disabled={off} onClick={onClick}>{children}</button>
    );
    switch (r.status) {
      case "requested": return (<>
        <Btn cls="primary" onClick={() => move(r, "approved", `${r.ref} approved`)}>Approve</Btn>
        <Btn cls="danger" onClick={() => move(r, "rejected", `${r.ref} rejected`)}>Reject</Btn>
      </>);
      case "approved": return (<>
        <Btn cls="primary" onClick={() => move(r, "active", "Keys handed over")}>Hand over keys</Btn>
        <Btn cls="light" onClick={() => move(r, "cancelled", `${r.ref} cancelled`)}>Cancel</Btn>
      </>);
      case "active": return <Btn cls="primary" onClick={() => move(r, "returned", "Marked as returned")}>Mark returned</Btn>;
      case "returned": return <Btn cls="primary" onClick={() => move(r, "completed", `${r.ref} completed and archived`)}>Complete</Btn>;
      default: return null;
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Reservations</h1>
          <p className="muted">Track every request from creation to completion</p>
        </div>
      </div>

      <div className="filter-pills">
        <button className={tab === "all" ? "active" : ""} onClick={() => setTab("all")}>All</button>
        {COLUMNS.map((c) => (
          <button key={c.key} className={tab === c.key ? "active" : ""} onClick={() => setTab(c.key)}>
            {c.title === "Active rental" ? "Active" : c.title} {counts[c.key] || 0}
          </button>
        ))}
      </div>

      {loading && <p className="muted">Loading reservations...</p>}
      {!loading && error && <p className="muted">{error}</p>}

      {!loading && !error && (
        <>
          <div className="rsv-board" style={{ gridTemplateColumns: `repeat(${shown.length}, minmax(0, 1fr))` }}>
            {shown.map((col) => (
              <div key={col.key} className="rsv-col">
                <div className="rsv-col-head">
                  <strong>{col.title}</strong>
                  <span className="rsv-count">{counts[col.key] || 0}</span>
                </div>
                {pageRows(col.key).length === 0 && <p className="muted small">Nothing here.</p>}
                {pageRows(col.key).map((r) => (
                  <div key={r.id} className="rsv-card">
                    <div className="rsv-ref">#{r.ref}</div>
                    <div className="rsv-name">{r.customer}</div>
                    <div className="rsv-meta">{r.car} · {range(r.pickupAt, r.returnAt)}</div>
                    <div className="rsv-total">
                      <span>Total</span>
                      <strong>₱{Number(r.total).toLocaleString()}</strong>
                    </div>
                    <div className="rsv-actions">{actions(r)}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="rsv-footer">
            <span className="muted small">
              Showing {shownCount === 0 ? 0 : 1}–{shownCount} of {totalAll} reservations
            </span>
            <div className="pagination">
              <button onClick={() => goTo(currentPage - 1)} disabled={currentPage === 1}>‹</button>
              {getPages(totalPages, currentPage).map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="dots">…</span>
                ) : (
                  <button key={p} className={p === currentPage ? "active" : ""} onClick={() => goTo(p)}>{p}</button>
                )
              )}
              <button onClick={() => goTo(currentPage + 1)} disabled={currentPage === totalPages}>›</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}