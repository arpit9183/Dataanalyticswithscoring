import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchMe, signIn, signOut, signUp } from "./api.js";

const AuthContext = createContext(null);

// Holds "who is signed in" for the whole app. `user` is null when signed out.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false); // false until the first check finishes

  useEffect(() => {
    let cancelled = false;
    fetchMe()
      .then((u) => !cancelled && setUser(u))
      .catch(() => !cancelled && setUser(null)) // 401 or server off: just treat as signed out
      .finally(() => !cancelled && setReady(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => setUser(await signIn(email, password)), []);
  const register = useCallback(async (email, password) => setUser(await signUp(email, password)), []);
  const logout = useCallback(async () => {
    try {
      await signOut();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({ user, ready, login, register, logout }), [user, ready, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
