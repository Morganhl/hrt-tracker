# HRT Tracker — PWA Setup & Deployment

## Project structure
```
hrt-pwa/
├── public/
│   ├── favicon.svg
│   ├── icon-192.png
│   ├── icon-512.png
│   └── apple-touch-icon.png
├── src/
│   ├── main.jsx        ← entry point + service worker registration
│   ├── App.jsx         ← main app (your HRT tracker)
│   └── index.css       ← global styles + iOS safe-area handling
├── index.html          ← iOS PWA meta tags
├── vite.config.js      ← Vite + PWA plugin config
└── package.json
```

---

## One-time setup

### 1. Install Node.js
Download from https://nodejs.org (LTS version)

### 2. Install dependencies
```bash
cd hrt-pwa
npm install
```

### 3. Test locally
```bash
npm run dev
```
Opens at http://localhost:5173

---

## Deploy to Vercel (free, recommended)

### First deploy
1. Go to https://vercel.com and sign up (free)
2. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. From the project folder:
   ```bash
   vercel
   ```
   Follow the prompts — it auto-detects Vite. You'll get a URL like:
   `https://hrt-tracker-yourname.vercel.app`

### Every future update
When you get updated code from Claude, just replace `src/App.jsx` and run:
```bash
vercel --prod
```
That's it — all users get the update automatically within seconds.

---

## Add to iPhone home screen

1. Open your Vercel URL in **Safari** on iPhone (must be Safari, not Chrome)
2. Tap the **Share** button (box with arrow pointing up)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **Add**

The app now appears on your home screen, opens full-screen with no browser chrome,
and works **offline** (your schedule is cached locally).

---

## Updating the app

The PWA auto-updates silently in the background whenever you redeploy.
Next time the app is opened after a deploy, it will prompt:
> "New version available! Update now?"

Tap yes — done.

---

## Sharing with your partner

Just send them the Vercel URL and have them follow the
"Add to iPhone home screen" steps above.
Their data is stored separately in their own browser (localStorage),
so your schedules are completely independent.

---

## Custom domain (optional)

In Vercel dashboard → your project → Settings → Domains
Add any domain you own. Free SSL included.
