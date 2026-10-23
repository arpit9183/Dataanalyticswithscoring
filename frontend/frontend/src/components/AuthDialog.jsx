import { useEffect, useRef, useState } from "react";
import { useAuth } from "../lib/auth.jsx";

const COPY = {
  signin: {
    title: "Sign in",
    body: "See your credits and past checks.",
    submit: "Sign in",
    switchText: "New here?",
    switchAction: "Create an account",
    switchTo: "signup",
  },
  signup: {
    title: "Create your account",
    body: "Save every report to your History and keep track of your credits.",
    submit: "Sign up",
    switchText: "Already have an account?",
    switchAction: "Sign in",
    switchTo: "signin",
  },
};

export default function AuthDialog({ mode, onModeChange, onClose }) {
  const ref = useRef(null);
  const { login, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (mode && !dialog.open) dialog.showModal();
    if (!mode && dialog.open) dialog.close();
  }, [mode]);

  // Start clean every time the form opens or switches between sign in and sign up.
  useEffect(() => {
    setError(null);
    setPassword("");
  }, [mode]);

  const copy = COPY[mode] ?? COPY.signin;

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await (mode === "signup" ? register : login)(email.trim(), password);
      setEmail("");
      setPassword("");
      ref.current?.close();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="auth-title"
      onClose={onClose}
      onClick={(e) => {
        // clicking the dimmed area outside the box closes it
        if (e.target === ref.current) ref.current.close();
      }}
    >
      <h2 id="auth-title" className="dialog-title">{copy.title}</h2>
      <p className="dialog-body">{copy.body}</p>

      <form className="auth-form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            minLength={mode === "signup" ? 8 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby={mode === "signup" ? "auth-hint" : undefined}
          />
          {mode === "signup" && <span id="auth-hint" className="field-hint">At least 8 characters.</span>}
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary auth-submit" disabled={busy}>
          {busy ? "One moment..." : copy.submit}
        </button>
      </form>

      <p className="dialog-switch">
        {copy.switchText}{" "}
        <button type="button" className="link-btn" onClick={() => onModeChange(copy.switchTo)}>
          {copy.switchAction}
        </button>
      </p>
    </dialog>
  );
}
