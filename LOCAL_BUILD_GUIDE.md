# CardBase AI — Local Android Build & Google Play (.aab) Guide

This guide walks you through compiling **CardBase AI** locally into a signed **Google Play Android App Bundle (`.aab`)** using **Ionic Capacitor** and **Android Studio**.

---

## Prerequisites & Requirements

- **Node.js**: v18 or v20+ installed ([nodejs.org](https://nodejs.org/))
- **Android Studio**: Ladybug / Koala or newer installed ([developer.android.com/studio](https://developer.android.com/studio))
  - Android SDK Platform 34 or 35 installed
  - Android SDK Build-Tools
  - Java Development Kit (JDK 17 or 21, bundled with Android Studio)

---

## Step-by-Step Compilation Guide

### Step 1: Install Node.js and Android Studio locally
Ensure both Node.js and Android Studio are installed on your machine.
- Verify Node in your terminal:
  ```bash
  node -v
  npm -v
  ```
- Open Android Studio once to complete the initial SDK component and tool installations.

---

### Step 2: Install Project Packages
Extract your downloaded ZIP file, open your terminal in the project root folder, and run:
```bash
npm install
```
This installs all web and Capacitor native Android dependencies (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, React, Tailwind, Lucide, etc.).

---

### Step 3: Compile React Web Assets & Sync to Android
Execute the automated build & sync script:
```bash
npm run build:android
```
What this command does:
1. Runs `vite build` to compile the production-ready React client into the `dist/` directory.
2. Runs `npx cap sync android` to copy the web distribution and plugins into the native `android/` project folder.

---

### Step 4: Launch Android Studio
Open the synchronized native Android project in Android Studio by running:
```bash
npx cap open android
```
*(Alternatively, launch Android Studio manually, select **Open**, and choose the `android` folder located inside this project).*

- Wait for Android Studio to finish indexing and running the initial Gradle sync.

---

### Step 5: Generate the Signed Android App Bundle (.aab) for Google Play
Inside Android Studio:
1. In the top menu, go to:
   **Build** > **Generate Signed Bundle / APK...**
2. Select **Android App Bundle** (`.aab`) and click **Next**.
3. **Key store path**:
   - If you already have an upload keystore, choose **Choose existing...** and enter your credentials.
   - If this is your first release, click **Create new...**, save your `.jks` keystore file in a secure location, and fill in the password and key alias.
   *(⚠️ Keep this keystore file and passwords safely backed up; you will need it for all future app updates).*
4. Select the **release** build variant.
5. Click **Finish**.

Android Studio will compile the code and output your signed `.aab` file (usually located at `android/app/release/app-release.aab`).

---

## Google Play Console Upload Checklist

Once you have your `.aab`:
1. Log in to the [Google Play Console](https://play.google.com/console).
2. Select your app (or click **Create app** with name **CardBase AI**).
3. Navigate to **Production** (or **Closed Testing**) > **Create new release**.
4. Drag and drop your `app-release.aab` file.
5. Add release notes and proceed to review and rollout!
