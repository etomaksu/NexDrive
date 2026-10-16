import { useState } from "react";

// Monthly data (hardcoded for now, replace with your backend later)
const MONTHS = [
  { key: "2026-01", label: "Jan", bookings: 120, revenue: 330000, avgDays: 2.6 },
  { key: "2026-02", label: "Feb", bookings: 135, revenue: 372000, avgDays: 2.7 },
  { key: "2026-03", label: "Mar", bookings: 150, revenue: 415000, avgDays: 2.8 },
  { key: "2026-04", label: "Apr", bookings: 148, revenue: 408000, avgDays: 2.7 },
  { key: "2026-05", label: "May", bookings: 160, revenue: 441000, avgDays: 2.8 },
  { key: "2026-06", label: "Jun", bookings: 190, revenue: 524000, avgDays: 3.0 },
  { key: "2026-07", label: "Jul", bookings: 175, revenue: 482000, avgDays: 2.9 },
  { key: "2026-08", label: "Aug", bookings: 235, revenue: 648000, avgDays: 3.1 },
  { key: "2026-09", label: "Sep", bookings: 221, revenue: 631500, avgDays: 2.9 },
  { key: "2026-10", label: "Oct", bookings: 248, revenue: 684500, avgDays: 3.2 },
];

// Each car's share of total bookings
const CARS = [
  { name: "Toyota Vios", share: 0.185 },
  { name: "Mitsubishi Xpander", share: 0.153 },
  { name: "Toyota Fortuner", share: 0.125 },
  { name: "Honda City", share: 0.097 },
];

const PERIODS = [
  { key: "month", label: "This month" },
  { key: "3months", label: "Last 3 months" },
  { key: "year", label: "This year" },
  { key: "custom", label: "Custom" },
];

const LAST = MONTHS.length - 1;
const peso = (n) => "₱" + Math.round(n).toLocaleString();

// Sum a slice of months into one summary
const summarize = (from, to) => {
  const slice = MONTHS.slice(from, to + 1);
  const bookings = slice.reduce((s, m) => s + m.bookings, 0);
  const revenue = slice.reduce((s, m) => s + m.revenue, 0);
  const avgDays = bookings
    ? slice.reduce((s, m) => s + m.avgDays * m.bookings, 0) / bookings
    : 0;
  return { bookings, revenue, avgDays };
};

const pct = (cur, prev, digits) => {
  const v = ((cur - prev) / prev) * 100;
  return `${v >= 0 ? "+" : ""}${v.toFixed(digits)}%`;
};

export default function Reports() {
  const [period, setPeriod] = useState("month");
  const [customFrom, setCustomFrom] = useState("2026-08");
  const [customTo, setCustomTo] = useState("2026-10");

  // Month range used for the stat cards: [from, to] as indexes into MONTHS
  let range = null;
  if (period === "month") range = [LAST, LAST];
  if (period === "3months") range = [LAST - 2, LAST];
  if (period === "year") range = [0, LAST];
  if (period === "custom") {
    const f = MONTHS.findIndex((m) => m.key === customFrom);
    const t = MONTHS.findIndex((m) => m.key === customTo);
    if (f !== -1 && t !== -1 && f <= t) range = [f, t];
  }

  // The chart shows the last 6 months for "This month", otherwise the same range
  const chartRange = period === "month" ? [LAST - 5, LAST] : range;

  const current = range ? summarize(range[0], range[1]) : null;

  // Compare with the previous period of the same length (if data exists)
  let deltas = null;
  if (range) {
    const len = range[1] - range[0] + 1;
    const prevStart = range[0] - len;
    if (prevStart >= 0) {
      const prev = summarize(prevStart, range[0] - 1);
      const diff = current.avgDays - prev.avgDays;
      deltas = {
        bookings: pct(current.bookings, prev.bookings, 0),
        revenue: pct(current.revenue, prev.revenue, 1),
        avgDays: `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}`,
      };
    }
  }

  const chartMonths = chartRange ? MONTHS.slice(chartRange[0], chartRange[1] + 1) : [];
  const maxBookings = Math.max(...chartMonths.map((m) => m.bookings), 1);

  const cars = current
    ? CARS.map((c) => ({ ...c, rentals: Math.round(current.bookings * c.share) }))
    : [];
  const maxRentals = Math.max(...cars.map((c) => c.rentals), 1);

  const deltaClass = (text) => (text.startsWith("-") ? "negative" : "positive");

  const handleExport = () => {
    if (!range) return;
    const rows = [["Month", "Bookings", "Revenue", "Avg rental length (days)"]];
    MONTHS.slice(range[0], range[1] + 1).forEach((m) =>
      rows.push([m.key, m.bookings, m.revenue, m.avgDays])
    );
    rows.push([]);
    rows.push(["Most rented cars", "Rentals"]);
    cars.forEach((c) => rows.push([c.name, c.rentals]));

    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="page-header">
        <h1>Reports &amp; analytics</h1>
        <button className="btn-primary" onClick={handleExport} disabled={!range}>
          Export CSV
        </button>
      </div>

      {/* Period pills */}
      <div className="filter-pills">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            className={period === p.key ? "active" : ""}
            onClick={() => setPeriod(p.key)}
          >
            {p.label}
          </button>
        ))}

        {period === "custom" && (
          <div className="custom-range">
            <input type="month" value={customFrom} min="2026-01" max="2026-10"
              onChange={(e) => setCustomFrom(e.target.value)} />
            <span className="muted">to</span>
            <input type="month" value={customTo} min="2026-01" max="2026-10"
              onChange={(e) => setCustomTo(e.target.value)} />
          </div>
        )}
      </div>

      {!range ? (
        <div className="card">
          <p className="muted">Pick a valid date range (the start month must not be after the end month).</p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <section className="stat-grid stat-grid-3">
            <div className="card">
              <span className="muted">Bookings</span>
              <div className="stat-value">{current.bookings.toLocaleString()}</div>
              {deltas && <small className={deltaClass(deltas.bookings)}>{deltas.bookings}</small>}
            </div>
            <div className="card">
              <span className="muted">Revenue</span>
              <div className="stat-value">{peso(current.revenue)}</div>
              {deltas && <small className={deltaClass(deltas.revenue)}>{deltas.revenue}</small>}
            </div>
            <div className="card">
              <span className="muted">Avg. rental length</span>
              <div className="stat-value">{current.avgDays.toFixed(1)} days</div>
              {deltas && <small className={deltaClass(deltas.avgDays)}>{deltas.avgDays}</small>}
            </div>
          </section>

          {/* Chart + most rented */}
          <section className="grid-2 reports-grid">
            <div className="card">
              <h3>Bookings per month</h3>
              <div className="bar-chart">
                {chartMonths.map((m) => (
                  <div className="bar-col" key={m.key} title={`${m.label}: ${m.bookings} bookings`}>
                    <div className="bar" style={{ height: `${(m.bookings / maxBookings) * 100}%` }} />
                    <span className="small muted">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3>Most rented cars</h3>
              {cars.map((c) => (
                <div key={c.name} className="fleet-row">
                  <div className="fleet-label">
                    <span>{c.name}</span>
                    <span>{c.rentals} rentals</span>
                  </div>
                  <div className="track">
                    <div
                      className="fill"
                      style={{ width: `${(c.rentals / maxRentals) * 100}%`, background: "#7a1426" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}