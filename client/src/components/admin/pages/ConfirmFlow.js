import { useEffect, useState } from "react";
import { Modal, message } from "antd";
import { api } from "../../../api/admin";
import "./ConfirmFlow.css";

// Step 1: "Are you sure?"  ->  Step 2: admin password  ->  runs onConfirmed()
const COPY = {
  "archive-vehicle": {
    title: "Are you sure you want to archive this vehicle?",
    text: "This vehicle will be moved to the archive list. You can restore this back any time.",
    button: "Archive",
  },
  "archive-user": {
    title: "Are you sure you want to archive this user?",
    text: "This user will be moved to the archive list. You can restore this back any time.",
    button: "Archive",
  },
  "block-user": {
    title: "Are you sure you want to block this user?",
    text: "This user will be blocked and cannot do any actions. You can unblock this user any time.",
    button: "Block",
  },
};

const CloseIcon = () => <span className="cf-close">✕</span>;

export default function ConfirmFlow({ kind, onClose, onConfirmed }) {
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const copy = COPY[kind];

  // start over every time a new action is opened
  useEffect(() => {
    setStep(1);
    setPassword("");
    setError("");
    setBusy(false);
  }, [kind]);

  if (!copy) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!password) return setError("Enter your password.");
    try {
      setBusy(true);
      await api.post("/admin/verify-password", { password });
    } catch (err) {
      setBusy(false);
      return setError(err.response?.data?.message || "Could not check the password.");
    }
    try {
      await onConfirmed();
    } catch (err) {
      message.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setBusy(false);
      onClose();
    }
  };

  return (
    <Modal open onCancel={onClose} footer={null} centered width={step === 1 ? 460 : 420} closeIcon={<CloseIcon />} className="cf-modal" destroyOnClose>
      {step === 1 ? (
        <>
          <h2 className="cf-title">{copy.title}</h2>
          <p className="cf-text">{copy.text}</p>
          <div className="cf-actions">
            <button className="cf-btn cf-btn-light" onClick={onClose}>Cancel</button>
            <button className="cf-btn cf-btn-solid" onClick={() => setStep(2)}>{copy.button}</button>
          </div>
        </>
      ) : (
        <form onSubmit={submit}>
          <h2 className="cf-title cf-title-lg">Confirmation Password</h2>
          <p className="cf-text cf-tight">Enter password for admin confirmation</p>
          <input
            className={`cf-input ${error ? "cf-input-error" : ""}`}
            type="password"
            placeholder="Password"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
          />
          {error && <p className="cf-error">{error}</p>}
          <button type="submit" className="cf-btn cf-btn-solid cf-btn-wide" disabled={busy}>
            {busy ? "Checking..." : "Continue"}
          </button>
        </form>
      )}
    </Modal>
  );
}