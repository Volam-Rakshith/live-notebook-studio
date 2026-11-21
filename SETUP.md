# SETUP — LIVE NOTEBOOK STUDIO
**Made by VR DEVELOPMENTS**

## 1. Extract
Unzip `live-notebook-studio.zip` → open the folder `live-notebook-studio/`.

## 2. Run locally (no install needed)
You need a local web server (Python or Node already on your machine — free).

**Option A — Python:**
```
cd live-notebook-studio
python3 -m http.server 8080
```
**Option B — Node:**
```
cd live-notebook-studio
npx serve -l 8080
```

Then open in **Chrome**:
- Dashboard: `http://localhost:8080/index.html`
- Game: `http://localhost:8080/game.html` (click **▶ Preview Public Game** from the dashboard)

> Opening the `.html` file directly by double-click (file://) may block ES modules. Use the local server above.

## 3. Play
1. In the dashboard, type an entry → **Submit & Animate**.
2. Watch the 3D character write it in the notebook.
3. Switch **Theme**, **Book**, speed, particles, sound from the panel.
4. **Emergency Stop** / **Pause** control the animation live.

## 4. Use in OBS
- Add source → **Browser**.
- URL = your `game.html` (`http://localhost:8080/game.html` locally, or your GitHub Pages URL online).
- Size 1920×1080. Keep the **dashboard (index.html)** private — never capture it.

## 5. YouTube Live Chat (optional, free)
Requires a Google Cloud project (free quota 10k/day):
1. console.cloud.google.com → new project → enable **YouTube Data API v3**.
2. Create API key → paste into dashboard → **Chat Integration**.
3. Get your stream's **Live Chat ID** → paste → **Connect**.
4. Suggestions appear in the queue → select → **Write Selected Suggestion**.
5. For OAuth/membership tiers, run token exchange on a free backend (Cloudflare Worker/Firebase). Secrets never in frontend. See README.

## 6. Deploy to GitHub Pages (free hosting)
1. Push the folder to a GitHub repo.
2. Settings → Pages → Source: `main` branch, `/ (root)`.
3. Live URL like `https://yourname.github.io/repo/` → point OBS to `.../game.html`.

## Requirements
Modern Chrome/Edge + WebGL. No paid assets, APIs, hosting, or plugins.

**LIVE NOTEBOOK STUDIO — VR DEVELOPMENTS**
