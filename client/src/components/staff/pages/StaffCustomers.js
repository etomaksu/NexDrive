import { useCallback, useEffect, useState } from "react";
import { message } from "antd";
import { api } from "../../../api/admin";

const LICENSE_LABEL = { verified: "Verified", pending: "Pending", rejected: "Rejected" };

export default function StaffCustomers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get("/staff/customers");
      setRows(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const send = async (c, path, body, okText) => {
    try {
      setBusy(c.id);
      const res = await api.patch(`/staff/customers/${c.id}/${path}`, body);
      setRows((list) => list.map((x) => (x.id === c.id ? res.data : x)));
      message.success(okText);
    } catch (err) {
      message.error(err.response?.data?.message || "Could not update the customer");
    } finally {
      setBusy(null);
    }
  };

  const q = search.trim().toLowerCase();
  const shown = rows.filter((c) => !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));

  return (
    <>
      <div className="page-header">
        <div><h1>Manage customers</h1></div>
        <input
          className="archive-search"
          placeholder="Search customers"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card table-card">
        <table className="vehicles-table">
          <thead>
            <tr><th>Customer</th><th>Email</th><th>License</th><th>Bookings</th><th>Account</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="empty-row">Loading customers...</td></tr>}
            {!loading && error && <tr><td colSpan={6} className="empty-row">{error}</td></tr>}
            {!loading && !error && shown.map((c) => {
              const off = busy === c.id;
              const blocked = c.account === "blocked";
              return (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td><span className={`badge license-${c.license}`}>{LICENSE_LABEL[c.license]}</span></td>
                  <td>{c.bookings}</td>
                  <td><span className={`badge account-${c.account}`}>{blocked ? "Blocked" : "Active"}</span></td>
                  <td style={{ display: "flex", gap: 6 }}>
                    {c.license === "pending" && (
                      <>
                        <button className="btn btn-primary" disabled={off} onClick={() => send(c, "license", { license: "verified" }, `${c.name}'s license verified`)}>Verify license</button>
                        <button className="btn btn-light" disabled={off} onClick={() => send(c, "license", { license: "rejected" }, `${c.name}'s license rejected`)}>Reject</button>
                      </>
                    )}
                    {c.license === "rejected" && (
                      <button className="btn btn-light" disabled={off} onClick={() => send(c, "license", { license: "verified" }, `${c.name}'s license verified`)}>Review</button>
                    )}
                    {blocked ? (
                      <button className="btn btn-dark" disabled={off} onClick={() => send(c, "status", { status: "active" }, `${c.name} unblocked`)}>Unblock</button>
                    ) : (
                      <button className="btn btn-danger" disabled={off} onClick={() => send(c, "status", { status: "blocked" }, `${c.name} blocked`)}>Block</button>
                    )}
                  </td>
                </tr>
              );
            })}
            {!loading && !error && shown.length === 0 && <tr><td colSpan={6} className="empty-row">No customers found.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}