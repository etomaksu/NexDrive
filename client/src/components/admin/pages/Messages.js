import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { message as toast } from "antd";
import dayjs from "dayjs";
import { api } from "../../../api/admin";
import { getPages } from "../utils";

const PAGE_SIZE = 5;

// "Today, 10:52 AM" for today, otherwise "Oct 14" (with the year if it's an older year)
const formatReceived = (iso) => {
  const d = dayjs(iso);
  if (d.isSame(dayjs(), "day")) return `Today, ${d.format("h:mm A")}`;
  return d.isSame(dayjs(), "year") ? d.format("MMM D") : d.format("MMM D, YYYY");
};

export default function Messages() {
  const { setUnread } = useOutletContext();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api
      .get("/admin/messages")
      .then(({ data }) => setMessages(data))
      .catch((err) => setLoadError(err.response?.data?.message || "Could not load messages."))
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = messages.filter((m) => m.status === "New").length;
  const repliedCount = messages.filter((m) => m.status === "Replied").length;

  // Keep the sidebar badge in sync (only after the real data has loaded)
  useEffect(() => {
    if (!loading && !loadError) setUnread(unreadCount);
  }, [loading, loadError, unreadCount, setUnread]);
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
    if (m.status === "New") {
      setMessages(messages.map((x) => (x.id === m.id ? { ...x, status: "Read" } : x)));
      api.patch(`/admin/messages/${m.id}/read`).catch(() => {});
    }
    setOpen({ ...m, status: m.status === "New" ? "Read" : m.status });
    setReply("");
  };

  const sendReply = async () => {
    if (!reply.trim()) return;
    try {
      setSending(true);
      const { data } = await api.post(`/admin/messages/${open.id}/reply`, { reply });
      setMessages(messages.map((x) => (x.id === data.id ? data : x)));
      toast.success("Reply saved");
      setOpen(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send the reply.");
    } finally {
      setSending(false);
    }
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
            {loading && (
              <tr><td colSpan={6} className="empty-row">Loading messages...</td></tr>
            )}
            {!loading && loadError && (
              <tr><td colSpan={6} className="empty-row">{loadError}</td></tr>
            )}
            {!loading && !loadError && visible.map((m) => {
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
                  <td className={isNew ? "vehicle-name" : ""}>{formatReceived(m.received)}</td>
                  <td><span className={`badge msg-${m.status.toLowerCase()}`}>{m.status}</span></td>
                  <td>
                    <button className={isNew ? "btn-open" : "btn-edit"} onClick={() => openMessage(m)}>
                      Open
                    </button>
                  </td>
                </tr>
              );
            })}
            {!loading && !loadError && visible.length === 0 && (
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
              {open.name} · {open.email} · {formatReceived(open.received)}
            </p>
            <p className="msg-body">{open.message}</p>

            {open.status === "Replied" ? (
              <>
                <p className="positive">This message has already been replied to.</p>
                {open.reply && <p className="msg-body">{open.reply}</p>}
              </>
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
                <button className="btn-restore-lg" onClick={sendReply} disabled={!reply.trim() || sending}>
                  {sending ? "Sending..." : "Send reply"}
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