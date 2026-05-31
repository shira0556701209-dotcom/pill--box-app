// ============================================================
//  Inventory.js  -  עמוד מלאי
//
//  מציג: מצב כל 4 תאים עם שמות תרופות ואפשרות להוצאה ידנית
// ============================================================
import React, { useState, useEffect } from "react";
import { getInventory, dispensePill } from "../api/pillboxApi";
import Toast from "../components/Toast";

export default function Inventory() {
  const [cells,   setCells]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState(null);
  const [dispensing, setDispensing] = useState(null); // איזה תא נמצא בתהליך הוצאה

  useEffect(() => {
    loadInventory();
  }, []);

  async function loadInventory() {
    setLoading(true);
    try {
      const data = await getInventory();
      setCells(data.cells || []);
    } catch (e) {
      setToast({ msg: e.message, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDispense(cellID) {
    setDispensing(cellID);
    try {
      await dispensePill(cellID);
      setToast({ msg: `תרופה מתא ${cellID + 1} הוצאה בהצלחה!`, type: "success" });
      await loadInventory(); // רענן מלאי
    } catch (e) {
      if (e.message.includes("empty")) {
        setToast({ msg: `תא ${cellID + 1} ריק!`, type: "error" });
      } else {
        setToast({ msg: e.message, type: "error" });
      }
    } finally {
      setDispensing(null);
    }
  }

  if (loading) return <div style={{ paddingTop: 60 }}><div className="spinner" /></div>;

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>📦 מלאי תרופות</h1>
        <button className="btn btn--ghost" onClick={loadInventory} style={{ fontSize: 12, padding: "6px 14px" }}>
          🔄 רענן
        </button>
      </div>

      {/* סיכום מהיר */}
      <div className="card" style={{ display: "flex", gap: 16, justifyContent: "space-around", textAlign: "center" }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>
            {cells.filter(c => c.full).length}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>תאים מלאים</div>
        </div>
        <div style={{ width: 1, background: "var(--border)" }} />
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--danger)" }}>
            {cells.filter(c => !c.full).length}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>תאים ריקים</div>
        </div>
      </div>

      {/* רשימת תאים */}
      {cells.map((cell) => (
        <div key={cell.id} className="card" style={{
          borderColor: cell.full ? "var(--border)" : "var(--danger)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              {/* מספר תא + שם תרופה */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{
                  width: 32, height: 32,
                  borderRadius: 8,
                  background: "var(--surface2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 15
                }}>
                  {cell.id + 1}
                </span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{cell.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    מינון: {String(cell.hour).padStart(2,"0")}:{String(cell.min).padStart(2,"0")}
                  </div>
                </div>
              </div>
            </div>
            {/* סטטוס + כפתור */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <span className={`badge badge--${cell.full ? "green" : "red"}`}>
                {cell.full ? "מלא" : "ריק"}
              </span>
              {cell.full && (
                <button
                  className="btn btn--ghost"
                  style={{ fontSize: 12, padding: "5px 12px" }}
                  disabled={dispensing === cell.id}
                  onClick={() => handleDispense(cell.id)}
                >
                  {dispensing === cell.id ? "מוציא..." : "⬇ הוצא"}
                </button>
              )}
            </div>
          </div>

          {/* אזהרה לתא ריק */}
          {!cell.full && (
            <div style={{
              marginTop: 8, padding: "8px 10px",
              background: "#1f0d0d", borderRadius: 6,
              fontSize: 12, color: "var(--danger)"
            }}>
              ⚠ נא למלא את התא לפני המינון הבא
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
