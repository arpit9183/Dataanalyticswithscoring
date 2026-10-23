// Talks to the FastAPI backend. Change the address in frontend/.env (VITE_API_URL).
export const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const FRIENDLY = {
  401: "Please sign in.",
  422: "Check the email address, and use a password of at least 8 characters.",
};

// One place for every request. `credentials: "include"` makes the browser send
// the login cookie to the backend, which is how the server knows who you are.
async function request(path, { method = "GET", json, body } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      credentials: "include",
      headers: json ? { "Content-Type": "application/json" } : undefined,
      body: json ? JSON.stringify(json) : body,
    });
  } catch {
    // fetch only throws when the request never got an answer:
    // server is off, wrong address, or the browser blocked it (CORS).
    throw new Error(
      `Can't reach the server at ${BASE}. Check that the backend is running and allows requests from this page.`
    );
  }

  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch {
    // body wasn't JSON; fall through to the status message below
  }

  if (!res.ok) {
    const detail = typeof data?.detail === "string" ? data.detail : null;
    const error = new Error(detail || FRIENDLY[res.status] || `The server returned an error (status ${res.status}).`);
    error.status = res.status;
    throw error;
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

export function uploadFile(file) {
  const body = new FormData();
  body.append("file", file);
  return request("/upload", { method: "POST", body });
}

export const signUp = (email, password) => request("/auth/signup", { method: "POST", json: { email, password } });
export const signIn = (email, password) => request("/auth/login", { method: "POST", json: { email, password } });
export const signOut = () => request("/auth/logout", { method: "POST" });
export const fetchMe = () => request("/auth/me");

export const listBatches = () => request("/batches");
export const getBatch = (id) => request(`/batches/${id}`);
export const deleteBatch = (id) => request(`/batches/${id}`, { method: "DELETE" });
