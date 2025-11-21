# How to Deploy NITPLANE for Free

You can deploy this application for free using **Vercel** or **Netlify**. Both are excellent, fast, and easy to use.

## Option 1: Deploy on Vercel (Recommended)

1.  **Push to GitHub**:
    - Create a new repository on GitHub.
    - Push your code to this repository.

2.  **Import to Vercel**:
    - Go to [vercel.com](https://vercel.com) and sign up/login with GitHub.
    - Click **"Add New..."** -> **"Project"**.
    - Select your `nitplane` repository.

3.  **Configure**:
    - Framework Preset: `Vite` (should be auto-detected).
    - Root Directory: `NITPLANE--A-flight-Viewer-main` (if your code is inside a subfolder, otherwise leave default).
    - Build Command: `npm run build`
    - Output Directory: `dist`

4.  **Deploy**:
    - Click **"Deploy"**.
    - Wait for a minute, and your app will be live!

## Option 2: Deploy on Netlify

1.  **Push to GitHub** (same as above).

2.  **Import to Netlify**:
    - Go to [netlify.com](https://netlify.com) and sign up/login.
    - Click **"Add new site"** -> **"Import from an existing project"**.
    - Connect to GitHub and pick your repo.

3.  **Configure**:
    - Build command: `npm run build`
    - Publish directory: `dist`

4.  **Deploy**:
    - Click **"Deploy site"**.

## How to "Download" the App (PWA)

Once deployed (or running locally), users can install the app:

1.  **Open the website** in Chrome (Android/Desktop) or Safari (iOS).
2.  **Click the "INSTALL APP" button** in the top header (if available).
3.  **OR** use the browser menu:
    - **Chrome**: Click the three dots -> "Install App" or "Add to Home Screen".
    - **iOS Safari**: Tap the "Share" button -> "Add to Home Screen".

The app will now appear on your home screen and launch like a native app!
