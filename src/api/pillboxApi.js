// ============================================================
//  pillboxApi.js  -  כל התקשורת עם ה-ESP32 הראשי
//
//  שנה את ESP32_IP לכתובת ה-IP שה-ESP32 הדפיס ב-Serial Monitor
//  לדוגמה: "192.168.1.100"
// ============================================================

// ** שנה כאן את ה-IP של ה-ESP32 הראשי! **
const ESP32_IP  = "192.168.1.100";
const CAM_IP    = "192.168.1.101"; // IP של ה-ESP32-CAM

// כתובת הבסיס של ה-API
const BASE_URL = `http://${ESP32_IP}`;

// כתובת ה-stream של המצלמה (לתג <img> ישירות)
export const STREAM_URL   = `http://${CAM_IP}/stream`;
export const SNAPSHOT_URL = `http://${CAM_IP}/snapshot`;

// --- פונקציית עזר לבקשות GET ---
async function get(path) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (e) {
    // אם אין חיבור - זרוק שגיאה עם הודעה ברורה
    throw new Error(e.message || "לא ניתן להתחבר ל-ESP32");
  }
}

// ============================================================
//  פונקציות API
// ============================================================

// קבלת מצב מלא של המערכת
// מחזיר: { time, cells[], waitingForTake, lastMedicine, nextDoseHour, nextDoseMinute, ... }
export async function getStatus() {
  return get("/status");
}

// הוצאת תרופה ידנית מתא מסוים (cellID: 0-3)
export async function dispensePill(cellID) {
  return get(`/dispense?cell=${cellID}`);
}

// בקשת משכך כאבים (עם בדיקת מרווח זמן בצד ה-ESP32)
export async function requestPainKiller() {
  return get("/painkiller");
}

// קבלת מצב מלאי מפורט (כולל שמות תרופות ולוח זמנים)
export async function getInventory() {
  return get("/inventory");
}

// עדכון לוח זמנים לתא מסוים
// cellID: 0-3, hour: 0-23, minute: 0-59
export async function setSchedule(cellID, hour, minute) {
  return get(`/setschedule?cell=${cellID}&hour=${hour}&minute=${minute}`);
}
