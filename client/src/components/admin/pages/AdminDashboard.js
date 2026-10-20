import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../api/admin'
import { formatRange } from '../utils'

const label = (s) => s.charAt(0).toUpperCase() + s.slice(1)
const growth = (n) => (n === null ? '' : `${n >= 0 ? '+' : ''}${n}% vs last month`)

export default function AdminDashboard() {
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        api.get('/admin/dashboard')
        .then((res) => setData(res.data))
        .catch((err) => setError(err.response?.data?.message || 'Could not load the dashboard'))
    }, [])

    if (error) return <p>{error}</p>
    if (!data) return <p>Loading...</p>

    const { stats: s, pipeline: p, fleet: f, revenue, recent, archive } = data

    const stats = [
        { label: 'Total reservations', value: s.totalReservations, note: growth(s.reservationGrowth) },
        { label: 'Revenue', value: `₱${s.revenue.toLocaleString()}`, note: growth(s.revenueGrowth) },
        { label: 'Active rentals', value: s.activeRentals, note: `${s.returningToday} returning today` },
        { label: 'Fleet available', value: `${f.available} / ${f.total}`, note: `${f.total - f.available} in use or in service` },
    ]

    const pipeline = [
        { count: p.requested, title: 'Requested', sub: 'Awaiting approval' },
        { count: p.approved, title: 'Approved', sub: 'Pickup scheduled' },
        { count: p.active, title: 'Active rental', sub: 'On the road', highlight: true },
        { count: p.returned, title: 'Returned', sub: 'To be completed' },
        { count: p.completed, title: 'Completed', sub: 'Ready to archive' },
    ]

    const fleet = [
        { label: 'Available', count: f.available, color: '#16a34a' },
        { label: 'Rented', count: f.rented, color: '#8b1a2b' },
        { label: 'Maintenance', count: f.maintenance, color: '#dc2626' },
    ]

    const totalFleet = Math.max(f.total, 1)
    const maxRevenue = Math.max(...revenue.map((r) => r.value), 1)

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
                <div
                  className="bar"
                  title={`₱${(r.value * 1000).toLocaleString()}`}
                  style={{ height: `${r.value > 0 ? Math.max((r.value / maxRevenue) * 100, 3) : 1}%` }}
                />
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
              {recent.map((r) => (
                <tr key={r.id}>
                  <td>#{r.ref}</td>
                  <td>{r.customer}</td>
                  <td>{r.vehicle}</td>
                  <td>{formatRange(r.pickupAt, r.returnAt)}</td>
                  <td><span className={`badge ${r.status}`}>{label(r.status)}</span></td>
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