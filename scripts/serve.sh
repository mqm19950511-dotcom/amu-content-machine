#!/usr/bin/env bash
# Serve the dashboard locally.
#
# The dashboard also works opened straight from disk (data loads via <script>,
# not fetch), but a server gives you a stable URL and clean reloads.
set -euo pipefail
cd "$(dirname "$0")/../dashboard"

PORT="${1:-8420}"

if [ ! -f data.js ]; then
  echo "No data.js — the dashboard would load empty."
  echo "Run: node scripts/build_dashboard.mjs"
  echo
fi

echo "Content Machine dashboard → http://localhost:$PORT"
echo "Ctrl-C to stop."
echo
exec python3 -m http.server "$PORT" --bind 127.0.0.1
