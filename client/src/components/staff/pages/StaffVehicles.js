import { useCallback, useEffect, useState } from "react";
import { message } from "antd";
import { api } from "../../../api/admin";
import { getPages } from "../../admin/utils";

const PAGE_SIZE = 8;

const STATUSES = [
  { value: "available", label: "Available" },
  { value: "rented", label: "Rented" },
  { value: "maintenance", label: "Maintenance" },
];

const FILTERS = [{ value: "all", label: "All" }, ...STATUSES];

// Pictures are served by the API server, outside the /api path
const FILE_BASE = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");

export default function StaffVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [savingId, setSavingId] = useState(null);

  const loadVehicles = useCallback(async () => {
    try {
      const res = await api.get("/admin/cars");
      setVehicles(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not load vehicles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  useEffect(() => { setPage(1); }, [filter, search]);

  const counts = vehicles.reduce(
    (acc, v) => ({ ...acc, [v.status]: (acc[v.status] || 0) + 1 }),
    {}
  );

  const filtered = vehicles.filter((v) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q || [v.name, v.plate, v.type].some((x) => String(x ?? "").toLowerCase().includes(q));
    return matchesSearch && (filter === "all" || v.status === filter);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);
  const goTo = (p) => { if (p >= 1 && p <= totalPages) setPage(p); };

  const changeStatus = async (vehicle, status) => {
    if (status === vehicle.status) return;
    try {
      setSavingId(vehicle.id);
      await api.patch(`/admin/cars/${vehicle.id}/status`, { status });
      setVehicles((list) => list.map((v) => (v.id === vehicle.id ? { ...v, status } : v)));
      message.success(`${vehicle.name} is now ${status}`);
    } catch (err) {
      message.error(err.response?.data?.message || "Could not update the status");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Vehicles</h1>
          <p className="muted">See the fleet and update each vehicle's availability</p>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="filter-pills">
        {FILTERS.map((f) => (
          <button key={f.value} className={filter === f.value ? "active" : ""} onClick={() => setFilter(f.value)}>
            {f.label} ({f.value === "all" ? vehicles.length : counts[f.value] || 0})
          </button>
        ))}
      </div>

      <div className="archive-filters">
        <input
          className="archive-search"
          placeholder="Search by name, plate or type"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card table-card vehicles-card">
        <table className="vehicles-table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Plate</th>
              <th>Type</th>
              <th>Rate / day</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="empty-row">Loading vehicles...</td></tr>
            )}
            {!loading && error && (
              <tr><td colSpan={5} className="empty-row">{error}</td></tr>
            )}
            {!loading && !error && visible.map((v) => (
              <tr key={v.id}>
                <td className="vehicle-name">
                  {v.imageUrl && (
                    <img
                      src={`${FILE_BASE}${v.imageUrl}`}
                      alt=""
                      style={{ width: 44, height: 30, objectFit: "cover", borderRadius: 4, marginRight: 10, verticalAlign: "middle" }}
                    />
                  )}
                  {v.name}
                </td>
                <td>{v.plate || "—"}</td>
                <td>{v.type}</td>
                <td>₱{Number(v.price).toLocaleString()}</td>
                <td>
                  <select
                    className={`filter-select status-select status-${v.status}`}
                    value={v.status}
                    disabled={savingId === v.id}
                    onChange={(e) => changeStatus(v, e.target.value)}
                    aria-label={`Status of ${v.name}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {!loading && !error && visible.length === 0 && (
              <tr><td colSpan={5} className="empty-row">No vehicles found.</td></tr>
            )}
          </tbody>
        </table>

        <div className="table-footer">
          <span className="muted small">
            Showing {filtered.length === 0 ? 0 : start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)} of {filtered.length} vehicles
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
      </div>
    </>
  );
}