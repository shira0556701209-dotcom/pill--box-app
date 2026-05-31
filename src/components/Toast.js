// ============================================================
//  Toast.js  -  הודעת popup קצרה (3 שניות ואז נעלמת)
// ============================================================
import React, { useEffect } from "react";

export default function Toast({ msg, type = "info", onClose }) {
  useEffect(() => {
    // נעלם אוטומטית אחרי 3 שניות
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`toast toast--${type}`}>
      {type === "success" && "✅ "}
      {type === "error"   && "❌ "}
      {type === "info"    && "ℹ️ "}
      {msg}
    </div>
  );
}
