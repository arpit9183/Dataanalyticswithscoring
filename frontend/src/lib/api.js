// Talks to the FastAPI backend. Change the address in frontend/.env (VITE_API_URL).
const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function uploadFile(file) {
  const body = new FormData();
  body.append("file", file);

  let res;
  try {
    res = await fetch(`${BASE}/upload`, { method: "POST", body });
  } catch {
    // fetch only throws when the request never got an answer:
    // server is off, wrong address, or the browser blocked it (CORS).
    throw new Error(
      `Can't reach the server at ${BASE}. Check that the backend is running and allows requests from this page.`
    );
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // body wasn't JSON; fall through to the status message below
  }

  if (!res.ok) {
    const detail = typeof data?.detail === "string" ? data.detail : null;
    throw new Error(detail || `The server rejected the upload (status ${res.status}).`);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}
