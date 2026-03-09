#!/bin/bash
# Installs the PodcastIt native messaging host for Chrome/Chromium on Linux.
# Run this once after loading the extension and getting its ID.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HOST_SCRIPT="$SCRIPT_DIR/native_host/podcastit_host.py"
HOST_MANIFEST="$SCRIPT_DIR/native_host/com.podcastit.host.json"
CHROME_NM_DIR="$HOME/.config/google-chrome/NativeMessagingHosts"
CHROMIUM_NM_DIR="$HOME/.config/chromium/NativeMessagingHosts"

# Make host script executable
chmod +x "$HOST_SCRIPT"

# Ensure python shebang works
head -1 "$HOST_SCRIPT"

echo ""
echo "==========================================="
echo "  PodcastIt Native Host Installer"
echo "==========================================="
echo ""

if [ -z "$1" ]; then
  echo "Usage: $0 <chrome-extension-id>"
  echo ""
  echo "Find your extension ID at chrome://extensions after loading the unpacked extension."
  exit 1
fi

EXT_ID="$1"

# Update allowed_origins in manifest
sed "s/REPLACE_WITH_YOUR_EXTENSION_ID/$EXT_ID/" "$HOST_MANIFEST" > /tmp/com.podcastit.host.json

# Install for Chrome
mkdir -p "$CHROME_NM_DIR"
cp /tmp/com.podcastit.host.json "$CHROME_NM_DIR/com.podcastit.host.json"
echo "Installed for Chrome: $CHROME_NM_DIR"

# Install for Chromium
mkdir -p "$CHROMIUM_NM_DIR"
cp /tmp/com.podcastit.host.json "$CHROMIUM_NM_DIR/com.podcastit.host.json"
echo "Installed for Chromium: $CHROMIUM_NM_DIR"

echo ""
echo "Done! Restart Chrome/Chromium and test the extension."
