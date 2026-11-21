#!/usr/bin/env bash
# LIVE NOTEBOOK STUDIO — GitHub Pages deploy helper (VR DEVELOPMENTS)
set -e

REPO_NAME="${1:-live-notebook-studio}"
REMOTE="${2:-https://github.com/YOUR-GITHUB-USERNAME/${REPO_NAME}.git}"

echo "▶ LIVE NOTEBOOK STUDIO — deploying to GitHub Pages"

# 1. commit any changes
git add -A
if git diff --cached --quiet; then
  echo "• No changes to commit."
else
  git commit -q -m "LIVE NOTEBOOK STUDIO — update"
  echo "• Committed changes."
fi

# 2. push to GitHub
echo "• Pushing to $REMOTE"
git remote remove origin 2>/dev/null || true
git remote add origin "$REMOTE"
git push -u origin main

echo ""
echo "✅ Push complete. Now enable GitHub Pages:"
echo "   1. Go to your repo on GitHub → Settings → Pages"
echo "   2. Source: 'Deploy from a branch'"
echo "   3. Branch: main  /  folder: / (root)  →  Save"
echo ""
echo "   Your game URL will be:"
echo "   https://YOUR-GITHUB-USERNAME.github.io/${REPO_NAME}/game.html"
echo "   (dashboard: .../index.html — keep this private)"
echo ""
echo "   Add that game.html URL as an OBS Browser Source (1920x1080)."
