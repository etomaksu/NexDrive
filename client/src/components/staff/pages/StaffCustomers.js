import { useCallback, useEffect, useState } from "react";
import { Modal, message } from "antd";
import { api } from "../../../api/admin";

const LICENSE_LABEL = {
  none: "Not submitted",
  verified: "Verified",
  pending: "Pending",
  rejected: "Rejected",
};

export default function StaffCustomers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(null);
  const [licenseView, setLicenseView] = useState(null); // { name, front, back } object URLs

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

  // License photos are private: fetch them with the staff login and show them in a popup
  const viewLicense = async (c) => {
    try {
      const get = (side) =>
        api.get(`/staff/customers/${c.id}/license/${side}`, { responseType: "blob" }).then((r) => URL.createObjectURL(r.data));
      const [front, back] = await Promise.all([get("front"), c.hasBack ? get("back") : Promise.resolve(null)]);
      setLicenseView({ customer: c, name: c.name, front, back });
    } catch (err) {
      message.error("Could not open the license photos.");
    }
  };

  const closeLicense = () => {
    if (licenseView) [licenseView.front, licenseView.back].forEach((u) => u && URL.revokeObjectURL(u));
    setLicenseView(null);
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
                  <td>
                    {c.license === "none"
                      ? <span className="muted small">Not submitted</span>
                      : <span className={`badge license-${c.license}`}>{LICENSE_LABEL[c.license]}</span>}
                  </td>
                  <td>{c.bookings}</td>
                  <td><span className={`badge account-${c.account}`}>{blocked ? "Blocked" : "Active"}</span></td>
                  <td style={{ display: "flex", gap: 6 }}>
                    {c.hasLicense && (
                      <button className={`btn ${c.license === "pending" ? "btn-primary" : "btn-light"}`} disabled={off} onClick={() => viewLicense(c)}>
                        {c.license === "pending" ? "Review license" : "View license"}
                      </button>
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

      <Modal
        title={licenseView ? `${licenseView.name} · Driver's license` : ""}
        open={Boolean(licenseView)}
        onCancel={closeLicense}
        width={720}
        footer={licenseView && (() => {
          const c = licenseView.customer;
          const decide = async (license) => {
            await send(c, "license", { license }, `${c.name}'s license ${license === "verified" ? "approved" : "declined"}`);
            closeLicense();
          };
          return (
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, alignItems: "center" }}>
              <span className={`badge license-${c.license}`} style={{ marginRight: "auto" }}>{LICENSE_LABEL[c.license]}</span>
              <button className="btn btn-light" onClick={closeLicense}>Close</button>
              {c.license !== "rejected" && <button className="btn btn-danger" disabled={busy === c.id} onClick={() => decide("rejected")}>Decline</button>}
              {c.license !== "verified" && <button className="btn btn-primary" disabled={busy === c.id} onClick={() => decide("verified")}>Approve</button>}
            </div>
          );
        })()}
      >
        {licenseView && (
          <div style={{ display: "grid", gap: 12 }}>
            <img src={licenseView.front} alt="License front" style={{ width: "100%", borderRadius: 8 }} />
            {licenseView.back && <img src={licenseView.back} alt="License back" style={{ width: "100%", borderRadius: 8 }} />}
          </div>
        )}
      </Modal>
    </>
  );
}