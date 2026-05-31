// ============================================================
//  Camera.js  -  עמוד מצלמה
//
//  מציג: Stream חי מה-ESP32-CAM ואפשרות לצילום snapshot
// ============================================================
import React, { useState, useRef } from "react";
import { STREAM_URL, SNAPSHOT_URL } from "../api/pillboxApi";

export default function Camera() {
  const [snapshotUrl, setSnapshotUrl] = useState(null); // תמונה שצולמה
  const [streamError, setStreamError] = useState(false);
  const imgRef = useRef(null);

  // צילום snapshot - מוסיף timestamp כדי למנוע cache של הדפדפן
  function handleSnapshot() {
    const url = `${SNAPSHOT_URL}?t=${Date.now()}`;
    setSnapshotUrl(url);
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 18 }}>📷 מצלמה</h1>

      {/* Stream חי */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{
          background: "#000",
          aspectRatio: "4/3",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative"
        }}>
          {!streamError ? (
            // תג <img> עם src של ה-MJPEG stream - הדפדפן מטפל בזה אוטומטית
            <img
              ref={imgRef}
              src={STREAM_URL}
              alt="Live Stream"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={() => setStreamError(true)}
            />
          ) : (
            <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
              <div style={{ fontSize: 48 }}>📵</div>
              <div style={{ marginTop: 8, fontSize: 13 }}>
                לא ניתן להתחבר למצלמה
              </div>
              <button
                className="btn btn--ghost"
                style={{ marginTop: 12, fontSize: 12 }}
                onClick={() => setStreamError(false)}
              >
                נסה שוב
              </button>
            </div>
          )}

          {/* תווית LIVE */}
          {!streamError && (
            <div style={{
              position: "absolute", top: 10, right: 10,
              background: "var(--danger)", color: "#fff",
              padding: "3px 10px", borderRadius: 100,
              fontSize: 11, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 5
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: "#fff", animation: "pulse 1s infinite"
              }} />
              LIVE
            </div>
          )}
        </div>
      </div>

      {/* כפתורי פעולה */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button className="btn btn--primary" style={{ flex: 1 }} onClick={handleSnapshot}>
          📸 צלם תמונה
        </button>
        <button
          className="btn btn--ghost"
          style={{ flex: 1 }}
          onClick={() => { setStreamError(false); }}
        >
          🔄 רענן Stream
        </button>
      </div>

      {/* תמונת Snapshot */}
      {snapshotUrl && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="card__title" style={{ padding: "12px 16px 0" }}>תמונה אחרונה</div>
          <img
            src={snapshotUrl}
            alt="Snapshot"
            style={{ width: "100%", display: "block" }}
            onError={() => setSnapshotUrl(null)}
          />
          <div style={{ padding: 10 }}>
            <a
              href={snapshotUrl}
              download="pillbox_snapshot.jpg"
              className="btn btn--ghost btn--full"
              style={{ textDecoration: "none", fontSize: 13 }}
            >
              ⬇ הורד תמונה
            </a>
          </div>
        </div>
      )}

      {/* מידע */}
      <div className="card" style={{ background: "#0d1a1f", borderColor: "var(--primary)" }}>
        <div style={{ fontSize: 12, color: "var(--primary)" }}>
          💡 ה-Stream מגיע ישירות מה-ESP32-CAM ברשת המקומית.
          ודאי שאת מחוברת לאותה רשת WiFi כמו הקופסה.
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
