#!/usr/bin/env python3
"""
Native Messaging Host for PodcastIt Chrome Extension.
Pipeline:
  1. Read raw .md from extension
  2. Rewrite it into a podcast script via DeepSeek (Ollama)
  3. Save rewritten script as a new .md file
  4. Run md2podcast.py (TTS) → upload_podcast_ftp.py
"""

import sys
import json
import struct
import subprocess
import os
import datetime
import urllib.request
import urllib.error

PODCAST_SCRIPT  = "/home/pi/Documents/GitHub/md-to-podcast/md2podcast.py"
UPLOAD_SCRIPT   = "/home/pi/Documents/GitHub/md-to-podcast/upload_podcast_ftp.py"
PODCAST_OUT_DIR = "/home/pi/Documents/GitHub/md-to-podcast/podcast"
LOG_FILE        = "/home/pi/Documents/GitHub/podcastIt/podcastit.log"
MAX_LOG_BYTES   = 1 * 1024 * 1024  # 1 MB — rotate when exceeded

OLLAMA_URL      = "http://localhost:11434/api/generate"
OLLAMA_MODEL    = "deepseek-v3.1:671b-cloud"
OLLAMA_TIMEOUT  = 300  # seconds — large model may be slow


# ── Logger ─────────────────────────────────────────────────────────────────────

def _log(level, msg):
    try:
        if os.path.exists(LOG_FILE) and os.path.getsize(LOG_FILE) > MAX_LOG_BYTES:
            with open(LOG_FILE, 'r', encoding='utf-8', errors='replace') as f:
                lines = f.readlines()
            half = len(lines) // 2
            with open(LOG_FILE, 'w', encoding='utf-8') as f:
                f.write(f"[{_ts()}] [INFO ] Log rotated — keeping last {len(lines) - half} lines\n")
                f.writelines(lines[half:])
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(f"[{_ts()}] [{level:<5}] {msg}\n")
    except Exception:
        pass


def _ts():
    return datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

def log_info(msg):  _log('INFO',  msg)
def log_warn(msg):  _log('WARN',  msg)
def log_error(msg): _log('ERROR', msg)


# ── Native messaging protocol ──────────────────────────────────────────────────

def read_message():
    raw_length = sys.stdin.buffer.read(4)
    if not raw_length:
        return None
    length = struct.unpack('<I', raw_length)[0]
    data = sys.stdin.buffer.read(length)
    return json.loads(data.decode('utf-8'))


def send_message(msg):
    encoded = json.dumps(msg).encode('utf-8')
    sys.stdout.buffer.write(struct.pack('<I', len(encoded)))
    sys.stdout.buffer.write(encoded)
    sys.stdout.buffer.flush()


# ── DeepSeek rewrite via Ollama ────────────────────────────────────────────────

PODCAST_PROMPT = """\
You are a podcast script writer. Rewrite the following article as a \
natural, engaging podcast script. Rules:
- Write in a clear conversational spoken style — no bullet points, no markdown, \
  no headers, no URLs, no code blocks.
- Keep all the important information and facts from the original.
- Remove any navigation text, ads, cookie notices, or web UI boilerplate.
- Do NOT add an intro like "Welcome to the show" or an outro — just the content.
- Output only the final script text, nothing else.

ARTICLE:
{content}
"""

def rewrite_with_deepseek(raw_text: str) -> str:
    """Send raw article text to DeepSeek via Ollama, return rewritten podcast script."""
    prompt = PODCAST_PROMPT.format(content=raw_text)
    payload = json.dumps({
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False
    }).encode('utf-8')

    req = urllib.request.Request(
        OLLAMA_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    log_info(f"Calling Ollama model={OLLAMA_MODEL} prompt_len={len(prompt)} chars ...")
    with urllib.request.urlopen(req, timeout=OLLAMA_TIMEOUT) as resp:
        body = json.loads(resp.read().decode('utf-8'))

    script = body.get("response", "").strip()
    if not script:
        raise ValueError("Ollama returned an empty response")

    log_info(f"DeepSeek rewrite complete — {len(script)} chars")
    return script


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    log_info("=== Native host started ===")

    msg = read_message()
    if msg is None:
        log_error("No message received from extension")
        send_message({"success": False, "error": "No message received"})
        return

    md_path = msg.get('mdPath', '')
    md_name = msg.get('mdName', 'podcast')
    log_info(f"Received: mdPath={md_path!r}  mdName={md_name!r}")

    if not md_path or not os.path.isfile(md_path):
        log_error(f"MD file not found: {md_path}")
        send_message({"success": False, "error": f"MD file not found: {md_path}"})
        return

    log_info(f"MD file on disk: {md_path} ({os.path.getsize(md_path):,} bytes)")

    # ── Step 1: read raw content ───────────────────────────────────────────────
    with open(md_path, 'r', encoding='utf-8') as f:
        raw_content = f.read()

    # ── Step 2: rewrite with DeepSeek ─────────────────────────────────────────
    try:
        podcast_script = rewrite_with_deepseek(raw_content)
    except urllib.error.URLError as e:
        log_error(f"Ollama connection failed: {e}")
        send_message({"success": False, "error": f"Ollama not reachable ({e}). Is it running?"})
        return
    except Exception as e:
        log_error(f"DeepSeek rewrite failed: {e}")
        send_message({"success": False, "error": f"DeepSeek rewrite failed: {e}"})
        return

    # ── Step 3: save rewritten script as new .md ──────────────────────────────
    rewritten_md_path = md_path.replace('.md', '_podcast.md')
    with open(rewritten_md_path, 'w', encoding='utf-8') as f:
        f.write(podcast_script)
    log_info(f"Rewritten script saved: {rewritten_md_path} ({len(podcast_script):,} chars)")

    # ── Step 4: run TTS + upload ───────────────────────────────────────────────
    mp3_path = os.path.join(PODCAST_OUT_DIR, f"{md_name}.mp3")
    log_info(f"Target MP3: {mp3_path}")

    cmd = (
        f'python3 "{PODCAST_SCRIPT}" "{rewritten_md_path}" "{mp3_path}" --engine edge --publish'
        f' && python3 "{UPLOAD_SCRIPT}"'
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
            send_message({"success": True, "output": result.stdout})
        else:
            err = result.stderr.strip() or result.stdout.strip() or f"Exit code {result.returncode}"
            log_error(f"Command failed (exit {result.returncode}): {err}")
            send_message({"success": False, "error": err})

    except subprocess.TimeoutExpired:
        log_error("Podcast script timed out after 10 minutes")
        send_message({"success": False, "error": "Podcast script timed out (10 min)"})
    except Exception as e:
        log_error(f"Unexpected exception: {e}")
        send_message({"success": False, "error": str(e)})

    log_info("=== Native host exiting ===")


if __name__ == '__main__':
    main()
