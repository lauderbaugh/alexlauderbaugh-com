#!/usr/bin/env bash
# Clean up stuck dev servers and corrupted Turbopack cache.
#
# Symptoms this fixes:
# - "Another next dev server is already running" on pnpm dev
# - Internal server errors with "ENOENT: build-manifest.json"
# - Dev server starting on weird ports (3001, 3002, ...) because 3000 is held
#
# Run: ./scripts/dev-reset.sh
#
# After this, run `pnpm dev` in your terminal to start fresh.

set -e

cd "$(dirname "$0")/.."

echo "Killing next dev / postcss processes..."
pkill -9 -f "next dev" 2>/dev/null || true
pkill -9 -f "postcss.js" 2>/dev/null || true
pkill -9 -f "node.*\.pnpm/next" 2>/dev/null || true
sleep 1

echo "Force-killing anything on dev ports..."
lsof -nP -iTCP -sTCP:LISTEN 2>/dev/null \
  | grep -E ":(3000|3001|3002|3003|3004|3005)\b" \
  | awk '{print $2}' | sort -u \
  | xargs -I{} kill -9 {} 2>/dev/null || true
sleep 1

echo "Wiping .next/ cache..."
rm -rf .next

echo
echo "Done. Run 'pnpm dev' to start fresh."
