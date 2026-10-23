import { useEffect, useState } from "react";
import Report from "../components/Report.jsx";
import { deleteBatch, getBatch, listBatches } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";

// The server stores times in UTC without a label. Add one so the browser shows local time.
function formatWhen(value) {
  const hasZone = /(Z|[+-]\d\d:\d\d)$/.test(value);
  const date = new Date(hasZone ? value : `${value}Z`);
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function scoreTone(score) {
  if (score === null || score === undefined) return "none";
  return score >= 95 ? "good" : score >= 80 ? "warn" : "bad";
}

export default function History({ onAuth }) {
  const { user, ready } = useAuth();
  const [items, setItems] = useState(null); // null = still loading
  const [error, setError] = useState(null);
  const [opened, setOpened] = useState(null); // { id, loading, result }

  useEffect(() => {
    if (!user) {
      setItems(null);
      setOpened(null);
      return;
    }
    let cancelled = false;
    setError(null);
    listBatches()
      .then((rows) => !cancelled && setItems(rows))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function open(id) {
    setError(null);
    setOpened({ id, loading: true, result: null });
    try {
      const result = await getBatch(id);
      setOpened({ id, loading: false, result });
    } catch (err) {
      setOpened(null);
      setError(err.message);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this report? This can't be undone.")) return;
    try {
      await deleteBatch(id);
      setItems((rows) => rows.filter((r) => r.id !== id));
      setOpened(null);
    } catch (err) {
      setError(err.message);
    }
  }

  if (!ready) return null;

  if (!user) {
    return (
      <div className="soon-page">
        <h1 className="soon-title">Sign in to see your History</h1>
        <p className="soon-body">Reports you check while signed in are saved here, so you can come back to them.</p>
        <div className="soon-actions">
          <button type="button" className="btn btn-primary" onClick={() => onAuth("signin")}>
            Sign in
          </button>
          <button type="button" className="btn" onClick={() => onAuth("signup")}>
            Create an account
          </button>
        </div>
      </div>
    );
  }

  if (opened) {
    const current = items?.find((r) => r.id === opened.id);
    return (
      <div className="history-open">
        <header className="page-head">
          <div>
            <h1>{opened.result?.filename ?? current?.filename ?? "Report"}</h1>
            {current && <p>Checked {formatWhen(current.uploaded_at)}</p>}
          </div>
          <div className="head-actions">
            <button type="button" className="btn" onClick={() => setOpened(null)}>
              Back to History
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => remove(opened.id)}>
              Delete
            </button>
          </div>
        </header>
        {opened.loading ? <p className="empty">Loading report...</p> : <Report key={opened.id} result={opened.result} isSample={false} />}
      </div>
    );
  }

  return (
    <div className="history">
      <header className="page-head">
        <div>
          <h1>History</h1>
          <p>Your saved reports, newest first.</p>
        </div>
      </header>

      {error && (
        <div className="alert" role="alert">
          <strong>Couldn't load History.</strong> {error}
        </div>
      )}

      {items === null && !error && <p className="empty">Loading...</p>}

      {items?.length === 0 && (
        <div className="soon-page">
          <h2 className="soon-title">No reports yet</h2>
          <p className="soon-body">Check a file while signed in and it will show up here.</p>
          <a className="btn btn-primary" href="#/">Check a file</a>
        </div>
      )}

      {items?.length > 0 && (
        <ul className="history-list">
          {items.map((r) => (
            <li key={r.id}>
              <button type="button" className="history-row" onClick={() => open(r.id)}>
                <span className="history-main">
                  <strong>{r.filename}</strong>
                  <span className="history-meta">
                    {formatWhen(r.uploaded_at)}
                    {r.row_count != null && ` · ${r.row_count.toLocaleString()} rows, ${r.column_count} columns`}
                  </span>
                </span>
                <span className={`history-score tone-${scoreTone(r.score)}`}>
                  {r.score == null ? "–" : Math.round(r.score)}
                  <span className="history-of">/100</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
