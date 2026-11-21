# LIVE NOTEBOOK STUDIO
**Made by VR DEVELOPMENTS**

Interactive 3D YouTube Live typing game — inspired by Death Note Type.

## Quick Start (₹0)
1. Open `index.html` (Streamer Dashboard) in Chrome.
2. Click **Preview Public Game** → opens `game.html` in new tab.
3. In OBS: Add Browser Source → URL = local `game.html` file path (or GitHub Pages URL), 1920x1080.
4. Type entry in dashboard → Submit → watch hand write in 3D.
5. Deploy: Push folder to GitHub → Settings → Pages → Deploy from branch `main`.

## Two Screens
- **Dashboard (`index.html`)** — PRIVATE. Never show on stream. Manual entry default.
- **Game (`game.html`)** — PUBLIC. OBS captures this. First-person 3D notebook.

They sync via `BroadcastChannel('livenotebook')` + `localStorage`. No server needed for manual mode.

## YouTube Live Chat (Phase 4)
Requires Google Cloud OAuth + YouTube Data API v3 (free quota 10k/day).
1. Create project at console.cloud.google.com → Enable YouTube Data API v3.
2. OAuth Consent → Desktop App → Client ID/Secret.
3. Dashboard → Chat Integration → Paste API Key + Live Chat ID → Connect.
4. Code in `js/chat-integration.js` polls `liveChat/messages`, filters spam/duplicates, pushes to queue. **Never auto-accepts** — streamer approves.
5. For production, move OAuth token exchange to free backend (Cloudflare Worker / Firebase) — secrets never in frontend. See `js/chat-integration.js` comments.

## Backend-Ready Model
`js/persistence.js` abstracts storage. Swap `LocalStorageAdapter` for `ApiAdapter` (Firebase/Supabase free tier) without changing UI. Data: sessions, viewers, OG eligibility, membership, queue, history, preferences.

## Themes & Books
Themes: CLASSIC, OG, VIP, WINTER FESTIVAL, CYBER — each rebuilds 3D environment (lights, props, particles, fog).
Books: Classic, OG (First 50), Member L1, Royal L2, Legendary L3 — cosmetic only.

## Controls
Dashboard: Submit, Pause/Resume, Emergency Stop, Page Turn, Reset, Speed, Particles, Sound, Automation (OFF by default).

## Tech
HTML5, CSS3, JS ES Modules, Three.js, Web Audio API, YouTube Data API v3, OBS, GitHub Pages. No paid assets — all procedural.

**LIVE NOTEBOOK STUDIO — VR DEVELOPMENTS**
