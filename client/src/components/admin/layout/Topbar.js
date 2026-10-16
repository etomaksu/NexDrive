


export default function Topbar({ user = { name: "Carlo Mendoza", role: "Super admin" } }) {
  return (
    <header className="topbar">
      <input
        className="topbar-search"
        placeholder="Search reservations, users, vehicles"
      />
      <div className="topbar-user">
        <span>{user.name} · {user.role}</span>
        <img src="https://i.pravatar.cc/80?img=12" alt="profile" />
      </div>
    </header>
  );
}