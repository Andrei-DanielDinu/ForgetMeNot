# ForgetMeNot 🧠🌸

**Spaced Repetition & Habit Memory PWA** designed to fight the Ebbinghaus forgetting curve using the Fibonacci sequence and custom mathematical intervals.

---

## ✨ Features

- **Fibonacci Sequence Scheduling:** Recaps scheduled on organic expanding intervals ($+1, +2, +3, +5, +8, +13, +21, +34, +55\dots$ days) to solidify skills like parametric design, coding, or language learning before forgetting sets in.
- **Extensible Sequence Engine:**
  - **Fibonacci Sequence:** $1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144...$
  - **Powers of 2 (Binary Doubling):** $1, 2, 4, 8, 16, 32, 64, 128...$
  - **Classic Spaced Repetition (SM-2):** $1, 3, 7, 14, 30, 60, 120...$
  - **Exponential ($1.6\times$ Growth):** $1, 2, 3, 5, 8, 14, 23, 37...$
  - **Gentle Logarithmic / Triangular:** $1, 2, 4, 7, 11, 16, 22...$
  - **Wave / Cyclic Rhythm:** $1, 3, 7, 10, 14, 21, 28, 42...$
  - **Custom Sequence:** Define any comma-separated sequence of cumulative days.
- **Smart Snooze (+1 Day):** Postpone any specific reminder by +1 day without messing up or corrupting the cadence of the remaining sequence!
- **Recap Session Journal:** Log notes, breakthrough discoveries, challenges, and exercise details directly into each milestone with recall ratings (Easy, Medium, Hard).
- **Interactive Calendar & Roadmap:** Monthly calendar view + milestone roadmap for each topic.
- **Google Calendar & .ics Export:**
  - One-click `.ics` calendar download for importing directly into Google Calendar, Apple Calendar, or Outlook.
  - Quick-add link to create individual Google Calendar events with pre-configured alarms.
- **PWA & Offline-First:** Fully functional offline with Web App Manifest, Service Worker caching, and LocalStorage data backup/restore.

---

## 🚀 Running on Your Computer & Android Phone

### 1. Start the Dev Server
```bash
npm run dev
```

Vite will start and display both local and network URLs:
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

### 2. Open on Your Android Phone
1. Connect your Android phone to the same Wi-Fi network as your computer.
2. Open Chrome on your Android phone and visit the **Network URL** (e.g. `http://192.168.x.x:5173`).
3. Tap the Chrome menu (`⋮`) and select **"Add to Home screen"** or **"Install app"**.
4. **ForgetMeNot** will install as a standalone mobile app on your phone's home screen with its own icon and splash screen!
