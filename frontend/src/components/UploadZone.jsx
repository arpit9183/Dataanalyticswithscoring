import { useRef, useState } from "react";

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadZone({ status, fileInfo, onFile }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const busy = status === "loading";
  const hasResult = status === "done" || (status === "loading" && fileInfo);

  function pick(files) {
    const file = files?.[0];
    if (file) onFile(file);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    if (!busy) pick(e.dataTransfer.files);
  }

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept=".csv,.json"
      hidden
      onChange={(e) => {
        pick(e.target.files);
        e.target.value = ""; // lets you choose the same file again
      }}
    />
  );

  // After a file has been checked, the zone shrinks to a slim bar.
  if (hasResult) {
    return (
      <div
        className={`filebar${dragging ? " is-dragging" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {input}
        {busy ? (
          <span className="spinner" aria-hidden="true" />
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <path d="M6 3h8l4 4v14H6z" strokeLinejoin="round" />
            <path d="M14 3v4h4" strokeLinejoin="round" />
          </svg>
        )}
        <div className="filebar-text" role={busy ? "status" : undefined}>
          <strong>{fileInfo?.name}</strong>
          <span>{busy ? "Checking your data…" : fileInfo?.size ? formatSize(fileInfo.size) : "Built-in example"}</span>
        </div>
        <button type="button" className="btn" disabled={busy} onClick={() => inputRef.current?.click()}>
          Check another file
        </button>
      </div>
    );
  }

  return (
    <div
      className={`dropzone${dragging ? " is-dragging" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      {input}
      <div className="drop-icon" aria-hidden="true">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M12 16V5m0 0L7.5 9.5M12 5l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="drop-title">{dragging ? "Release to check this file" : "Drop a CSV or JSON file here"}</h2>
      <p className="drop-hint">We'll count missing values and show the type and range of every column.</p>
      <button type="button" className="btn btn-primary" onClick={() => inputRef.current?.click()}>
        Choose a file
      </button>
    </div>
  );
}
