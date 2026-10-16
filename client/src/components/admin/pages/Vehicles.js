import { useState } from "react";

const PAGE_SIZE = 6; // change this to 9 to match the rows in your design

const initialVehicles = [
  { id: 1, name: "Toyota Vios", plate: "NBC 1234", type: "Sedan", rate: 1800, status: "Available" },
  { id: 2, name: "Toyota Fortuner", plate: "ABD 5521", type: "SUV", rate: 3500, status: "Rented" },
  { id: 3, name: "Mitsubishi Xpander", plate: "NEO 7810", type: "MPV", rate: 2600, status: "Available" },
  { id: 4, name: "Toyota Hiace", plate: "DAX 3090", type: "Van", rate: 4500, status: "Maintenance" },
  { id: 5, name: "Honda City", plate: "CAB 4418", type: "Sedan", rate: 2000, status: "Available" },
  { id: 6, name: "Ford Ranger", plate: "NFR 6602", type: "Pickup", rate: 3800, status: "Available" },
  { id: 7, name: "Byd Han", plate: "AND 2302", type: "Electric", rate: 7500, status: "Available" },
  { id: 8, name: "Tesla", plate: "CES 2349", type: "Electric", rate: 9800, status: "Rented" },
  { id: 9, name: "Hyundai Accent", plate: "NHD 6403", type: "Sedan", rate: 2300, status: "Rented" },
];

// Builds [1, 2, 3, "...", 6] style page lists
const getPages = (total, current) => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, 2, 3, total, current]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("...");
    result.push(p);
  });
  return result;
};

export default function Vehicles() {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(vehicles.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const visible = vehicles.slice(start, start + PAGE_SIZE);

  const handleAdd = () => {
    // TODO: open an "Add vehicle" modal or navigate to a form
    console.log("Add vehicle");
  };

  const handleEdit = (vehicle) => {
    // TODO: open an edit modal with this vehicle's data
    console.log("Edit", vehicle);
  };

  const handleArchive = (id) => {
    if (!window.confirm("Archive this vehicle?")) return;
    // TODO: call your backend here, then update state
    const updated = vehicles.filter((v) => v.id !== id);
    setVehicles(updated);
    const newTotal = Math.max(1, Math.ceil(updated.length / PAGE_SIZE));
    if (page > newTotal) setPage(newTotal);
  };

  const goTo = (p) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  return (
    <>
      <div className="page-header">
        <h1>Manage vehicles</h1>
        <button className="btn-primary" onClick={handleAdd}>+ Add vehicle</button>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((v) => (
              <tr key={v.id}>
                <td className="vehicle-name">{v.name}</td>
                <td>{v.plate}</td>
                <td>{v.type}</td>
                <td>₱{v.rate.toLocaleString()}</td>
                <td>
                  <span className={`badge status-${v.status.toLowerCase()}`}>{v.status}</span>
                </td>
                <td>
                  <div className="row-actions">
                    <button className="btn-edit" onClick={() => handleEdit(v)}>Edit</button>
                    <button className="btn-archive" onClick={() => handleArchive(v.id)}>Archive</button>
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-row">No vehicles found.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="table-footer">
          <span className="muted small">
            Showing {vehicles.length === 0 ? 0 : start + 1}–{Math.min(start + PAGE_SIZE, vehicles.length)} of {vehicles.length} vehicles
          </span>

          <div className="pagination">
            <button onClick={() => goTo(page - 1)} disabled={page === 1}>‹</button>
            {getPages(totalPages, page).map((p, i) =>
              p === "..." ? (
                <span key={`dots-${i}`} className="dots">…</span>
              ) : (
                <button
                  key={p}
                  className={p === page ? "active" : ""}
                  onClick={() => goTo(p)}
                >
                  {p}
                </button>
              )
            )}
            <button onClick={() => goTo(page + 1)} disabled={page === totalPages}>›</button>
          </div>
        </div>
      </div>
    </>
  );
}