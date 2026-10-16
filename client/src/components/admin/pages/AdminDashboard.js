const stats = [
  { label: "Total reservations", value: "248", note: "+12% vs last month" },
  { label: "Revenue", value: "₱684,500", note: "+8.4%" },
  { label: "Active rentals", value: "31", note: "5 returning today" },
  { label: "Fleet available", value: "42 / 60", note: "18 in use or in service" },
];

const pipeline = [
  { count: 12, title: "Requested", sub: "Awaiting approval" },
  { count: 9, title: "Approved", sub: "Pickup scheduled" },
  { count: 31, title: "Active rental", sub: "On the road", highlight: true },
  { count: 7, title: "Returned", sub: "To be completed" },
  { count: 189, title: "Completed", sub: "Ready to archive" },
];

const revenue = [
  { month: "May", value: 40 },
  { month: "Jun", value: 55 },
  { month: "Jul", value: 47 },
  { month: "Aug", value: 70 },
  { month: "Sep", value: 63 },
  { month: "Oct", value: 85 },
];

const fleet = [
  { label: "Available", count: 42, color: "#16a34a" },
  { label: "Rented", count: 13, color: "#8b1a2b" },
  { label: "Maintenance", count: 5, color: "#dc2626" },
];

const reservations = [
  { ref: "#DE-1058", customer: "Maria Santos", vehicle: "Honda City", dates: "Oct 28 – 30", stage: "Requested" },
  { ref: "#DE-1051", customer: "Juan Dela Cruz", vehicle: "Toyota Fortuner", dates: "Oct 10 – 13", stage: "Approved" },
  { ref: "#DE-1049", customer: "Ana Reyes", vehicle: "Toyota Vios", dates: "Oct 5 – 7", stage: "Active" },
  { ref: "#DE-1047", customer: "Paolo Cruz", vehicle: "Ford Ranger", dates: "Oct 3 – 6", stage: "Returned" },
];

export default function AdminDashboard() {
  const totalFleet = fleet.reduce((sum, f) => sum + f.count, 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Overview of reservations, fleet and revenue</p>
        </div>
        <button className="btn-primary">Export report</button>
      </div>

      {/* Stat cards */}
      <section className="stat-grid">
        {stats.map((s) => (
          <div className="card" key={s.label}>
            <span className="muted">{s.label}</span>
            <div className="stat-value">{s.value}</div>
            <small className="positive">{s.note}</small>
          </div>
        ))}
      </section>

      {/* Pipeline */}
      <section className="card">
        <h3>Reservation pipeline</h3>
        <div className="pipeline">
          {pipeline.map((p, i) => (
            <div key={p.title} className="pipeline-item">
              <div className={"pipeline-box" + (p.highlight ? " highlight" : "")}>
                <div className="pipeline-count">{p.count}</div>
                <strong>{p.title}</strong>
                <div className="muted small">{p.sub}</div>
              </div>
              {i < pipeline.length - 1 && <span className="arrow">›</span>}
            </div>
          ))}
        </div>
      </section>

      {/* Revenue + Fleet status */}
      <section className="grid-2">
        <div className="card">
          <h3>Revenue (₱ thousands)</h3>
          <div className="bar-chart">
            {revenue.map((r) => (
              <div className="bar-col" key={r.month}>
                <div className="bar" style={{ height: `${r.value}%` }} />
                <span className="small muted">{r.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Fleet status</h3>
          {fleet.map((f) => (
            <div key={f.label} className="fleet-row">
              <div className="fleet-label">
                <span>{f.label}</span>
                <span>{f.count}</span>
              </div>
              <div className="track">
                <div
                  className="fill"
                  style={{ width: `${(f.count / totalFleet) * 100}%`, background: f.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent reservations + Archive */}
      <section className="grid-2 bottom">
        <div className="card table-card">
          <h3>Recent reservations</h3>
          <table>
            <thead>
              <tr>
                <th>Ref</th><th>Customer</th><th>Vehicle</th><th>Dates</th><th>Stage</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.ref}>
                  <td>{r.ref}</td>
                  <td>{r.customer}</td>
                  <td>{r.vehicle}</td>
                  <td>{r.dates}</td>
                  <td><span className={`badge ${r.stage.toLowerCase()}`}>{r.stage}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>Archive</h3>
          <p className="muted small">Records kept for reference, separate from active ones.</p>
          <div className="archive-row"><span>Reservations</span><strong>42</strong></div>
          <div className="archive-row"><span>Vehicles</span><strong>3</strong></div>
          <div className="archive-row"><span>Users</span><strong>5</strong></div>
          <button className="btn-outline">Open archive</button>
        </div>
      </section>
    </>
  );
}