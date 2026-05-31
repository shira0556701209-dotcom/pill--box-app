// ============================================================
//  App.js  -  ניהול ניווט בין עמודי האפליקציה
// ============================================================
import React, { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Schedule  from "./pages/Schedule";
import Camera    from "./pages/Camera";
import "./App.css";

// שמות הדפים
const PAGES = {
  DASHBOARD: "dashboard",
  INVENTORY: "inventory",
  SCHEDULE:  "schedule",
  CAMERA:    "camera",
};

export default function App() {
  const [page, setPage] = useState(PAGES.DASHBOARD);

  return (
    <div className="app-shell">
      {/* תוכן הדף הנוכחי */}
      <main className="app-content">
        {page === PAGES.DASHBOARD && <Dashboard />}
        {page === PAGES.INVENTORY && <Inventory />}
        {page === PAGES.SCHEDULE  && <Schedule  />}
        {page === PAGES.CAMERA    && <Camera    />}
      </main>

      {/* סרגל ניווט תחתון */}
      <nav className="bottom-nav">
        <NavBtn icon="🏠" label="בית"     page={PAGES.DASHBOARD} current={page} onClick={setPage} />
        <NavBtn icon="💊" label="מלאי"   page={PAGES.INVENTORY} current={page} onClick={setPage} />
        <NavBtn icon="🕐" label="לוח זמנים" page={PAGES.SCHEDULE} current={page} onClick={setPage} />
        <NavBtn icon="📷" label="מצלמה"  page={PAGES.CAMERA}    current={page} onClick={setPage} />
      </nav>
    </div>
  );
}

// כפתור ניווט בסרגל התחתון
function NavBtn({ icon, label, page, current, onClick }) {
  const active = page === current;
  return (
    <button
      className={`nav-btn ${active ? "nav-btn--active" : ""}`}
      onClick={() => onClick(page)}
    >
      <span className="nav-btn__icon">{icon}</span>
      <span className="nav-btn__label">{label}</span>
    </button>
  );
}
