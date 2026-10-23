import { useState } from "react";
import Header from "./components/Header.jsx";
import Nav from "./components/Nav.jsx";
import AuthDialog from "./components/AuthDialog.jsx";
import Home from "./pages/Home.jsx";
import HowToUse from "./pages/HowToUse.jsx";
import ComingSoon from "./pages/ComingSoon.jsx";
import History from "./pages/History.jsx";
import { useRoute } from "./lib/useRoute.js";

export default function App() {
  const route = useRoute();
  const [authMode, setAuthMode] = useState(null); // null | "signin" | "signup"

  return (
    <>
      <header className="topbar">
        <Header onAuth={setAuthMode} />
        <Nav route={route} />
      </header>

      <main className="page shell">
        {/* Home stays mounted while you visit other tabs, so your report is still there when you come back. */}
        <div className="page-stack" hidden={route !== "home"}>
          <Home />
        </div>
        {route === "history" && <History onAuth={setAuthMode} />}
        {route === "blog" && <ComingSoon page="blog" />}
        {route === "how-to-use" && <HowToUse />}
      </main>

      <AuthDialog mode={authMode} onModeChange={setAuthMode} onClose={() => setAuthMode(null)} />
    </>
  );
}
