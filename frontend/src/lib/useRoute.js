import { useEffect, useState } from "react";

// Tiny hash router: "#/history" shows the History page. No extra library needed,
// and the browser's back button and page refresh both keep working.
export const ROUTES = [
  { id: "home", path: "/", label: "Home" },
  { id: "history", path: "/history", label: "History" },
  { id: "blog", path: "/blog", label: "Blog" },
  { id: "how-to-use", path: "/how-to-use", label: "How to use" },
];

function currentRoute() {
  const path = window.location.hash.replace(/^#/, "") || "/";
  return ROUTES.find((r) => r.path === path)?.id ?? "home";
}

export function useRoute() {
  const [route, setRoute] = useState(currentRoute);

  useEffect(() => {
    const onChange = () => {
      setRoute(currentRoute());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return route;
}
