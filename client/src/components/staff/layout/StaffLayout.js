import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../admin/layout/Sidebar";
import Topbar from "../../admin/layout/Topbar";
import "../../admin/admin.css";

export const STAFF_LINKS = [
  { to: "/staff", label: "Dashboard", end: true },
  { to: "/staff/reservations", label: "Reservations" },
  { to: "/staff/vehicles", label: "Vehicles" },
  { to: "/staff/customers", label: "Customers" },
  { to: "/staff/archive", label: "Archive" },
  { to: "/staff/reports", label: "Reports" },
  { to: "/staff/transactions", label: "Transactions" },
  { to: "/staff/messages", label: "Messages", badge: true },
];

export default function StaffLayout({ user, onLogout }) {
  const [unread, setUnread] = useState(0);
  const name = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Staff";

  return (
    <div className="admin-shell">
      <Sidebar title="NexDrive" subtitle="Staff portal" links={STAFF_LINKS} onLogout={onLogout} unread={unread} />
      <div className="admin-main">
        <Topbar user={{ name, role: "Staff" }} homePath="/staff" />
        <main className="admin-content">
          <Outlet context={{ setUnread }} />
        </main>
      </div>
    </div>
  );
}