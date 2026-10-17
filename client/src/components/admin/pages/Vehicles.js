import { useCallback, useEffect, useState } from "react";
import { Col, Form, Input, InputNumber, Modal, Row, Select, message } from "antd";
import { api } from "../../../api/admin";
import { getPages } from "../utils";

const PAGE_SIZE = 6; // change this to 9 to match the rows in your design

const TYPES = ["Sedan", "SUV", "MPV", "Van", "Pickup", "Hatchback"];
const TRANSMISSIONS = ["Automatic", "Manual"];
const FUELS = ["Gas", "Diesel", "Electric"];
const STATUSES = [
  { value: "available", label: "Available" },
  { value: "rented", label: "Rented" },
  { value: "maintenance", label: "Maintenance" },
];

const toOptions = (list) => list.map((v) => ({ value: v, label: v }));
const label = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const required = [{ required: true, message: "Required" }];

// default values for the "Add vehicle" form
const emptyForm = {
  status: "available",
  transmission: "Automatic",
  fuel: "Gas",
  seats: 5,
  doors: 4,
  luggage: 2,
  mileage: 0,
  year: new Date().getFullYear(),
};

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = adding a new vehicle
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const loadVehicles = useCallback(async () => {
    try {
      const res = await api.get("/admin/cars");
      setVehicles(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not load vehicles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const totalPages = Math.max(1, Math.ceil(vehicles.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages); // stays valid after archiving
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = vehicles.slice(start, start + PAGE_SIZE);

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue(emptyForm);
    setModalOpen(true);
  };

  const handleEdit = (vehicle) => {
    setEditing(vehicle);
    form.resetFields();
    form.setFieldsValue(vehicle);
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editing) {
        await api.put(`/admin/cars/${editing.id}`, values);
      } else {
        await api.post("/admin/cars", values);
      }
      message.success(editing ? "Vehicle updated" : "Vehicle added");
      setModalOpen(false);
      await loadVehicles();
    } catch (err) {
      if (err.errorFields) return; // form validation error, the fields show it
      message.error(err.response?.data?.message || "Could not save the vehicle");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (id) => {
    if (!window.confirm("Archive this vehicle?")) return;
    try {
      await api.patch(`/admin/cars/${id}/archive`, { reason: "Archived" });
      message.success("Vehicle archived");
      await loadVehicles();
    } catch (err) {
      message.error(err.response?.data?.message || "Could not archive the vehicle");
    }
  };

  const goTo = (p) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  return (
    <>
      <div className="page-header">
        <h1>Manage vehicles</h1>
        <button className="btn-primary" onClick={handleAdd}>+ Add vehicle</button>
      </div>

      <div className="card table-card vehicles-card">
        <table className="vehicles-table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Plate</th>
              <th>Type</th>
              <th>Rate / day</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((v) => (
              <tr key={v.id}>
                <td className="vehicle-name">{v.name}</td>
                <td>{v.plate || "—"}</td>
                <td>{v.type}</td>
                <td>₱{v.price.toLocaleString()}</td>
                <td>
                  <span className={`badge status-${v.status}`}>{label(v.status)}</span>
                </td>
                <td>
                  <div className="row-actions">
                    <button className="btn-edit" onClick={() => handleEdit(v)}>Edit</button>
                    <button className="btn-archive" onClick={() => handleArchive(v.id)}>Archive</button>
                  </div>
                </td>
              </tr>
            ))}
            {loading && (
              <tr>
                <td colSpan={6} className="empty-row">Loading vehicles...</td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={6} className="empty-row">{error}</td>
              </tr>
            )}
            {!loading && !error && visible.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-row">No vehicles found.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="table-footer">
          <span className="muted small">
            Showing {vehicles.length === 0 ? 0 : start + 1}–{Math.min(start + PAGE_SIZE, vehicles.length)} of {vehicles.length} vehicles
          </span>

          <div className="pagination">
            <button onClick={() => goTo(currentPage - 1)} disabled={currentPage === 1}>‹</button>
            {getPages(totalPages, currentPage).map((p, i) =>
              p === "..." ? (
                <span key={`dots-${i}`} className="dots">…</span>
              ) : (
                <button
                  key={p}
                  className={p === currentPage ? "active" : ""}
                  onClick={() => goTo(p)}
                >
                  {p}
                </button>
              )
            )}
            <button onClick={() => goTo(currentPage + 1)} disabled={currentPage === totalPages}>›</button>
          </div>
        </div>
      </div>

      {/* ADD / EDIT */}
      <Modal
        title={editing ? "Edit vehicle" : "Add vehicle"}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText={editing ? "Save changes" : "Add vehicle"}
        confirmLoading={saving}
        width={640}
        forceRender
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Vehicle name" rules={required}>
                <Input placeholder="Toyota Vios" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="plate" label="Plate number" rules={required}>
                <Input placeholder="NBC 1234" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="Type" rules={required}>
                <Select options={toOptions(TYPES)} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Status" rules={required}>
                <Select options={STATUSES} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="transmission" label="Transmission" rules={required}>
                <Select options={toOptions(TRANSMISSIONS)} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="fuel" label="Fuel" rules={required}>
                <Select options={toOptions(FUELS)} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="price" label="Rate / day (₱)" rules={required}>
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="seats" label="Seats" rules={required}>
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="year" label="Year">
                <InputNumber min={1990} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="doors" label="Doors">
                <InputNumber min={2} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="luggage" label="Luggage">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="mileage" label="Mileage (km)">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={3} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
}