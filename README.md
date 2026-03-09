# PodcastIt

Chrome extension that converts selected text (or the full page) into a podcast episode using [md2podcast](https://github.com/your-repo/md-to-podcast).

## How it works

1. Highlight text on any page (or select nothing to use the full page).
2. Click the PodcastIt extension icon → **Convert to Podcast**.
3. The extension:
   - Extracts the selected/full content and saves it as a `.md` file in your Downloads folder.
   - Sends the file path to a local native host process.
   - The native host runs:
     ```
     python /home/pi/Documents/GitHub/md-to-podcast/md2podcast.py \
       /{downloads}/{file}.md \
       /home/pi/Documents/GitHub/md-to-podcast/podcast/{file}.mp3 \
       --engine edge --publish \
     && python /home/pi/Documents/GitHub/md-to-podcast/upload_podcast_ftp.py
     ```

## Setup

### 1. Load the extension

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select this folder
4. Copy your **Extension ID** from the extensions page

### 2. Install the native host

```bash
./install_native_host.sh <your-extension-id>
```

This registers `com.podcastit.host` with Chrome/Chromium so the extension can launch local scripts.

### 3. Done

Click the extension on any page and hit **Convert to Podcast**.

## Files

```
podcastIt/
├── manifest.json           # Extension manifest (MV3)
├── popup.html / popup.js   # Toolbar popup UI
├── background.js           # Service worker: download MD + call native host
├── content.js              # Content script (minimal)
├── icons/                  # Extension icons
├── native_host/
│   ├── podcastit_host.py   # Native messaging host (runs podcast scripts)
│   └── com.podcastit.host.json  # Native host manifest template
└── install_native_host.sh  # One-time setup script
```
