#!/bin/bash
# Install PodcastIt as a systemd service that auto-starts on boot.
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

sudo cp "$SCRIPT_DIR/podcastit.service" /etc/systemd/system/podcastit.service
sudo systemctl daemon-reload
sudo systemctl enable podcastit
sudo systemctl start podcastit

echo ""
echo "PodcastIt service installed and started."
echo "  Status:  sudo systemctl status podcastit"
echo "  Logs:    sudo journalctl -u podcastit -f"
echo "  Stop:    sudo systemctl stop podcastit"
