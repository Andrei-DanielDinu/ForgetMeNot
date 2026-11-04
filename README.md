# ForgetMeNot 🧠🌸

**Spaced Repetition & Habit Memory PWA** designed to fight the Ebbinghaus forgetting curve using the Fibonacci sequence, custom mathematical equations $f(n)$, and adaptive intervals.

[![GitHub Pages Deployment](https://github.com/actions/workflows/deploy.yml/badge.svg)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## ✨ Features

- **Fibonacci Sequence Scheduling:** Recaps scheduled on organic expanding intervals ($+1, +2, +3, +5, +8, +13, +21, +34, +55\dots$ days) to solidify complex skills (parametric design, coding, musical pieces, habits) right before forgetting sets in.
- **Mathematical Equation Engine $f(n)$:**
  - Write custom formulas: `round(pow(1.618, n))`, `fib(n)`, `round(n * 4 + 2 * sin(n))`, `round(4 * n * log(n + 1))`, etc.
  - Generates live milestone previews with exact calendar dates.
  - Includes presets: Fibonacci, Powers of 2, Classic Leitner (SM-2), Exponential 1.6x, Logarithmic, Wave/Cyclic, or Manual Day Lists (`1, 2, 4, 7, 15, 30`).
- **Smart Snooze (+1 Day):** Postpone any specific reminder by +1 day without messing up or corrupting the cadence of the remaining sequence!
- **Recap Session Journal:** Log notes, breakthrough discoveries, challenges, and exercise details directly into each milestone with recall ratings (*Easy*, *Good Effort*, *Challenging*).
- **Interactive Calendar & Roadmap:** Full month-by-month grid displaying color-coded scheduled recaps alongside topic milestones.
- **Google Calendar & .ics Export:**
  - One-click `.ics` calendar download for importing directly into Google Calendar, Apple Calendar, or Outlook.
  - Quick-add links to create individual Google Calendar events with pre-configured alarms.
- **PWA & 100% Offline-First:** Fully functional offline with Web App Manifest, Service Worker caching, and LocalStorage data backup/restore.

---

## 📱 How to Install on Android / iPhone

1. Visit the deployed GitHub Pages URL on your mobile browser (e.g., Chrome or Safari).
2. **On Android (Chrome):**
   - Tap the three dots menu (**`⋮`**) in the top right.
   - Tap **"Install App"** (or **"Add to Home screen"**).
3. **On iOS (Safari):**
   - Tap the Share button (**⎙**).
   - Tap **"Add to Home Screen"**.
4. The app installs directly onto your phone's home screen, opens fullscreen with no browser address bar, and works completely offline!

---

## 💻 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Dev Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free to use, modify, and distribute.
