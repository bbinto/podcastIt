const btn               = document.getElementById('convertBtn');
const status            = document.getElementById('status');
const logPanel          = document.getElementById('logPanel');
const logToggleBtn      = document.getElementById('logToggleBtn');
const logEntries        = document.getElementById('logEntries');
const clearLogsBtn      = document.getElementById('clearLogsBtn');
const lastJobEl         = document.getElementById('lastJob');
const settingsPanel     = document.getElementById('settingsPanel');
const settingsToggleBtn = document.getElementById('settingsToggleBtn');
const localUrlInput     = document.getElementById('localUrlInput');
const ngrokUrlInput     = document.getElementById('ngrokUrlInput');
const apiTokenInput     = document.getElementById('apiTokenInput');
const saveSettingsBtn   = document.getElementById('saveSettingsBtn');
const pingBtn           = document.getElementById('pingBtn');
const pingStatus        = document.getElementById('pingStatus');
const modeLocalBtn      = document.getElementById('modeLocalBtn');
const modeNgrokBtn      = document.getElementById('modeNgrokBtn');
const localUrlField     = document.getElementById('localUrlField');
const ngrokUrlField     = document.getElementById('ngrokUrlField');

const DEFAULT_LOCAL_URL = 'http://10.88.111.48:5050';

// ── Mode toggle ────────────────────────────────────────────────────────────────
function setMode(mode) {
  if (mode === 'ngrok') {
    modeNgrokBtn.classList.add('active');
    modeLocalBtn.classList.remove('active');
    localUrlField.style.display = 'none';
    ngrokUrlField.style.display = '';
  } else {
    modeLocalBtn.classList.add('active');
    modeNgrokBtn.classList.remove('active');
    localUrlField.style.display = '';
    ngrokUrlField.style.display = 'none';
  }
}

modeLocalBtn.addEventListener('click', () => setMode('local'));
modeNgrokBtn.addEventListener('click', () => setMode('ngrok'));

// ── Settings ───────────────────────────────────────────────────────────────────
settingsToggleBtn.addEventListener('click', () => {
  settingsPanel.classList.toggle('open');
});

chrome.storage.local.get(['podcastit_local_url', 'podcastit_ngrok_url', 'podcastit_mode', 'podcastit_api_token'], (data) => {
  localUrlInput.value = data.podcastit_local_url || DEFAULT_LOCAL_URL;
  ngrokUrlInput.value = data.podcastit_ngrok_url || '';
  apiTokenInput.value = data.podcastit_api_token || '';
  setMode(data.podcastit_mode || 'local');
});

saveSettingsBtn.addEventListener('click', () => {
  const mode      = modeNgrokBtn.classList.contains('active') ? 'ngrok' : 'local';
  const localUrl  = localUrlInput.value.trim().replace(/\/$/, '');
  const ngrokUrl  = ngrokUrlInput.value.trim().replace(/\/$/, '');
  const token     = apiTokenInput.value.trim();
  chrome.storage.local.set({
    podcastit_mode:      mode,
    podcastit_local_url: localUrl,
    podcastit_ngrok_url: ngrokUrl,
    podcastit_api_token: token
  }, () => {
    saveSettingsBtn.textContent = 'Saved ✓';
    setTimeout(() => { saveSettingsBtn.textContent = 'Save'; }, 1500);
  });
});

function getActiveUrl() {
  const mode = modeNgrokBtn.classList.contains('active') ? 'ngrok' : 'local';
  return mode === 'ngrok'
    ? ngrokUrlInput.value.trim().replace(/\/$/, '')
    : localUrlInput.value.trim().replace(/\/$/, '');
}

pingBtn.addEventListener('click', async () => {
  const url   = getActiveUrl();
  const token = apiTokenInput.value.trim();
  pingStatus.textContent = 'Pinging…';
  pingStatus.className   = '';
  try {
    const resp = await fetch(`${url}/ping`, {
      headers: { 'X-Api-Token': token }
    });
    const body = await resp.json();
    if (resp.ok && body.ok) {
      pingStatus.textContent = '✓ Server reachable';
      pingStatus.className   = 'ok';
    } else {
      pingStatus.textContent = `✗ ${body.error || 'Unexpected response'}`;
      pingStatus.className   = 'err';
    }
  } catch (err) {
    pingStatus.textContent = `✗ ${err.message}`;
    pingStatus.className   = 'err';
  }
});

