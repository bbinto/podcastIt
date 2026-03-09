const btn          = document.getElementById('convertBtn');
const status       = document.getElementById('status');
const logPanel     = document.getElementById('logPanel');
const logToggleBtn = document.getElementById('logToggleBtn');
const logEntries   = document.getElementById('logEntries');
const clearLogsBtn = document.getElementById('clearLogsBtn');
const lastJobEl    = document.getElementById('lastJob');

// ── Last job card ──────────────────────────────────────────────────────────────
function renderLastJob(job) {
  if (!job) return;
  lastJobEl.className = job.success ? 'success' : 'error';

  document.getElementById('jobIcon').textContent     = job.success ? '✅' : '❌';
  document.getElementById('jobHeadline').textContent = job.success ? 'Podcast uploaded!' : 'Conversion failed';
  document.getElementById('jobFile').textContent     = job.success ? job.mp3Name || '' : '';
  document.getElementById('jobErrorMsg').textContent = job.success ? '' : (job.error || 'Unknown error');

  const d = new Date(job.ts);
  const timeStr = d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  document.getElementById('jobTime').textContent = `${timeStr}${job.title ? '  ·  ' + job.title.substring(0, 40) : ''}`;
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

// ── Log panel rendering ────────────────────────────────────────────────────────
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
  // Auto-scroll to bottom
  logEntries.scrollTop = logEntries.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

async function refreshLogs() {
  const resp = await chrome.runtime.sendMessage({ action: 'getLogs' });
  renderLogs(resp.logs);
}

// ── Log panel toggle ───────────────────────────────────────────────────────────
logToggleBtn.addEventListener('click', () => {
  const open = logPanel.classList.toggle('open');
  logToggleBtn.textContent = open ? '📋 Hide' : '📋 Logs';
  if (open) refreshLogs();
});

// ── Clear logs ─────────────────────────────────────────────────────────────────
clearLogsBtn.addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ action: 'clearLogs' });
  renderLogs([]);
});

// ── Convert button ─────────────────────────────────────────────────────────────
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

    setStatus(`Got ${source} content (${content.length} chars). Processing...`);

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
    // Update the result card immediately
    await loadLastJob();
  } catch (err) {
    setStatus('Error: ' + err.message, 'error');
    await loadLastJob();
  }

  btn.disabled = false;

  // Refresh log panel if open
  if (logPanel.classList.contains('open')) refreshLogs();
});

// On popup open: load last job card + auto-open log panel on errors
(async () => {
  await loadLastJob();
  const resp = await chrome.runtime.sendMessage({ action: 'getLogs' });
  if (resp && resp.logs && resp.logs.some(l => l.level === 'ERROR')) {
    logPanel.classList.add('open');
    logToggleBtn.textContent = '📋 Hide';
    renderLogs(resp.logs);
  }
})();
