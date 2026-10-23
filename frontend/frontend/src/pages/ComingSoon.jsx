// Shared placeholder for pages that are planned but not built yet.
const CONTENT = {
  blog: {
    title: "The blog is coming soon",
    body: "News and short guides about data quality will appear here.",
    icon: (
      <>
        <path d="M5 4h14v16H5z" strokeLinejoin="round" />
        <path d="M8.5 9h7M8.5 12.5h7M8.5 16h4" strokeLinecap="round" />
      </>
    ),
  },
};

export default function ComingSoon({ page }) {
  const c = CONTENT[page];
  return (
    <div className="soon-page">
      <div className="drop-icon" aria-hidden="true">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          {c.icon}
        </svg>
      </div>
      <h1 className="soon-title">{c.title}</h1>
      <p className="soon-body">{c.body}</p>
      <a className="btn btn-primary" href="#/">
        Check a file
      </a>
    </div>
  );
}
