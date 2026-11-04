# ForgetMeNot (Native Android) 🧠🌸📱

**100% Native Android App** built with **Kotlin & Jetpack Compose (Material 3)**, fully compatible with **Android 16 (API 35/36 Baklava)** and backwards compatible to Android 8.0+ (API 26).

---

## ✨ Native Features

- **Pure Native Kotlin & Jetpack Compose:** High-performance, fluid 120Hz native Android UI with edge-to-edge system bar integration and dynamic theme.
- **Fibonacci Sequence Scheduling:** Recaps scheduled on expanding intervals ($+1, +2, +3, +5, +8, +13, +21, +34, +55\dots$ days) to fight the Ebbinghaus forgetting curve.
- **Mathematical Equation Engine $f(n)$:**
  - Evaluates custom formulas: `round(pow(1.618, n))`, `fib(n)`, `round(n * 4 + 2 * sin(n))`, `round(4 * n * log(n + 1))`, etc.
  - Built-in presets: Fibonacci, Powers of 2, Classic Leitner (SM-2), Exponential 1.6x, Logarithmic, Wave/Cyclic, or Manual Day Lists.
- **Smart Snooze (+1 Day):** Postpone any specific reminder by +1 day without messing up or breaking the underlying sequence cadence!
- **Recap Notes & Exercises Journal:** Log session notes, breakthrough discoveries, and practice exercises with recall ratings (*Easy*, *Medium*, *Hard*).
- **Interactive Calendar View:** Month-by-month grid displaying color-coded scheduled recaps.
- **Exact Alarms & Local Notifications:** Uses `AlarmManager` and `NotificationManager` for daily review reminders.
- **100% Offline & Private:** All data is stored locally on your device via internal Android storage. No central database, zero internet required.

---

## 📥 How to Download & Install the APK on Your Android Phone

Every push to this `android-native` branch automatically compiles an installable `.apk` file via GitHub Actions!

1. Open this repository on GitHub in your phone's browser:
   `https://github.com/Andrei-DanielDinu/ForgetMeNot/actions`
2. Tap the latest **"Build Native Android APK"** workflow run.
3. Scroll down to **Artifacts** $\to$ tap **`ForgetMeNot-Android-APK`** to download it.
4. Extract the zip and tap **`app-debug.apk`** to install it directly on your phone!
   *(If prompted by Android, tap "Allow from this source" to install).*

---

## 💻 Opening in Android Studio

1. Open Android Studio.
2. Select **File $\to$ Open...** and choose this `ForgetMeNot` folder (on the `android-native` branch).
3. Android Studio will automatically sync Gradle and let you run it on your emulator or physical Android phone with one click!
