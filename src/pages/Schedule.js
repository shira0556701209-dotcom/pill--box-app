// ============================================================
//  Schedule.js  -  עמוד עדכון לוח זמנים
//
//  מאפשר לשנות את שעות המינון לכל תא
// ============================================================
import React, { useState, useEffect } from "react";
import { getInventory, setSchedule } from "../api/pillboxApi";
import Toast from "../components/Toast";

export default function Schedule() {
  // מצב הטפסים - כל תא יש לו שעה ודקות
  const [cells,   setCells]   = useState([]);
  const [edits,   setEdits]   = useState({});  // שינויים שהמשתמש עדיין לא שמר
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(null); // איזה תא נשמר כרגע
  const [toast,   setToast]   = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await getInventory();
      setCells(data.cells || []);
      // אתחול ערכי עריכה מהנתונים שהגיעו
      const initial = {};
      (data.cells || []).forEach(c => {
        initial[c.id] = {
          hour:   String(c.hour).padStart(2,"0"),
          minute: String(c.min).padStart(2,"0"),
        };
      });
      setEdits(initial);
    } catch (e) {
      setToast({ msg: e.message, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  // עדכון ערך שעה/דקות בטופס (לפני השמירה)
  function handleChange(cellID, field, value) {
    setEdits(prev => ({
      ...prev,
      [cellID]: { ...prev[cellID], [field]: value }
    }));
  }

  // שמירה בפועל ל-ESP32
  async function handleSave(cellID) {
    const edit = edits[cellID];
    if (!edit) return;

    const hour   = parseInt(edit.hour,   10);
    const minute = parseInt(edit.minute, 10);

    if (isNaN(hour) || hour < 0 || hour > 23 ||
        isNaN(minute) || minute < 0 || minute > 59) {
      setToast({ msg: "שעה לא תקינה (0-23) או דקות לא תקינות (0-59)", type: "error" });
      return;
    }

    setSaving(cellID);
    try {
      await setSchedule(cellID, hour, minute);
      setToast({ msg: `לוח זמנים לתא ${cellID + 1} עודכן!`, type: "success" });
      await loadData();
    } catch (e) {
      setToast({ msg: e.message, type: "error" });
    } finally {
      setSaving(null);
    }
  }

  if (loading) return <div style={{ paddingTop: 60 }}><div className="spinner" /></div>;

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>🕐 לוח זמנים</h1>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 18 }}>
        קבע את שעת המינון לכל תרופה. השינויים נשמרים ב-ESP32.
      </p>

      {cells.map(cell => {
        const edit = edits[cell.id] || { hour: "00", minute: "00" };
        return (
          <div key={cell.id} className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{
                width: 36, height: 36, borderRadius: 8,
                background: "var(--surface2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700
              }}>{cell.id + 1}</span>
              <div>
                <div style={{ fontWeight: 600 }}>{cell.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  שעה נוכחית: {String(cell.hour).padStart(2,"0")}:{String(cell.min).padStart(2,"0")}
                </div>
              </div>
            </div>

            {/* שדות זמן */}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                  שעה (0-23)
                </label>
                <input
                  type="number"
                  min="0" max="23"
                  value={edit.hour}
                  onChange={e => handleChange(cell.id, "hour", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <span style={{ color: "var(--text-muted)", fontSize: 22, paddingTop: 18 }}>:</span>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                  דקות (0-59)
                </label>
                <input
                  type="number"
                  min="0" max="59"
                  value={edit.minute}
                  onChange={e => handleChange(cell.id, "minute", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <button
                className="btn btn--primary"
                style={{ marginTop: 18, padding: "10px 16px" }}
                disabled={saving === cell.id}
                onClick={() => handleSave(cell.id)}
              >
                {saving === cell.id ? "שומר..." : "שמור"}
              </button>
            </div>
          </div>
        );
      })}

      <div className="card" style={{ background: "#0d1a1f", borderColor: "var(--primary)" }}>
        <div style={{ fontSize: 12, color: "var(--primary)" }}>
          💡 <strong>טיפ:</strong> השינויים מועברים מיידית ל-ESP32 ושמורים בזיכרון שלו.
          בכל אתחול מחדש של ה-ESP32, לוח הזמנים יחזור לברירת המחדל שקבועה בקוד.
          כדי לשמור לצמיתות - עדכן גם את הקוד ב-pillbox.ino.
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  background: "var(--surface2)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--text)",
  fontSize: 18,
  fontWeight: 700,
  textAlign: "center",
};
