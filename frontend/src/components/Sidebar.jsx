function BrandMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--brand)" />
      <rect x="7" y="15" width="4" height="10" rx="1.5" fill="#fff" />
      <rect x="14" y="9" width="4" height="16" rx="1.5" fill="#fff" />
      <rect x="21" y="12" width="4" height="13" rx="1.5" fill="#fff" fillOpacity=".65" />
    </svg>
  );
}

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <BrandMark />
        <span className="brand-name">DQ Monitor</span>
      </div>

      <nav aria-label="Main">
        <a className="nav-item is-active" href="#" aria-current="page">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <rect x="3" y="3" width="6" height="7" rx="1.5" />
            <rect x="11" y="3" width="6" height="4" rx="1.5" />
            <rect x="3" y="12" width="6" height="5" rx="1.5" />
            <rect x="11" y="9" width="6" height="8" rx="1.5" />
          </svg>
          Dashboard
        </a>
        <span className="nav-item is-disabled" aria-disabled="true">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <circle cx="10" cy="10" r="7" />
            <path d="M10 6v4.2l2.8 1.8" strokeLinecap="round" />
          </svg>
          History
          <span className="soon">Soon</span>
        </span>
      </nav>

      <p className="sidebar-foot">Checks run on your own server. Files are not sent anywhere else.</p>
    </aside>
  );
}
