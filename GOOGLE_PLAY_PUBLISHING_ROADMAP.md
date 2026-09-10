# 🚀 Google Play Store Publishing Roadmap & Monetization Guide for CardBase AI

This guide contains the step-by-step roadmap to publish **CardBase AI - Business Card Scanner & CRM** on the **Google Play Store**, enabling monetization through **Google Play Subscriptions** (Monthly/Annual) and **In-App Consumables** (Prepaid Event Pass Credits).

---

## 📋 Table of Contents
1. [Prerequisites & Google Play Console Setup](#1-prerequisites--google-play-console-setup)
2. [Google Payments Merchant Profile (For Receiving Sales)](#2-google-payments-merchant-profile)
3. [In-App Products & Subscriptions (SKUs) Configuration](#3-in-app-products--subscriptions-skus-configuration)
4. [Packaging into Android App Bundle (.aab) with Bubblewrap](#4-packaging-into-android-app-bundle-aab-with-bubblewrap)
5. [Digital Asset Links Verification (`assetlinks.json`)](#5-digital-asset-links-verification-assetlinksjson)
6. [Data Safety, Privacy Policy & Play Store Listing](#6-data-safety-privacy-policy--play-store-listing)
7. [Testing Tracks & Production Launch](#7-testing-tracks--production-launch)

---

## 1. Prerequisites & Google Play Console Setup
- **Google Play Developer Account**: Sign up at [https://play.google.com/console/signup](https://play.google.com/console/signup) (one-time $25 registration fee).
- **Node.js & JDK 17+**: Required for packaging tools (Bubblewrap CLI).
- **Domain with HTTPS**: Ensure your web app is deployed on an SSL-enabled domain (e.g. `https://your-domain.com`).

---

## 2. Google Payments Merchant Profile
To sell subscriptions and credit packs on Google Play:
1. In Google Play Console, go to **Settings** → **Developer account** → **Payment profile**.
2. Click **Create Payments Profile** and enter your legal business or individual banking details.
3. Google takes a standard 15% tier (under $1M revenue) and pays out 85% directly to your bank account monthly.

---

## 3. In-App Products & Subscriptions (SKUs) Configuration
CardBase AI is pre-wired to Google Play's Digital Goods API with the following SKUs. In Play Console, navigate to **Monetize** → **In-app products** and **Subscriptions**:

| SKU Identifier | Type | Price (USD) | Description |
| :--- | :--- | :--- | :--- |
| `sub_pro_monthly` | Subscription | $3.99 / mo | CardBase Pro Monthly Unlimited |
| `sub_pro_annual` | Subscription | $44.99 / yr | CardBase Pro Annual Unlimited |
| `pack_50_credits` | In-App (Consumable) | $4.99 | Expo Starter Pass (50 Card Scans) |
| `pack_200_credits` | In-App (Consumable) | $14.99 | Summit Pass (200 Card Scans) |
| `pack_500_credits` | In-App (Consumable) | $29.99 | Pro Event Pass (500 Card Scans) |
| `pack_1000_credits` | In-App (Consumable) | $39.99 | Enterprise Summit Pass (1,000 Card Scans) |

---

## 4. Packaging into Android App Bundle (.aab) with Bubblewrap

Google provides **Bubblewrap**, the official Google CLI for compiling PWAs into signed Google Play `.aab` bundles.

### Step 1: Install Bubblewrap
```bash
npm install -g @bubblewrap/cli
```

### Step 2: Initialize the Android Project from your Manifest
```bash
bubblewrap init --manifest=https://your-domain.com/manifest.json
```
- When prompted for **Package ID**, confirm `com.cardbase.ai`.
- When prompted for **Signing Key**, Bubblewrap will offer to generate `android.keystore` for you. Keep this file safe!

### Step 3: Build the `.aab`
```bash
bubblewrap build
```
This produces `app-release-bundle.aab` ready for upload to Google Play Console.

---

## 5. Digital Asset Links Verification (`assetlinks.json`)

To remove the browser address bar and enable a 100% native Android look and feel:
1. In Google Play Console, go to **App Signing** and copy your **SHA-256 certificate fingerprint**.
2. Update the `public/.well-known/assetlinks.json` file in your repository:
```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.cardbase.ai",
      "sha256_cert_fingerprints": [
        "YOUR_COPIED_SHA256_FINGERPRINT_FROM_PLAY_CONSOLE"
      ]
    }
  }
]
```
3. Deploy to production so it is accessible at `https://your-domain.com/.well-known/assetlinks.json`.

---

## 6. Data Safety, Privacy Policy & Play Store Listing

### Privacy Policy
- Provide the URL: `https://your-domain.com/privacy`
- The app includes a compliant in-app Privacy Policy with the mandatory Zero Data Retention guarantee:
  > *"When using the cloud-based AI scanner, images are securely transmitted to our OCR provider solely for real-time text extraction. These images are processed ephemerally and immediately discarded. We do not store, log, or train models on your business cards. All extracted contact data remains saved strictly on your local device."*

### Google Play Console Data Safety Questionnaire (Zero Data Collection Configuration)

To truthfully claim **Zero Data Retention** and pass Google Play review:

1. **"Does your app collect or share any of the required user data types?"**
   - Select **"No"** (Because images are processed ephemerally without retention, and contact data never leaves the local device storage).

2. **If prompted regarding Photos and Videos transmission**:
   - **Is this data processed ephemerally?**: Select **"Yes"** (Data is stored in-memory only and discarded immediately after real-time text extraction; base64 payloads are never written to disk or logs).
   - **Is this data stored off-device or collected to your servers?**: Select **"No"**.
   - **Is this data shared with third parties for advertising or tracking?**: Select **"No"**.

3. **Contacts**:
   - **Collected?**: Select **"No"** (All extracted names, phone numbers, and email addresses reside solely within local device storage).

4. **Data Security**:
   - **Data in transit is encrypted**: Select **"Yes"** (All API calls use TLS / HTTPS).

5. **Account & Data Deletion**:
   - **Data deletion mechanism**: Select **"Yes"** (Users can instantly wipe all locally stored contacts, cached images, and preferences via the in-app Data Safety / Deletion center).

---

## 7. Testing Tracks & Production Launch

1. **Closed Testing Track**:
   - In Play Console, upload `app-release-bundle.aab` to **Closed testing**.
   - Add 20 test Google accounts.
   - Add tester emails to **License Testing** (under Developer Account Settings) to test real Google Play Billing flows with zero charges.
2. **Apply for Production**:
   - After testing feedback, click **Promote to Production** and submit for Google Review.
   - Google approval typically takes **24 to 48 hours**.
   - Your app will be publicly available on Google Play worldwide!
