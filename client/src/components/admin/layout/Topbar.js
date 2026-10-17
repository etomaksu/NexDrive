import { Link, useLocation } from "react-router-dom";

export default function Topbar({
  user = { name: "Carlo Mendoza", role: "Super admin" },
  homePath = "/admin",
}) {
  const { pathname } = useLocation();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <input className="topbar-search" placeholder="Search reservations, users, vehicles" />
      </div>
      <div className="topbar-user">
        <span>{user.name} · {user.role}</span>
        <img src="https://i.pravatar.cc/80?img=12" alt="profile" />
      </div>
    </header>
  );
}