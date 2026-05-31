# Smart Pill Box - מדריך הפעלה

## ארכיטקטורה
```
ESP32 ראשי (192.168.1.100)    ← כל החיישנים
ESP32-CAM   (192.168.1.101)    ← מצלמה
ESP32 מסך   (192.168.1.102)    ← TFT display
אפליקציית React               ← ממשק משתמש
```

---

## שלב 1 – ESP32-CAM
**קובץ:** `pillbox_cam/pillbox_cam.ino`

1. פתחי ב-Arduino IDE
2. לחצי Tools > Board > AI Thinker ESP32-CAM
3. עדכני WIFI_SSID ו-WIFI_PASSWORD
4. העלי
5. פתחי Serial Monitor (115200 baud)
6. **רשמי את ה-IP שמופיע** → תכניסי ל-pillbox.ino כ-CAM_IP

---

## שלב 2 – ESP32 מסך
**קובץ:** `pillbox_screen/pillbox_screen.ino`

1. פתחי ב-Arduino IDE
2. לחצי Tools > Board > ESP32 Dev Module
3. עדכני WIFI_SSID ו-WIFI_PASSWORD
4. העלי
5. פתחי Serial Monitor
6. **רשמי את ה-IP שמופיע** → תכניסי ל-pillbox.ino כ-SCREEN_IP

---

## שלב 3 – ESP32 ראשי
**קובץ:** `pillbox_main/pillbox.ino`

### ספריות נדרשות (Arduino Library Manager):
- ArduinoJson (Benoit Blanchon) – גרסה 6.x

### עדכוני הקוד לפני העלאה:
```cpp
const char* WIFI_SSID     = "שם-הרשת-שלך";
const char* WIFI_PASSWORD = "סיסמת-הרשת-שלך";
const char* CAM_IP    = "192.168.1.101";  // מהשלב 1
const char* SCREEN_IP = "192.168.1.102";  // מהשלב 2
```

### לוח זמנים (בתוך הקוד):
```cpp
ScheduledDose schedule[] = {
  {8,  0,  0, "Aspirin"},    // 08:00 - תא 1
  {14, 0,  1, "Vitamin D"},  // 14:00 - תא 2
  {20, 0,  2, "Omega 3"},    // 20:00 - תא 3
  {22, 30, 3, "Melatonin"},  // 22:30 - תא 4
};
```

1. העלי את הקוד
2. **רשמי את ה-IP** שמופיע בסוף

---

## שלב 4 – אפליקציית React
**תיקיה:** `pillbox_app/`

### עדכן IP:
```js
// src/api/pillboxApi.js
const ESP32_IP = "192.168.1.100";  // IP של ESP32 הראשי
const CAM_IP   = "192.168.1.101";  // IP של המצלמה
```

### התקנה והפעלה:
```bash
cd pillbox_app
npm install
npm start
```

### בניה לייצור:
```bash
npm run build
```

---

## API Endpoints (ESP32 ראשי)

| Endpoint | תיאור |
|----------|-------|
| `GET /status` | מצב מלא של המערכת (JSON) |
| `GET /dispense?cell=0` | הוצאת תרופה ידנית מתא 0-3 |
| `GET /painkiller` | בקשת משכך כאבים |
| `GET /inventory` | מצב כל 4 התאים |
| `GET /setschedule?cell=0&hour=8&minute=30` | עדכון לוח זמנים |

## API Endpoints (ESP32-CAM)

| Endpoint | תיאור |
|----------|-------|
| `GET /stream` | MJPEG video stream |
| `GET /capture` | צילום ושמירה לזיכרון |
| `GET /snapshot` | תמונה בודדת |

---

## פינים – ESP32 ראשי

| רכיב | GPIO |
|------|------|
| Buzzer | 4 |
| Servo ראשי | 13 |
| Servo פתיחה | 15 |
| Trig מרחק | 5 |
| Echo מרחק | 18 |
| לייזר תא 0 | 34 |
| לייזר תא 1 | 35 |
| לייזר תא 2 | 36 |
| לייזר תא 3 | 39 |
| LED אדום | 27 |
| LED ירוק | 14 |
| LED כחול | 12 |
| משקל DOUT | 32 |
| משקל SCK | 33 |
| RTC CLK | 22 |
| RTC DAT | 21 |
| RTC RST | 19 |
