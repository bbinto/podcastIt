#!/usr/bin/env python3
"""
PodcastIt HTTP Server — runs on the Raspberry Pi.
Receives markdown content from the Chrome extension and runs the podcast pipeline.

Start: python3 server.py
"""

import json
import os
import subprocess
import datetime
import hmac
import hashlib
from http.server import BaseHTTPRequestHandler, HTTPServer

# ── Config ─────────────────────────────────────────────────────────────────────
CONFIG_FILE     = os.path.join(os.path.dirname(__file__), 'server_config.json')
LOG_FILE        = os.path.join(os.path.dirname(__file__), '..', 'podcastit.log')
MAX_LOG_BYTES   = 1 * 1024 * 1024

DEFAULT_CONFIG = {
    "api_token":       "change-me-please",
    "host":            "0.0.0.0",
    "port":            5050,
    "md_save_dir":     "/home/pi/Downloads",
    "podcast_script":  "/home/pi/Documents/GitHub/md-to-podcast/md2podcast.py",
    "upload_script":   "/home/pi/Documents/GitHub/md-to-podcast/upload_podcast_ftp.py",
    "podcast_out_dir": "/home/pi/Documents/GitHub/md-to-podcast/podcast"
}


def load_config():
    if not os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'w') as f:
            json.dump(DEFAULT_CONFIG, f, indent=2)
        print(f"Created default config at {CONFIG_FILE} — edit api_token before use!")
    with open(CONFIG_FILE) as f:
        cfg = json.load(f)
    # Fill in any missing keys from defaults
    for k, v in DEFAULT_CONFIG.items():
        cfg.setdefault(k, v)
    return cfg


# ── Logger ─────────────────────────────────────────────────────────────────────
def _ts():
    return datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

def _log(level, msg):
    log_path = os.path.abspath(LOG_FILE)
    try:
        if os.path.exists(log_path) and os.path.getsize(log_path) > MAX_LOG_BYTES:
            with open(log_path, 'r', encoding='utf-8', errors='replace') as f:
                lines = f.readlines()
            half = len(lines) // 2
            with open(log_path, 'w', encoding='utf-8') as f:
                f.write(f"[{_ts()}] [INFO ] Log rotated\n")
                f.writelines(lines[half:])
        with open(log_path, 'a', encoding='utf-8') as f:
            f.write(f"[{_ts()}] [{level:<5}] {msg}\n")
    except Exception:
        pass
    print(f"[{level}] {msg}")

def log_info(msg):  _log('INFO',  msg)
def log_warn(msg):  _log('WARN',  msg)
def log_error(msg): _log('ERROR', msg)


# ── Auth ───────────────────────────────────────────────────────────────────────
def token_ok(request_token, expected_token):
    """Constant-time comparison to avoid timing attacks."""
    if not expected_token or expected_token == 'change-me-please':
        log_warn("API token is default — set a real token in server_config.json")
        return True  # Allow through with warning if token is still default
    return hmac.compare_digest(
        request_token.encode('utf-8'),
        expected_token.encode('utf-8')
    )


# ── Request handler ────────────────────────────────────────────────────────────
class Handler(BaseHTTPRequestHandler):

    def log_message(self, fmt, *args):
        log_info(f"{self.client_address[0]} — {fmt % args}")

    def send_json(self, code, data):
        body = json.dumps(data).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Api-Token')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.end_headers()

    def do_GET(self):
        if self.path == '/ping':
            token = self.headers.get('X-Api-Token', '')
            if not token_ok(token, CONFIG['api_token']):
                self.send_json(401, {'ok': False, 'error': 'Invalid API token'})
                return
            self.send_json(200, {'ok': True, 'service': 'PodcastIt'})
        else:
            self.send_json(404, {'error': 'Not found'})

    def do_POST(self):
        if self.path != '/convert':
            self.send_json(404, {'error': 'Not found'})
            return

        # Auth
        token = self.headers.get('X-Api-Token', '')
        if not token_ok(token, CONFIG['api_token']):
            log_warn(f"Rejected request from {self.client_address[0]} — bad token")
            self.send_json(401, {'success': False, 'error': 'Invalid API token'})
            return

        # Parse body
        length = int(self.headers.get('Content-Length', 0))
        try:
            body = json.loads(self.rfile.read(length).decode('utf-8'))
        except Exception as e:
            self.send_json(400, {'success': False, 'error': f'Bad JSON: {e}'})
            return

        md_content = body.get('mdContent', '')
        md_name    = body.get('mdName', 'podcast')
        title      = body.get('title', md_name)
        url        = body.get('url', '')

        if not md_content:
            self.send_json(400, {'success': False, 'error': 'mdContent is empty'})
            return

        log_info(f"Convert request: title={title!r}  mdName={md_name!r}  chars={len(md_content)}")

        # Save .md file
        md_dir = CONFIG['md_save_dir']
        os.makedirs(md_dir, exist_ok=True)
        md_path = os.path.join(md_dir, f"{md_name}.md")
        # Avoid overwriting by appending timestamp if file exists
        if os.path.exists(md_path):
            ts = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
            md_path = os.path.join(md_dir, f"{md_name}_{ts}.md")
        with open(md_path, 'w', encoding='utf-8') as f:
            f.write(md_content)
        log_info(f"Saved MD: {md_path} ({os.path.getsize(md_path):,} bytes)")

        # Run podcast pipeline
        mp3_path = os.path.join(CONFIG['podcast_out_dir'], f"{md_name}.mp3")
        cmd = (
            f'python3 "{CONFIG["podcast_script"]}" "{md_path}" "{mp3_path}"'
            f' --engine edge --publish'
            f' && python3 "{CONFIG["upload_script"]}"'
        )
        log_info(f"Running: {cmd}")

        try:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=600)

            for line in result.stdout.strip().splitlines():
                log_info(f"[stdout] {line}")
            for line in result.stderr.strip().splitlines():
                log_warn(f"[stderr] {line}")

            if result.returncode == 0:
                log_info(f"=== Done: {md_name}.mp3 ===")
                self.send_json(200, {'success': True, 'output': result.stdout, 'mp3': f"{md_name}.mp3"})
            else:
                err = result.stderr.strip() or result.stdout.strip() or f"Exit code {result.returncode}"
                log_error(f"Pipeline failed (exit {result.returncode}): {err}")
                self.send_json(500, {'success': False, 'error': err})

        except subprocess.TimeoutExpired:
            log_error("Pipeline timed out after 10 minutes")
            self.send_json(500, {'success': False, 'error': 'Podcast script timed out (10 min)'})
        except Exception as e:
            log_error(f"Unexpected error: {e}")
            self.send_json(500, {'success': False, 'error': str(e)})


# ── Entry point ────────────────────────────────────────────────────────────────
CONFIG = load_config()

if __name__ == '__main__':
    host = CONFIG['host']
    port = CONFIG['port']
    log_info(f"PodcastIt server starting on {host}:{port}")
    log_info(f"MD save dir:     {CONFIG['md_save_dir']}")
    log_info(f"Podcast out dir: {CONFIG['podcast_out_dir']}")
    if CONFIG['api_token'] == 'change-me-please':
        log_warn("WARNING: Using default API token — change it in server_config.json!")
    httpd = HTTPServer((host, port), Handler)
    log_info("Ready. Ctrl+C to stop.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        log_info("Server stopped.")
