// ============================================================
//  Dashboard.js  -  עמוד הבית הראשי
//
//  מציג:
//  - שעה נוכחית + מינון הבא
//  - סטטוס הקופסה (ממתינה לנטילה / רגיל)
//  - כפתור "בקש משכך כאבים"
//  - כרטיסי מלאי מהיר
// ============================================================
import React, { useState, useEffect, useCallback } from "react";
import { getStatus, requestPainKiller } from "../api/pillboxApi";
import Toast from "../components/Toast";

export default function Dashboard() {
  // --- state ---
  const [status, setStatus]   = useState(null);  // מצב המערכת מה-ESP32
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState(null);  // הודעות popup

  // --- טעינת נתונים כל 5 שניות ---
  const fetchStatus = useCallback(async () => {
    try {
      const data = await getStatus();
      setStatus(data);
    } catch (e) {
      setToast({ msg: "לא ניתן להתחבר ל-ESP32: " + e.message, type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // רענון כל 5 שניות
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // --- בקשת משכך כאבים ---
  async function handlePainKiller() {
    try {
      await requestPainKiller();
      setToast({ msg: "משכך כאבים הוצא בהצלחה!", type: "success" });
      fetchStatus();
    } catch (e) {
      if (e.message.includes("too soon")) {
        setToast({ msg: "לא ניתן לקחת עוד - יש להמתין 6 שעות", type: "error" });
      } else {
        setToast({ msg: e.message, type: "error" });
      }
    }
  }

  // --- עזר: פורמט שעה ---
  function nextDoseLabel() {
    if (!status) return "--:--";
    const h = String(status.nextDoseHour).padStart(2, "0");
    const m = String(status.nextDoseMinute).padStart(2, "0");
    return `${h}:${m}`;
  }

  // ─────────────────────────────────────────────
  if (loading) return (
    <div style={{ paddingTop: 60 }}>
      <div className="spinner" />
      <p style={{ textAlign: "center", marginTop: 16, color: "var(--text-muted)" }}>
        מתחבר ל-ESP32...
      </p>
    </div>
  );

  const waiting = status?.waitingForTake;

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* כותרת */}
      <h1 style={{ fontSize: 22, marginBottom: 18, fontWeight: 700 }}>
        💊 Smart Pill Box
      </h1>

      {/* כרטיס שעה ומינון הבא */}
      <div className="card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: 2, color: "var(--primary)" }}>
          {status?.time || "--:--:--"}
        </div>
        <div style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 14 }}>
          מינון הבא: <strong style={{ color: "var(--text)" }}>{nextDoseLabel()}</strong>
        </div>
      </div>

      {/* כרטיס סטטוס */}
      {waiting ? (
        <div className="card" style={{ borderColor: "var(--warning)", background: "#1a1500" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 32 }}>⏳</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "var(--warning)" }}>
                ממתין לנטילה
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>
                {status?.lastMedicine} – הכנס יד לכוס לאישור
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ borderColor: "var(--accent)", background: "#0d1f0f" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 32 }}>✅</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "var(--accent)" }}>
                המערכת תקינה
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>
                {status?.lastMedicine && status.lastMedicine !== "None"
                  ? `אחרון: ${status.lastMedicine}`
                  : "ממתינה למינון הבא"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* כרטיסי מלאי מהיר */}
      <div className="card">
        <div className="card__title">מצב תאים</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {(status?.cells || [false,false,false,false]).map((full, i) => (
            <div key={i} style={{
              padding: "10px 14px",
              borderRadius: 8,
              background: full ? "#0d1f0f" : "#1f0d0d",
              border: `1px solid ${full ? "var(--accent)" : "var(--danger)"}`,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
            }}>
              <span>{full ? "🟢" : "🔴"}</span>
              <span>תא {i + 1}</span>
              <span className={`badge badge--${full ? "green" : "red"}`} style={{ marginRight: "auto" }}>
                {full ? "מלא" : "ריק"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* כפתור משכך כאבים */}
      <div className="card">
        <div className="card__title">בקשה מיוחדת</div>
        <button className="btn btn--warning btn--full" onClick={handlePainKiller}>
          😣 בקש משכך כאבים
        </button>
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, textAlign: "center" }}>
          מותר פעם ב-6 שעות בלבד
        </p>
      </div>

      {/* משקל כוס */}
      {status?.cupWeight !== undefined && (
        <div className="card">
          <div className="card__title">משקל כוס</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--primary)" }}>
            {status.cupWeight.toFixed(1)} g
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
            {status.cupWeight < 0.7 ? "הכוס ריקה" : "יש תרופה בכוס"}
          </div>
        </div>
      )}
    </div>
  );
}
