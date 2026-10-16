import { useEffect, useState } from "react";

const initialUsers = [
  { id: 1, name: "Maria Santos", email: "maria@mail.com", role: "Customer", status: "Active", lastActive: "Today" },
  { id: 2, name: "Juan Dela Cruz", email: "juan@mail.com", role: "Customer", status: "Active", lastActive: "Today" },
  { id: 3, name: "Carlo Mendoza", email: "carlo@webname.ph", role: "Super admin", status: "Active", lastActive: "Today" },
  { id: 4, name: "Liza Ramos", email: "liza@webname.ph", role: "Staff", status: "Active", lastActive: "Yesterday" },
  { id: 5, name: "Ben Torres", email: "ben@webname.ph", role: "Staff", status: "Active", lastActive: "2 days ago" },
  { id: 6, name: "Jenny Lim", email: "jenny@webname.ph", role: "Staff", status: "Inactive", lastActive: "Sep 12" },
];

const EDITABLE_ROLES = ["Staff", "Admin"];

const FILTERS = [
  { key: "all", label: "All users", match: () => true },
  { key: "admins", label: "Admins", match: (u) => u.role === "Admin" || u.role === "Super admin" },
  { key: "staff", label: "Staff", match: (u) => u.role === "Staff" },
  { key: "customers", label: "Customers", match: (u) => u.role === "Customer" },
];

const slug = (text) => text.toLowerCase().replace(/\s+/g, "-");

export default function StaffList() {
  const [users, setUsers] = useState(initialUsers);
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(4); // Liza Ramos open by default, like the design
  const [form, setForm] = useState({ name: "", email: "", role: "Staff" });
  const [error, setError] = useState("");

  const selected = users.find((u) => u.id === selectedId) || null;
  const activeFilter = FILTERS.find((f) => f.key === filter);
  const visible = users.filter(activeFilter.match);

  // Load the selected user's data into the form
  useEffect(() => {
    if (selected) {
      setForm({ name: selected.name, email: selected.email, role: selected.role });
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!form.name.trim()) return setError("Full name is required.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Enter a valid email.");

    // TODO: call your backend here, e.g. PATCH /api/admin/users/:id
    setUsers(users.map((u) => (u.id === selectedId ? { ...u, ...form } : u)));
    setError("");
  };

  const toggleBlock = (id) => {
    // TODO: call your backend (block / unblock)
    setUsers(
      users.map((u) =>
        u.id === id ? { ...u, status: u.status === "Blocked" ? "Active" : "Blocked" } : u
      )
    );
  };

  const archiveUser = (id) => {
    if (!window.confirm("Archive this user?")) return;
    // TODO: call your backend (archive)
    setUsers(users.filter((u) => u.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleAddUser = () => {
    // TODO: open an "Add user" modal or form
    console.log("Add user");
  };

  // Role options: Staff + Admin, plus the user's current role so it still displays
  const roleOptions =
    selected && !EDITABLE_ROLES.includes(selected.role)
      ? [selected.role, ...EDITABLE_ROLES]
      : EDITABLE_ROLES;
  const roleLocked = selected?.role === "Super admin";

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Users &amp; roles</h1>
          <p className="muted">Manage accounts, roles and access permissions</p>
        </div>
        <button className="btn-primary" onClick={handleAddUser}>+ Add user</button>
      </div>

      {/* Filter pills */}
      <div className="filter-pills">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={filter === f.key ? "active" : ""}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="users-layout">
        {/* Users table */}
        <div className="card table-card vehicles-card">
          <table className="vehicles-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((u) => (
                <tr key={u.id} className={u.id === selectedId ? "row-selected" : ""}>
                  <td className="vehicle-name">{u.name}</td>
                  <td><span className={`badge role-${slug(u.role)}`}>{u.role}</span></td>
                  <td><span className={`badge user-${slug(u.status)}`}>{u.status}</span></td>
                  <td>{u.lastActive}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn-edit" onClick={() => setSelectedId(u.id)}>Edit</button>

                      {u.role !== "Super admin" && u.status === "Inactive" && (
                        <button className="btn-archive" onClick={() => archiveUser(u.id)}>Archive</button>
                      )}
                      {u.role !== "Super admin" && u.status !== "Inactive" && (
                        <button className="btn-archive" onClick={() => toggleBlock(u.id)}>
                          {u.status === "Blocked" ? "Unblock" : "Block"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-row">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Edit panel */}
        <div className="card edit-panel">
          {selected ? (
            <>
              <h3>Edit user · {selected.name}</h3>

              <label>Full name</label>
              <input name="name" value={form.name} onChange={handleChange} />

              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} />

              <label>Role</label>
              <select name="role" value={form.role} onChange={handleChange} disabled={roleLocked}>
                {roleOptions.map((r) => (
                  <option key={r} value={r} disabled={!EDITABLE_ROLES.includes(r)}>
                    {r}
                  </option>
                ))}
              </select>

              {error && <p className="form-error">{error}</p>}

              <div className="panel-actions">
                <button className="btn-primary" onClick={handleSave}>Save changes</button>
                {!roleLocked && (
                  <button className="btn-archive-lg" onClick={() => archiveUser(selected.id)}>
                    Archive user
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="muted">Select a user to edit their details.</p>
          )}
        </div>
      </div>
    </>
  );
}