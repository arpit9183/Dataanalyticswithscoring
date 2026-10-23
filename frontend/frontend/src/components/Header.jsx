function CoinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 6.5v7M7.8 8.2c0-.9.9-1.5 2.2-1.5s2.2.6 2.2 1.4c0 2-4.4.9-4.4 3 0 .9 1 1.4 2.2 1.4s2.2-.6 2.2-1.5" strokeLinecap="round" />
    </svg>
  );
}

import { useAuth } from "../lib/auth.jsx";

export default function Header({ onAuth }) {
  const { user, ready, logout } = useAuth();

  return (
    <div className="topbar-main shell">
      <a className="wordmark" href="#/" aria-label="Kimiko, the data analyzer. Go to home">
        <span className="wordmark-name">Kimiko</span>
        <span className="wordmark-tag">The data analyzer</span>
      </a>

      <div className={`account${ready ? "" : " is-loading"}`}>
        {user ? (
          <>
            <div className="auth-buttons">
              <span className="account-email" title={user.email}>{user.email}</span>
              <button type="button" className="btn btn-ghost" onClick={logout}>
                Sign out
              </button>
            </div>
            <span className="credits is-real" aria-label={`${user.credits} credits`}>
              <CoinIcon />
              <span className="credits-amount-real">{user.credits}</span>
              <span className="credits-label">credits</span>
            </span>
          </>
        ) : (
          <>
            <div className="auth-buttons">
              <button type="button" className="btn btn-ghost" onClick={() => onAuth("signin")}>
                Sign in
              </button>
              <button type="button" className="btn btn-primary" onClick={() => onAuth("signup")}>
                Sign up
              </button>
            </div>

            {/* The number is a made-up placeholder, blurred on purpose. It is not the user's balance. */}
            <button type="button" className="credits" aria-describedby="credits-tip" onClick={() => onAuth("signin")}>
              <CoinIcon />
              <span className="credits-amount" aria-hidden="true">1,250</span>
              <span className="credits-label">credits</span>
              <span id="credits-tip" role="tooltip" className="credits-tip">
                Sign in to see credits
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
