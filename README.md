# PodcastIt

Chrome extension that converts selected text (or the full page) into a podcast episode using [md2podcast](https://github.com/your-repo/md-to-podcast).

Works from **any computer** on your network — the extension talks to a lightweight HTTP server running on the Raspberry Pi.

---

## How it works

1. Highlight text on any page (or select nothing to use the full page).
2. Click the PodcastIt extension icon → **Convert to Podcast**.
3. The extension POSTs the content to the Pi server.
4. The Pi server saves a `.md` file and runs:
   ```
   python3 md2podcast.py {file}.md {file}.mp3 --engine edge --publish
   && python3 upload_podcast_ftp.py
   ```
5. The popup shows a green card on success or a red card with the error message.

---

## Setup

### 1. Start the server on the Pi

```bash
cd /home/pi/Documents/GitHub/podcastIt/server
python3 server.py
```

The first run creates `server_config.json`. Stop the server (`Ctrl+C`), edit the file and set a real `api_token`, then restart.

```json
{
  "api_token": "your-secret-token",
  "host": "0.0.0.0",
  "port": 5050,
  "md_save_dir": "/home/pi/Downloads",
  "podcast_script": "/home/pi/Documents/GitHub/md-to-podcast/md2podcast.py",
  "upload_script": "/home/pi/Documents/GitHub/md-to-podcast/upload_podcast_ftp.py",
  "podcast_out_dir": "/home/pi/Documents/GitHub/md-to-podcast/podcast"
}
```

#### Run as a permanent service (auto-starts on boot)

```bash
./install_service.sh
```

Useful commands after installing:

```bash
sudo systemctl status podcastit    # check status
sudo systemctl stop podcastit      # stop
sudo journalctl -u podcastit -f    # live logs
```

---

### 2. Load the extension

1. Open `chrome://extensions` in Chrome
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** → select the `podcastIt/` folder
4. The PodcastIt icon appears in your toolbar

---

### 3. Configure the extension

1. Click the PodcastIt icon → click **⚙️** (top-right)
2. Set **Pi Server URL** → `http://<your-pi-ip>:5050`
   - Find your Pi's IP with: `hostname -I`
3. Set **API Token** → same value as `api_token` in `server_config.json`
4. Click **Ping** to verify the connection
5. Click **Save**

---

### 4. Use it

- Highlight text on any page (or leave nothing selected for the full page)
- Click the extension icon → **Convert to Podcast**
- The popup shows live status and a result card when done

---

## Logging

**Extension log** — click **📋 Logs** in the popup. Auto-opens if any errors occurred.

**Server log** — written to `podcastit.log` in the repo root. Includes all stdout/stderr from the podcast and upload scripts. Tail it live:

```bash
tail -f /home/pi/Documents/GitHub/podcastIt/podcastit.log
```

---

## File structure

```
podcastIt/
├── manifest.json           # Extension manifest (MV3)
├── popup.html / popup.js   # Toolbar popup UI + settings + log panel
├── background.js           # Service worker: builds MD, POSTs to Pi server
├── logger.js               # Shared log module (chrome.storage.local)
├── content.js              # Content script (minimal)
├── icons/                  # Extension icons (16, 48, 128px)
└── server/
    ├── server.py           # HTTP server — receives content, runs pipeline
    ├── server_config.json  # Created on first run — set api_token here
    ├── podcastit.service   # systemd unit file
    └── install_service.sh  # Installs and enables the systemd service
```
