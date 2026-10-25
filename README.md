# Vyapar Khata - Small Business Hisab Kitab

A modern, offline-first ledger and bookkeeping application for small businesses and shopkeepers with Google Drive cloud backup, Buyer (Grahak) and Seller (Vikreta) accounts, and Excel/PDF export.

## Features
- **Buyer & Seller Khata Books**: Manage receivables and payables separately with running balances.
- **Google Drive Sync**: Auto-syncs ledger data securely with your Google Drive.
- **100% Offline Support**: Works seamlessly without internet, queuing changes until online.
- **Edit & Delete Transactions**: Easily update previous entries with running balance recalculations.
- **Excel & PDF Export**: Download transactions and parties list in CSV or printable HTML.
- **WhatsApp Statement Sharing**: One-tap payment reminder and statement generation for customers.
- **PWA & Android Installable**: Fully configured Progressive Web App with standalone display and mobile icons.

## Quick Start (Run Locally)

1. Extract the zip file and open terminal in the project folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Build an Android APK

### Option A: Using Capacitor & Android Studio
1. Install Capacitor:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```
2. Initialize Capacitor:
   ```bash
   npx cap init "Vyapar Khata" "com.vyapar.khata"
   ```
3. Build the web app and add Android:
   ```bash
   npm run build
   npx cap add android
   npx cap sync
   ```
4. Open the project in Android Studio:
   ```bash
   npx cap open android
   ```
5. In Android Studio, go to **Build > Build Bundle(s) / APK(s) > Build APK(s)** to generate the `.apk` file.

### Option B: Using PWABuilder or AppsGeyser
Deploy this project to any host (like Vercel, Netlify, or Firebase Hosting) and enter the URL in [PWABuilder.com](https://www.pwabuilder.com) or [AppsGeyser.com](https://www.appsgeyser.com) to generate an APK in 1 minute.
