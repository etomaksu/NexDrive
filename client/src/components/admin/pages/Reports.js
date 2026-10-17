import { useEffect, useState } from "react";
import { api } from "../../../api/admin";

const PERIODS = [
  { key: "month", label: "This month" },
  { key: "3months", label: "Last 3 months" },
  { key: "year", label: "This year" },
  { key: "custom", label: "Custom" },
];

const peso = (n) => "₱" + Math.round(n).toLocaleString();

// Sum a slice of months into one summary
const summarize = (months, from, to) => {
  const slice = months.slice(from, to + 1);
  const bookings = slice.reduce((s, m) => s + m.bookings, 0);
  const revenue = slice.reduce((s, m) => s + m.revenue, 0);
  const avgDays = bookings
    ? slice.reduce((s, m) => s + m.avgDays * m.bookings, 0) / bookings
    : 0;
  return { bookings, revenue, avgDays };
};

// Returns null when the previous period is 0 (can't compute a percentage)
const pct = (cur, prev, digits) => {
  if (!prev) return null;
  const v = ((cur - prev) / prev) * 100;
  return `${v >= 0 ? "+" : ""}${v.toFixed(digits)}%`;
};

export default function Reports() {
  const [months, setMonths] = useState([]);
  const [carMonths, setCarMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [period, setPeriod] = useState("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  useEffect(() => {
    api
      .get("/admin/reports")
      .then(({ data }) => {
        setMonths(data.months);
        setCarMonths(data.cars);
        const last = data.months.length - 1;
        setCustomFrom(data.months[Math.max(0, last - 2)].key);
        setCustomTo(data.months[last].key);
      })
      .catch((err) => setLoadError(err.response?.data?.message || "Could not load reports."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="muted">Loading reports...</p>;
  if (loadError) return <div className="card"><p className="muted">{loadError}</p></div>;

  const LAST = months.length - 1;
  const minKey = months[0].key;
  const maxKey = months[LAST].key;
  const yearStart = Math.max(0, months.findIndex((m) => m.key.startsWith(maxKey.slice(0, 4))));

  // Month range used for the stat cards: [from, to] as indexes into months
  let range = null;
  if (period === "month") range = [LAST, LAST];
  if (period === "3months") range = [Math.max(0, LAST - 2), LAST];
  if (period === "year") range = [yearStart, LAST];
  if (period === "custom") {
    const f = months.findIndex((m) => m.key === customFrom);
    const t = months.findIndex((m) => m.key === customTo);
    if (f !== -1 && t !== -1 && f <= t) range = [f, t];
  }

  // The chart shows the last 6 months for "This month", otherwise the same range
  const chartRange = period === "month" ? [Math.max(0, LAST - 5), LAST] : range;

  const current = range ? summarize(months, range[0], range[1]) : null;

  // Compare with the previous period of the same length (if data exists)
  let deltas = null;
  if (range) {
    const len = range[1] - range[0] + 1;
    const prevStart = range[0] - len;
    if (prevStart >= 0) {
      const prev = summarize(months, prevStart, range[0] - 1);
      const diff = current.avgDays - prev.avgDays;
      deltas = {
        bookings: pct(current.bookings, prev.bookings, 0),
        revenue: pct(current.revenue, prev.revenue, 1),
        avgDays: `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}`,
      };
    }
  }

  const chartMonths = chartRange ? months.slice(chartRange[0], chartRange[1] + 1) : [];
  const maxBookings = Math.max(...chartMonths.map((m) => m.bookings), 1);

  // Most rented cars in the selected range (top 4)
  let cars = [];
  if (range) {
    const keys = new Set(months.slice(range[0], range[1] + 1).map((m) => m.key));
    const totals = {};
    carMonths.forEach((c) => {
      if (keys.has(c.month)) totals[c.name] = (totals[c.name] || 0) + c.rentals;
    });
    cars = Object.entries(totals)
      .map(([name, rentals]) => ({ name, rentals }))
      .sort((a, b) => b.rentals - a.rentals)
      .slice(0, 4);
  }
  const maxRentals = Math.max(...cars.map((c) => c.rentals), 1);

  const deltaClass = (text) => (text.startsWith("-") ? "negative" : "positive");

  const handleExport = () => {
    if (!range) return;
    const rows = [["Month", "Bookings", "Revenue", "Avg rental length (days)"]];
    months.slice(range[0], range[1] + 1).forEach((m) =>
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
            <input type="month" value={customFrom} min={minKey} max={maxKey}
              onChange={(e) => setCustomFrom(e.target.value)} />
            <span className="muted">to</span>
            <input type="month" value={customTo} min={minKey} max={maxKey}
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
              {deltas?.bookings && <small className={deltaClass(deltas.bookings)}>{deltas.bookings}</small>}
            </div>
            <div className="card">
              <span className="muted">Revenue</span>
              <div className="stat-value">{peso(current.revenue)}</div>
              {deltas?.revenue && <small className={deltaClass(deltas.revenue)}>{deltas.revenue}</small>}
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
              {cars.length === 0 && <p className="muted">No rentals in this period.</p>}
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