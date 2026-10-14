import { useState, useEffect, useRef } from "react";

const VerificationPopUp = ({ email, onClose }) => {
  const [seconds, setSeconds] = useState(40);
  const [code, setCode] = useState(["", "", "", "", ""]);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds(seconds - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const handleChange = (e, i) => {
    const value = e.target.value.replace(/\D/g, "");
    const next = [...code];
    next[i] = value;
    setCode(next);
    if (value && i < code.length - 1) inputsRef.current[i + 1].focus();
  };

  const handleKeyDown = (e, i) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      inputsRef.current[i - 1].focus();
    }
  };

  const handleResend = () => {
    // call your backend here to send a new code
    setSeconds(40);
  };

  return (
    <div id="verify-overlay" onClick={onClose}>
      <div id="verify-modal" onClick={(e) => e.stopPropagation()}>
        <button id="verify-close" onClick={onClose} aria-label="Close">&times;</button>

        <h2 id="verify-title">Enter verification code</h2>
        <p id="verify-text">
          The verification code has been sent to email<br />
          <span id="verify-email">{email}</span>
        </p>

        <div id="verify-inputs">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
            />
          ))}
        </div>

        <p id="verify-timer">Resend after {seconds} seconds</p>

        <button id="verify-resend" disabled={seconds > 0} onClick={handleResend}>
          Resend
        </button>
      </div>
    </div>
  );
};

export default VerificationPopUp;