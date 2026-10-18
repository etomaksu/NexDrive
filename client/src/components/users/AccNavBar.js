//import "./account-nav.css";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/bookings", label: "My Bookings" },
  { href: "/profile", label: "Profile" },
];

export default function AccountNav({ current, onLogout }) {
  return (
    <nav className="account-nav" aria-label="Account">
      {links.map(({ href, label }) => (
        <a
          key={href}
          href={href}
          aria-current={current === href ? "page" : undefined}
        >
          {label}
        </a>
      ))}

      <button type="button" className="logout" onClick={onLogout}>
        Log out
      </button>
    </nav>
  );
}