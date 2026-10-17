import { useCallback, useEffect, useState } from "react";
import { Modal, Form, Input, Select, message } from "antd";
import dayjs from "dayjs";
import {api} from "../../../api/admin";

// DB role -> label + badge class (admin reuses your existing red "role-super-admin" badge)
const ROLE_META = {
  customer: { label: "Customer", cls: "role-customer" },
  staff: { label: "Staff", cls: "role-staff" },
  admin: { label: "Admin", cls: "role-super-admin" },
};

const ASSIGNABLE_ROLES = [
  { value: "staff", label: "Staff" },
  { value: "admin", label: "Admin" },
];

const FILTERS = [
  { key: "all", label: "All users", match: () => true },
  { key: "admins", label: "Admins", match: (u) => u.role === "admin" },
  { key: "staff", label: "Staff", match: (u) => u.role === "staff" },
  { key: "customers", label: "Customers", match: (u) => u.role === "customer" },
];

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const formatLastActive = (iso) => {
  if (!iso) return "Never";
  const d = dayjs(iso);
  const days = dayjs().startOf("day").diff(d.startOf("day"), "day");
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return d.format("MMM D");
};

const errMsg = (err, fallback) => err.response?.data?.message || fallback;

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
      const { data } = await api.get("/admin/users");
      setUsers(data);
      setLoadError("");
    } catch (err) {
      setLoadError(errMsg(err, "Could not load users."));
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
  }, [selected]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!/^\S+\s+\S+/.test(form.name.trim())) return setError("Enter first and last name.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Enter a valid email.");

    try {
      setSaving(true);
      await api.put(`/admin/users/${selectedId}`, form);
      message.success("User updated");
      setError("");
      await loadUsers();
    } catch (err) {
      setError(errMsg(err, "Could not save changes."));
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
      message.error(errMsg(err, "Could not update status."));
    }
  };

  const archiveUser = async (id) => {
    if (!window.confirm("Archive this user?")) return;
    try {
      await api.patch(`/admin/users/${id}/archive`, { reason: "Archived" });
      if (selectedId === id) setSelectedId(null);
      await loadUsers();
    } catch (err) {
      message.error(errMsg(err, "Could not archive user."));
    }
  };

  const openAdd = () => {
    addForm.resetFields();
    setAddOpen(true);
  };

  const handleCreate = async (values) => {
    try {
      setAdding(true);
      const { data } = await api.post("/admin/users", {
        ...values,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
      });
      message.success("User created");
      setAddOpen(false);
      await loadUsers();
      setSelectedId(data.id);
    } catch (err) {
      message.error(errMsg(err, "Could not create user."));
    } finally {
      setAdding(false);
    }
  };

  // Customers and your own account can't have their role changed
  const roleLocked = !selected || selected.role === "customer" || selected.isSelf;
  const roleOptions =
    selected?.role === "customer"
      ? [{ value: "customer", label: "Customer" }]
      : ASSIGNABLE_ROLES;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Users &amp; roles</h1>
          <p className="muted">Manage accounts, roles and access permissions</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ Add user</button>
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
              {loading && (
                <tr><td colSpan={5} className="empty-row">Loading users...</td></tr>
              )}
              {!loading && loadError && (
                <tr><td colSpan={5} className="empty-row">{loadError}</td></tr>
              )}
              {!loading && !loadError && visible.map((u) => {
                const meta = ROLE_META[u.role] || { label: cap(u.role), cls: "" };
                return (
                  <tr key={u.id} className={u.id === selectedId ? "row-selected" : ""}>
                    <td className="vehicle-name">{u.name}</td>
                    <td><span className={`badge ${meta.cls}`}>{meta.label}</span></td>
                    <td><span className={`badge user-${u.status}`}>{cap(u.status)}</span></td>
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
                );
              })}
              {!loading && !loadError && visible.length === 0 && (
                <tr><td colSpan={5} className="empty-row">No users found.</td></tr>
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
                  <option key={r.value} value={r.value}>{r.label}</option>
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

      {/* Add user modal */}
      <Modal
        title="Add user"
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        onOk={() => addForm.submit()}
        okText="Create user"
        confirmLoading={adding}
        forceRender
      >
        <Form
          form={addForm}
          layout="vertical"
          initialValues={{ role: "staff" }}
          onFinish={handleCreate}
        >
          <div style={{ display: "flex", gap: 12 }}>

        <Form.Item
          name="firstName"
          label="First name"
          style={{ flex: 1 }}
          rules={[{ required: true, whitespace: true, message: "First name is required" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="lastName"
          label="Last name"
          style={{ flex: 1 }}
          rules={[{ required: true, whitespace: true, message: "Last name is required" }]}
        >
          <Input />
        </Form.Item>
      </div>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select options={ASSIGNABLE_ROLES} />
          </Form.Item>
          <Form.Item
            name="password"
            label="Temporary password"
            rules={[
              { required: true, message: "Password is required" },
              { min: 8, message: "At least 8 characters" },
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}