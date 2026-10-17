import { useCallback, useEffect, useState } from "react";
import { Button, Col, Form, Input, InputNumber, Modal, Row, Select, Upload, message } from "antd";
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

// Pictures are saved by the server and served from /uploads, outside the /api path
const FILE_BASE = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");
const fileUrl = (path) => (path ? `${FILE_BASE}${path}` : "");
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_MB = 5;

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
  const [image, setImage] = useState({ file: null, url: "" }); // picture shown in the form (file = newly picked)
  const [imageRemoved, setImageRemoved] = useState(false); // admin removed the saved picture
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
    setImage({ file: null, url: "" });
    setImageRemoved(false);
    setModalOpen(true);
  };

  const handleEdit = (vehicle) => {
    setEditing(vehicle);
    form.resetFields();
    form.setFieldsValue(vehicle);
    setImage({ file: null, url: fileUrl(vehicle.imageUrl) });
    setImageRemoved(false);
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      // The picture travels with the form fields, so send everything as FormData
      const body = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) body.append(key, value);
      });
      const newImage = image.file;
      if (newImage) body.append("image", newImage);
      else if (imageRemoved) body.append("removeImage", "true");

      if (editing) {
        await api.put(`/admin/cars/${editing.id}`, body);
      } else {
        await api.post("/admin/cars", body);
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

  // Photo picker: checks the file, then keeps it until Save (nothing is uploaded yet)
  const pickImage = (file) => {
    if (!IMAGE_TYPES.includes(file.type)) {
      message.error("Use a JPG, PNG or WebP image");
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 > MAX_IMAGE_MB) {
      message.error(`Image must be ${MAX_IMAGE_MB}MB or smaller`);
      return Upload.LIST_IGNORE;
    }
    if (image.file) URL.revokeObjectURL(image.url);
    setImage({ file, url: URL.createObjectURL(file) });
    return false;
  };

  const removeImage = () => {
    if (image.file) URL.revokeObjectURL(image.url);
    setImage({ file: null, url: "" });
    if (editing?.imageUrl) setImageRemoved(true); // the saved picture gets deleted on Save
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
                <td className="vehicle-name">
                  {v.imageUrl && (
                    <img
                      src={fileUrl(v.imageUrl)}
                      alt=""
                      style={{ width: 44, height: 30, objectFit: "cover", borderRadius: 4, marginRight: 10, verticalAlign: "middle" }}
                    />
                  )}
                  {v.name}
                </td>
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

          <Form.Item label="Vehicle photo">
            <div
              style={{
                border: "1.5px dashed #c9cdd4",
                borderRadius: 10,
                background: "#fafafa",
                padding: "20px 16px",
                textAlign: "center",
              }}
            >
              {image.url ? (
                <>
                  <img
                    src={image.url}
                    alt="Vehicle"
                    style={{ maxWidth: "100%", maxHeight: 150, objectFit: "contain", borderRadius: 6 }}
                  />
                  <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>
                    <Upload accept={IMAGE_TYPES.join(",")} showUploadList={false} beforeUpload={pickImage}>
                      <Button>Replace image</Button>
                    </Upload>
                    <Button danger onClick={removeImage}>Remove</Button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ color: "#0a3d91", fontWeight: 500 }}>Upload vehicle photo</div>
                  <div style={{ color: "#8a8f98", fontSize: 12, margin: "4px 0 12px" }}>
                    PNG, JPG or WebP, up to {MAX_IMAGE_MB} MB
                  </div>
                  <Upload accept={IMAGE_TYPES.join(",")} showUploadList={false} beforeUpload={pickImage}>
                    <Button>Upload image</Button>
                  </Upload>
                </>
              )}
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}