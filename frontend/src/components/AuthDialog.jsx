import { useEffect, useRef } from "react";

const COPY = {
  signin: { title: "Sign in", body: "Accounts are coming soon. Once they arrive, you'll sign in here to see your credits and past checks." },
  signup: { title: "Sign up", body: "Accounts are coming soon. For now, you can check files without one." },
};

// Placeholder until the backend has accounts. Swap the body for a real form then.
export default function AuthDialog({ mode, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (mode && !dialog.open) dialog.showModal();
    if (!mode && dialog.open) dialog.close();
  }, [mode]);

  const copy = COPY[mode] ?? COPY.signin;

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
      <div className="dialog-actions">
        <button type="button" className="btn btn-primary" autoFocus onClick={() => ref.current?.close()}>
          Got it
        </button>
      </div>
    </dialog>
  );
}
