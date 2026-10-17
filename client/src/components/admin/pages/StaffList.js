import { useCallback, useEffect, useState } from "react";
import { Form, Input, Modal, Select, message } from "antd";
import { api } from "../../../api/admin";

const ROLE_LABELS = { customer: "Customer", staff: "Staff", admin: "Admin" };
const STATUS_LABELS = { active: "Active", inactive: "Inactive", blocked: "Blocked" };
const EDITABLE_ROLES = ["staff", "admin"];

const FILTERS = [
  { key: "all", label: "All users", match: () => true },
  { key: "admins", label: "Admins", match: (u) => u.role === "admin" },
  { key: "staff", label: "Staff", match: (u) => u.role === "staff" },
  { key: "customers", label: "Customers", match: (u) => u.role === "customer" },
];

// "Today", "Yesterday", "2 days ago", "Sep 12"
function formatLastActive(iso) {
  if (!iso) return "Never";
  const d = new Date(iso);
  const startOfDay = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const days = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function StaffList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", role: "staff" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addForm] = Form.useForm();

  const loadUsers = useCallback(async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
      setLoadError("");
    } catch (err) {
      setLoadError(err.response?.data?.message || "Could not load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

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

  const handleSave = async () => {
    if (!form.name.trim()) return setError("Full name is required.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Enter a valid email.");

    try {
      setSaving(true);
      // the server rejects role changes on your own account, so only send it when it changed
      const body = { name: form.name, email: form.email };
      if (form.role !== selected.role) body.role = form.role;
      await api.put(`/admin/users/${selectedId}`, body);
      setError("");
      message.success("User updated");
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save the user");
    } finally {
      setSaving(false);
    }
  };

  const toggleBlock = async (u) => {
    try {
      await api.patch(`/admin/users/${u.id}/status`, {
        status: u.status === "blocked" ? "active" : "blocked",
      });
      await loadUsers();
    } catch (err) {
      message.error(err.response?.data?.message || "Could not update the user");
    }
  };

  const archiveUser = async (id) => {
    if (!window.confirm("Archive this user?")) return;
    try {
      await api.patch(`/admin/users/${id}/archive`, { reason: "Archived" });
      message.success("User archived");
      if (selectedId === id) setSelectedId(null);
      await loadUsers();
    } catch (err) {
      message.error(err.response?.data?.message || "Could not archive the user");
    }
  };

  const handleAddUser = () => {
    addForm.resetFields();
    addForm.setFieldsValue({ role: "staff" });
    setAddOpen(true);
  };

  const submitAddUser = async () => {
    try {
      const values = await addForm.validateFields();
      setAdding(true);
      const res = await api.post("/admin/users", values);
      message.success("User added");
      setAddOpen(false);
      await loadUsers();
      setSelectedId(res.data.id);
    } catch (err) {
      if (err.errorFields) return;
      message.error(err.response?.data?.message || "Could not add the user");
    } finally {
      setAdding(false);
    }
  };

  // Role options: Staff + Admin, plus the user's current role so it still displays
  const roleOptions =
    selected && !EDITABLE_ROLES.includes(selected.role)
      ? [selected.role, ...EDITABLE_ROLES]
      : EDITABLE_ROLES;
  const roleLocked = !!selected?.isSelf; // you can't change your own role

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
                  <td><span className={`badge role-${u.role}`}>{ROLE_LABELS[u.role]}</span></td>
                  <td><span className={`badge user-${u.status}`}>{STATUS_LABELS[u.status]}</span></td>
                  <td>{formatLastActive(u.lastActiveAt)}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn-edit" onClick={() => setSelectedId(u.id)}>Edit</button>

                      {!u.isSelf && u.status === "inactive" && (
                        <button className="btn-archive" onClick={() => archiveUser(u.id)}>Archive</button>
                      )}
                      {!u.isSelf && u.status !== "inactive" && (
                        <button className="btn-archive" onClick={() => toggleBlock(u)}>
                          {u.status === "blocked" ? "Unblock" : "Block"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={5} className="empty-row">Loading users...</td>
                </tr>
              )}
              {!loading && loadError && (
                <tr>
                  <td colSpan={5} className="empty-row">{loadError}</td>
                </tr>
              )}
              {!loading && !loadError && visible.length === 0 && (
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
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>

              {error && <p className="form-error">{error}</p>}

              <div className="panel-actions">
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </button>
                {!selected.isSelf && (
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

      {/* ADD USER */}
      <Modal
        title="Add user"
        open={addOpen}
        onOk={submitAddUser}
        onCancel={() => setAddOpen(false)}
        okText="Add user"
        confirmLoading={adding}
        forceRender
      >
        <Form form={addForm} layout="vertical">
          <Form.Item name="name" label="Full name" rules={[{ required: true, message: "Required" }]}>
            <Input placeholder="Liza Ramos" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email", message: "Enter a valid email" }]}
          >
            <Input placeholder="liza@webname.ph" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Temporary password"
            rules={[{ required: true, min: 6, message: "At least 6 characters" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "staff", label: "Staff" },
                { value: "admin", label: "Admin" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}