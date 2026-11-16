#!/usr/bin/env bash
# Installs (or reinstalls) the launchd agent that runs scripts/goodreads-sync.mjs
# every 3 hours and at login. launchd also runs a missed interval once on wake,
# so a closed laptop just delays the sync rather than skipping it.
#
#   scripts/install-goodreads-sync.sh            install / reload
#   scripts/install-goodreads-sync.sh uninstall  remove the agent
#
# Re-run after upgrading Node via nvm: the plist pins absolute paths.
set -euo pipefail

LABEL="com.alexlauderbaugh.goodreads-sync"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
ENV_DIR="$HOME/.config/alexlauderbaugh"
ENV_FILE="$ENV_DIR/goodreads-sync.env"
LOG="$HOME/Library/Logs/goodreads-sync.log"
REPO="$(cd "$(dirname "$0")/.." && pwd)"
GUI="gui/$(id -u)"

launchctl bootout "$GUI/$LABEL" 2>/dev/null || true

if [[ "${1:-}" == "uninstall" ]]; then
  rm -f "$PLIST"
  echo "Removed $LABEL. (Left $ENV_FILE in place.)"
  exit 0
fi

NODE="$(command -v node)"
[[ -x "$NODE" ]] || { echo "node must be on PATH" >&2; exit 1; }

mkdir -p "$ENV_DIR" "$(dirname "$PLIST")"
if [[ ! -f "$ENV_FILE" ]]; then
  cat > "$ENV_FILE" <<'EOF'
# Secrets for scripts/goodreads-sync.mjs. Never commit this file.
CHROME_PROFILE="Default"
GOODREADS_COOKIE=""
GLOBAL_CONFIG_ID=""
VERCEL_TOKEN=""
VERCEL_TEAM_ID=""
EOF
  chmod 600 "$ENV_FILE"
  echo "Created $ENV_FILE — fill it in, then re-run this script."
  exit 0
fi
chmod 600 "$ENV_FILE"

# The sync reads Chrome's cookie-encryption password from the env file, so
# unattended runs never touch the Keychain (each access would prompt).
if ! grep -q '^CHROME_SAFE_STORAGE_PASSWORD="..*"' "$ENV_FILE"; then
  echo "Note: CHROME_SAFE_STORAGE_PASSWORD isn't set in $ENV_FILE, so the sync"
  echo "will fall back to GOODREADS_COOKIE. To add it (one Keychain prompt):"
  echo "  printf 'CHROME_SAFE_STORAGE_PASSWORD=\"%s\"\\n' \"\$(security find-generic-password -w -s 'Chrome Safe Storage')\" >> $ENV_FILE"
fi

cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>$NODE</string>
    <string>$REPO/scripts/goodreads-sync.mjs</string>
  </array>
  <key>StartInterval</key><integer>10800</integer>
  <key>RunAtLoad</key><true/>
  <key>StandardOutPath</key><string>$LOG</string>
  <key>StandardErrorPath</key><string>$LOG</string>
</dict>
</plist>
EOF

launchctl bootstrap "$GUI" "$PLIST"
echo "Installed $LABEL (every 3h + at login). Log: $LOG"