// ── Last job card ──────────────────────────────────────────────────────────────
function renderLastJob(job) {
  if (!job) return;
  lastJobEl.className = job.success ? 'success' : 'error';
  document.getElementById('jobIcon').textContent     = job.success ? '✅' : '❌';
  document.getElementById('jobHeadline').textContent = job.success ? 'Podcast uploaded!' : 'Conversion failed';
  document.getElementById('jobFile').textContent     = job.success ? (job.mp3Name || '') : '';
  document.getElementById('jobErrorMsg').textContent = job.success ? '' : (job.error || 'Unknown error');
  const d = new Date(job.ts);
  const timeStr = d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  document.getElementById('jobTime').textContent =
    `${timeStr}${job.title ? '  ·  ' + job.title.substring(0, 40) : ''}`;
}

async function loadLastJob() {
  const resp = await chrome.runtime.sendMessage({ action: 'getLastJob' });
  if (resp && resp.job) renderLastJob(resp.job);
}

// ── Status helper ──────────────────────────────────────────────────────────────
function setStatus(msg, type = '') {
  status.textContent = msg;
  status.className = type;
}

// ── Log panel ──────────────────────────────────────────────────────────────────
function renderLogs(logs) {
  if (!logs || logs.length === 0) {
    logEntries.innerHTML = '<div id="noLogs">No logs yet.</div>';
    return;
  }
  logEntries.innerHTML = logs.map(entry => {
    const time = entry.ts.replace('T', ' ').replace(/\.\d+Z$/, '');
    const msgClass = entry.level === 'ERROR' ? 'log-msg ERROR' : 'log-msg';
    return `<div class="log-entry">
      <span class="log-ts">${time}</span>
      <span class="log-level ${entry.level}">${entry.level}</span>
      <span class="${msgClass}">${escapeHtml(entry.msg)}</span>
    </div>`;
  }).join('');
  logEntries.scrollTop = logEntries.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

async function refreshLogs() {
  const resp = await chrome.runtime.sendMessage({ action: 'getLogs' });
  renderLogs(resp.logs);
}

logToggleBtn.addEventListener('click', () => {
  const open = logPanel.classList.toggle('open');
  logToggleBtn.textContent = open ? '📋 Hide' : '📋 Logs';
  if (open) refreshLogs();
});

clearLogsBtn.addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ action: 'clearLogs' });
  renderLogs([]);
});

// ── Convert ────────────────────────────────────────────────────────────────────
btn.addEventListener('click', async () => {
  btn.disabled = true;
  setStatus('Extracting content...');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const selected = window.getSelection().toString().trim();
        if (selected) return { content: selected, source: 'selection' };
        const article = document.querySelector('article') ||
                        document.querySelector('main') ||
                        document.body;
        return { content: article.innerText.trim(), source: 'page', title: document.title };
      }
    });

    const { content, source, title } = results[0].result;

    if (!content) {
      setStatus('No content found on page.', 'error');
      btn.disabled = false;
      return;
    }

    setStatus(`Got ${source} content (${content.length} chars). Sending to Pi...`);

    const response = await chrome.runtime.sendMessage({
      action: 'convertToPodcast',
      content,
      title: title || tab.title || 'podcast',
      url: tab.url
    });

    if (response.success) {
      setStatus('Done! Podcast created and uploaded.', 'success');
    } else {
      setStatus('Error: ' + response.error, 'error');
    }
    await loadLastJob();
  } catch (err) {
    setStatus('Error: ' + err.message, 'error');
    await loadLastJob();
  }

  btn.disabled = false;
  if (logPanel.classList.contains('open')) refreshLogs();
});

// ── On open ────────────────────────────────────────────────────────────────────
(async () => {
  await loadLastJob();
  const resp = await chrome.runtime.sendMessage({ action: 'getLogs' });
  if (resp && resp.logs && resp.logs.some(l => l.level === 'ERROR')) {
    logPanel.classList.add('open');
    logToggleBtn.textContent = '📋 Hide';
    renderLogs(resp.logs);
  }
})();
