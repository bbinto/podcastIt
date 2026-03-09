#!/usr/bin/env python3
"""
Native Messaging Host for PodcastIt Chrome Extension.
Receives the downloaded .md file path, runs md2podcast + upload scripts,
and writes a persistent log to podcastit.log beside this script.
"""

import sys
import json
import struct
import subprocess
import os
import datetime

PODCAST_SCRIPT  = "/home/pi/Documents/GitHub/md-to-podcast/md2podcast.py"
UPLOAD_SCRIPT   = "/home/pi/Documents/GitHub/md-to-podcast/upload_podcast_ftp.py"
PODCAST_OUT_DIR = "/home/pi/Documents/GitHub/md-to-podcast/podcast"
LOG_FILE        = "/home/pi/Documents/GitHub/podcastIt/podcastit.log"
MAX_LOG_BYTES   = 1 * 1024 * 1024  # 1 MB — rotate when exceeded


# ── Logger ─────────────────────────────────────────────────────────────────────

def _log(level, msg):
    """Append a timestamped line to the log file. Rotates at MAX_LOG_BYTES."""
    try:
        # Rotate: keep the last half of the file when it gets too large
        if os.path.exists(LOG_FILE) and os.path.getsize(LOG_FILE) > MAX_LOG_BYTES:
            with open(LOG_FILE, 'r', encoding='utf-8', errors='replace') as f:
                lines = f.readlines()
            half = len(lines) // 2
            with open(LOG_FILE, 'w', encoding='utf-8') as f:
                f.write(f"[{_ts()}] [INFO ] Log rotated — keeping last {len(lines) - half} lines\n")
                f.writelines(lines[half:])

        ts = _ts()
        line = f"[{ts}] [{level:<5}] {msg}\n"
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(line)
    except Exception:
        pass  # Never let logging crash the host


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
    log_info(f"Received request: mdPath={md_path!r}, mdName={md_name!r}")

    if not md_path:
        log_error("mdPath is empty")
        send_message({"success": False, "error": "mdPath is empty"})
        return

    if not os.path.isfile(md_path):
        log_error(f"MD file not found: {md_path}")
        send_message({"success": False, "error": f"MD file not found: {md_path}"})
        return

    log_info(f"MD file confirmed on disk: {md_path} ({os.path.getsize(md_path)} bytes)")

    mp3_path = os.path.join(PODCAST_OUT_DIR, f"{md_name}.mp3")
    log_info(f"Target MP3 path: {mp3_path}")

    cmd = (
        f'python3 "{PODCAST_SCRIPT}" "{md_path}" "{mp3_path}" --engine edge --publish'
        f' && python3 "{UPLOAD_SCRIPT}"'
    )
    log_info(f"Running command: {cmd}")

    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            timeout=600
        )

        if result.stdout.strip():
            for line in result.stdout.strip().splitlines():
                log_info(f"[stdout] {line}")
        if result.stderr.strip():
            for line in result.stderr.strip().splitlines():
                log_warn(f"[stderr] {line}")

        if result.returncode == 0:
            log_info("Command completed successfully")
            log_info(f"=== Conversion done: {md_name}.mp3 ===")
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
