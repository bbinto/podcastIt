/**
 * PodcastIt Logger
 * Stores log entries in chrome.storage.local.
 * Each entry: { ts: ISO string, level: 'INFO'|'WARN'|'ERROR', msg: string }
 * Capped at MAX_ENTRIES to avoid unbounded growth.
 */

const STORAGE_KEY = 'podcastit_logs';
const MAX_ENTRIES = 200;

const Logger = {
  async _append(level, msg) {
    const entry = {
      ts: new Date().toISOString(),
      level,
      msg: String(msg)
    };
    const data = await chrome.storage.local.get(STORAGE_KEY);
    const logs = data[STORAGE_KEY] || [];
    logs.push(entry);
    // Keep only the last MAX_ENTRIES
    if (logs.length > MAX_ENTRIES) logs.splice(0, logs.length - MAX_ENTRIES);
    await chrome.storage.local.set({ [STORAGE_KEY]: logs });
    // Also emit to service worker console for DevTools visibility
    const line = `[PodcastIt][${level}] ${entry.ts.replace('T', ' ').replace('Z', '')} — ${msg}`;
    if (level === 'ERROR') console.error(line);
    else if (level === 'WARN')  console.warn(line);
    else                        console.log(line);
  },

  info(msg)  { return Logger._append('INFO',  msg); },
  warn(msg)  { return Logger._append('WARN',  msg); },
  error(msg) { return Logger._append('ERROR', msg); },

  async getLogs() {
    const data = await chrome.storage.local.get(STORAGE_KEY);
    return data[STORAGE_KEY] || [];
  },

  async clear() {
    await chrome.storage.local.set({ [STORAGE_KEY]: [] });
  }
};
