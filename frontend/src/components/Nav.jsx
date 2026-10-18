import { ROUTES } from "../lib/useRoute.js";

export default function Nav({ route }) {
  return (
    <nav className="tabs shell" aria-label="Main">
      {ROUTES.map((r) => (
        <a
          key={r.id}
          href={`#${r.path}`}
          className={`tab${route === r.id ? " is-active" : ""}`}
          aria-current={route === r.id ? "page" : undefined}
        >
          {r.label}
        </a>
      ))}
    </nav>
  );
}
