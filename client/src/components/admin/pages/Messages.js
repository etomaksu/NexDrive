import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { getPages } from "../utils";

const PAGE_SIZE = 5;

const initialMessages = [
  { id: 1, name: "Althea Lois Ramos", email: "althea@email.com", subject: "Question about my Toyota Vios booking", message: "Can I extend my rental by one more day? I'm still in Batangas and my meeting got moved.", received: "Today, 10:52 AM", status: "New" },
  { id: 2, name: "Juan Dela Cruz", email: "juan@email.com", subject: "License verification", message: "I uploaded my license yesterday. How long does verification usually take?", received: "Oct 14", status: "New" },
  { id: 3, name: "Maria Santos", email: "maria@email.com", subject: "Pick-up time change", message: "Can I pick up the Innova at 8:00 AM instead of 10:00 AM on Saturday?", received: "Oct 13", status: "Replied" },
  { id: 4, name: "Paolo Cruz", email: "paolo@email.com", subject: "Refund for cancelled booking", message: "I cancelled my Fortuner booking. When will the refund reach my card?", received: "Oct 12", status: "Replied" },
  { id: 5, name: "Ana Reyes", email: "ana@email.com", subject: "Delivery to Dasmariñas", message: "Do you offer delivery to Dasmariñas? And is there an extra fee?", received: "Oct 11", status: "Replied" },
];

export default function Messages() {
  const { setUnread } = useOutletContext();
  const [messages, setMessages] = useState(initialMessages);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const [reply, setReply] = useState("");

  const unreadCount = messages.filter((m) => m.status === "New").length;
  const repliedCount = messages.filter((m) => m.status === "Replied").length;

  // Keep the sidebar badge in sync
  useEffect(() => { setUnread(unreadCount); }, [unreadCount, setUnread]);
  useEffect(() => { setPage(1); }, [filter]);

  const filtered = messages.filter((m) => {
    if (filter === "unread") return m.status === "New";
    if (filter === "replied") return m.status === "Replied";
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);
  const goTo = (p) => { if (p >= 1 && p <= totalPages) setPage(p); };

  const openMessage = (m) => {
    // Opening a new message marks it as read
    // TODO: PATCH /api/admin/messages/:id/read
    if (m.status === "New") {
      setMessages(messages.map((x) => (x.id === m.id ? { ...x, status: "Read" } : x)));
    }
    setOpen({ ...m, status: m.status === "New" ? "Read" : m.status });
    setReply("");
  };

  const sendReply = () => {
    if (!reply.trim()) return;
    // TODO: POST /api/admin/messages/:id/reply (send the email, then mark as replied)
    setMessages(messages.map((x) => (x.id === open.id ? { ...x, status: "Replied" } : x)));
    setOpen(null);
  };

  const tabs = [
    { key: "all", label: "All messages", count: messages.length },
    { key: "unread", label: "Unread", count: unreadCount },
    { key: "replied", label: "Replied", count: repliedCount },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Messages</h1>
          <p className="muted">Messages sent from the Contact us form</p>
        </div>
        <div className="filter-pills">
          {tabs.map((t) => (
            <button key={t.key} className={filter === t.key ? "active blue" : ""} onClick={() => setFilter(t.key)}>
              {t.label} <span className="pill-count">{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card table-card vehicles-card">
        <table className="vehicles-table">
          <thead>
            <tr>
              <th>Customer</th><th>Subject</th><th>Message</th>
              <th>Received</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((m) => {
              const isNew = m.status === "New";
              return (
                <tr key={m.id} className={isNew ? "row-unread" : ""}>
                  <td>
                    <div className="cust-cell">
                      {isNew && <span className="unread-dot" />}
                      <div>
                        <div className="vehicle-name">{m.name}</div>
                        <div className="muted small">{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className={isNew ? "vehicle-name" : ""}>{m.subject}</td>
                  <td><div className="msg-preview">{m.message}</div></td>
                  <td className={isNew ? "vehicle-name" : ""}>{m.received}</td>
                  <td><span className={`badge msg-${m.status.toLowerCase()}`}>{m.status}</span></td>
                  <td>
                    <button className={isNew ? "btn-open" : "btn-edit"} onClick={() => openMessage(m)}>
                      Open
                    </button>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr><td colSpan={6} className="empty-row">No messages here.</td></tr>
            )}
          </tbody>
        </table>

        <div className="table-footer">
          <span className="muted small">
            Showing {filtered.length === 0 ? 0 : start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)} of {filtered.length} messages
          </span>
          <div className="pagination">
            <button onClick={() => goTo(page - 1)} disabled={page === 1}>‹</button>
            {getPages(totalPages, page).map((p, i) =>
              p === "..." ? (
                <span key={`dots-${i}`} className="dots">…</span>
              ) : (
                <button key={p} className={p === page ? "active" : ""} onClick={() => goTo(p)}>{p}</button>
              )
            )}
            <button onClick={() => goTo(page + 1)} disabled={page === totalPages}>›</button>
          </div>
        </div>
      </div>

      {/* Message modal */}
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(null)}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <h3>{open.subject}</h3>
            <p className="muted small">
              {open.name} · {open.email} · {open.received}
            </p>
            <p className="msg-body">{open.message}</p>

            {open.status === "Replied" ? (
              <p className="positive">This message has already been replied to.</p>
            ) : (
              <>
                <label className="reply-label">Your reply</label>
                <textarea
                  rows={4}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder={`Reply to ${open.name}…`}
                />
              </>
            )}

            <div className="panel-actions">
              {open.status !== "Replied" && (
                <button className="btn-restore-lg" onClick={sendReply} disabled={!reply.trim()}>
                  Send reply
                </button>
              )}
              <button className="btn-edit-lg" onClick={() => setOpen(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}