import { useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import UploadZone from "./components/UploadZone.jsx";
import Report from "./components/Report.jsx";
import { uploadFile } from "./lib/api.js";
import { sampleResult } from "./lib/sample.js";

const ALLOWED = [".csv", ".json"];

export default function App() {
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [result, setResult] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [error, setError] = useState(null);
  const [isSample, setIsSample] = useState(false);
  const [runId, setRunId] = useState(0); // restarts the report animation for each new file

  async function handleFile(file) {
    const lower = file.name.toLowerCase();
    if (!ALLOWED.some((ext) => lower.endsWith(ext))) {
      setError(`"${file.name}" isn't supported. Choose a .csv or .json file.`);
      setStatus(result ? "done" : "error");
      return;
    }

    setError(null);
    setFileInfo({ name: file.name, size: file.size });
    setStatus("loading");
    try {
      const data = await uploadFile(file);
      setResult(data);
      setIsSample(false);
      setRunId((n) => n + 1);
      setStatus("done");
    } catch (err) {
      setError(err.message);
      setStatus(result ? "done" : "error");
      if (!result) setFileInfo(null);
    }
  }

  function showSample() {
    setError(null);
    setResult(sampleResult);
    setFileInfo({ name: sampleResult.filename, size: null });
    setIsSample(true);
    setRunId((n) => n + 1);
    setStatus("done");
  }

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <div className="page">
          <header className="page-head">
            <div>
              <h1>Data quality check</h1>
              <p>Upload a file to see how complete it is, column by column.</p>
            </div>
            {status !== "loading" && !isSample && (
              <button type="button" className="btn btn-quiet" onClick={showSample}>
                View example report
              </button>
            )}
          </header>

          <UploadZone status={status} fileInfo={fileInfo} onFile={handleFile} />

          {error && (
            <div className="alert" role="alert">
              <strong>Couldn't check that file.</strong> {error}
            </div>
          )}

          {status === "done" && result && <Report key={runId} result={result} isSample={isSample} />}
        </div>
      </main>
    </div>
  );
}
