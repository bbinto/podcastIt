#!/usr/bin/env python3
"""
Native Messaging Host for PodcastIt Chrome Extension.
Receives the downloaded .md file path and runs md2podcast + upload scripts.
"""

import sys
import json
import struct
import subprocess
import os

PODCAST_SCRIPT = "/home/pi/Documents/GitHub/md-to-podcast/md2podcast.py"
UPLOAD_SCRIPT  = "/home/pi/Documents/GitHub/md-to-podcast/upload_podcast_ftp.py"
PODCAST_OUT_DIR = "/home/pi/Documents/GitHub/md-to-podcast/podcast"


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


def main():
    msg = read_message()
    if msg is None:
        send_message({"success": False, "error": "No message received"})
        return

    md_path = msg.get('mdPath', '')
    md_name = msg.get('mdName', 'podcast')

    if not md_path or not os.path.isfile(md_path):
        send_message({"success": False, "error": f"MD file not found: {md_path}"})
        return

    mp3_path = os.path.join(PODCAST_OUT_DIR, f"{md_name}.mp3")

    cmd = (
        f'python {PODCAST_SCRIPT} "{md_path}" "{mp3_path}" --engine edge --publish'
        f' && python {UPLOAD_SCRIPT}'
    )

    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            timeout=600
        )
        if result.returncode == 0:
            send_message({"success": True, "output": result.stdout})
        else:
            send_message({"success": False, "error": result.stderr or result.stdout})
    except subprocess.TimeoutExpired:
        send_message({"success": False, "error": "Podcast script timed out (10 min)"})
    except Exception as e:
        send_message({"success": False, "error": str(e)})


if __name__ == '__main__':
    main()
