import { useState } from "react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/vehicles", label: "Vehicles" },
  { to: "/admin/staff", label: "Staff" },
  { to: "/admin/archive", label: "Archive" },
  { to: "/admin/reports", label: "Reports" },
  { to: "/admin/transactions", label: "Transactions" },
  { to: "/admin/messages", label: "Messages" },
];

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function Sidebar({ onLogout, unread = 0 }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <aside className="sidebar">
        <h2 className="sidebar-logo">Webname Admin</h2>

        <nav className="sidebar-nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
            >
              {l.label}
              {l.to === "/admin/messages" && unread > 0 && (
                <span className="sidebar-badge">{unread}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <button className="sidebar-logout" onClick={() => setConfirming(true)}>
          <LogoutIcon />
          <span>Log out</span>
        </button>
      </aside>

      {confirming && (
        <div className="modal-overlay" onClick={() => setConfirming(false)}>
          <div className="modal logout-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Log out?</h3>
            <p className="muted">You'll need to sign in again to access the admin panel.</p>
            <div className="panel-actions">
              <button className="btn-restore-lg" onClick={onLogout}>Log out</button>
              <button className="btn-edit-lg" onClick={() => setConfirming(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}