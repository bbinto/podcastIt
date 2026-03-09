importScripts('logger.js');

const DEFAULT_SERVER_URL = 'http://YOUR_PI_IP:5050';

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'convertToPodcast') {
    handleConvert(msg)
      .then(async (result) => {
        await saveLastJob({ success: true, mp3Name: result.mp3Name, mdFile: result.mdFile, title: msg.title, url: msg.url });
        sendResponse(result);
      })
      .catch(async (err) => {
        await Logger.error('handleConvert failed: ' + err.message);
        await saveLastJob({ success: false, error: err.message, title: msg.title, url: msg.url });
        sendResponse({ success: false, error: err.message });
      });
    return true;
  }

  if (msg.action === 'getLogs') {
    Logger.getLogs().then(logs => sendResponse({ logs }));
    return true;
  }

  if (msg.action === 'clearLogs') {
    Logger.clear().then(() => sendResponse({ ok: true }));
    return true;
  }

  if (msg.action === 'getLastJob') {
    chrome.storage.local.get('podcastit_last_job', (data) => {
      sendResponse({ job: data.podcastit_last_job || null });
    });
    return true;
  }
});

async function getSettings() {
  return new Promise(resolve => {
    chrome.storage.local.get(['podcastit_server_url', 'podcastit_api_token'], (data) => {
      resolve({
        serverUrl: (data.podcastit_server_url || DEFAULT_SERVER_URL).replace(/\/$/, ''),
        apiToken:  data.podcastit_api_token || ''
      });
    });
  });
}

async function handleConvert({ content, title, url }) {
  await Logger.info('=== New conversion started ===');
  await Logger.info(`Source URL: ${url}`);
  await Logger.info(`Page title: ${title}`);
  await Logger.info(`Content length: ${content.length} chars`);

  const safeName  = sanitizeFilename(title);
  const mdContent = buildMarkdown(title, url, content);
  await Logger.info(`Filename: ${safeName}.md`);

  const { serverUrl, apiToken } = await getSettings();
  await Logger.info(`Sending to server: ${serverUrl}`);

  const result = await sendToServer({ mdContent, mdName: safeName, title, url }, serverUrl, apiToken);
  await Logger.info('Server returned success.');
  if (result.output) await Logger.info('Server output: ' + result.output.trim());

  return { success: true, mp3Name: safeName + '.mp3', mdFile: safeName + '.md' };
}

async function sendToServer(payload, serverUrl, apiToken) {
  let resp;
  try {
    resp = await fetch(`${serverUrl}/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Token': apiToken
      },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    throw new Error(`Cannot reach server at ${serverUrl} — is it running? (${err.message})`);
  }

  let body;
  try {
    body = await resp.json();
  } catch {
    throw new Error(`Server returned non-JSON response (HTTP ${resp.status})`);
  }

  if (!resp.ok || !body.success) {
    throw new Error(body.error || `Server error HTTP ${resp.status}`);
  }

  return body;
}

async function saveLastJob(job) {
  job.ts = new Date().toISOString();
  await chrome.storage.local.set({ podcastit_last_job: job });
}

function sanitizeFilename(title) {
  return (title || 'podcast')
    .replace(/[^a-z0-9_\-\s]/gi, '')
    .replace(/\s+/g, '_')
    .substring(0, 80)
    .trim() || 'podcast';
}

function buildMarkdown(title, url, content) {
  const date = new Date().toISOString().split('T')[0];
  return `# ${title}\n\n> Source: ${url}\n> Date: ${date}\n\n---\n\n${content}\n`;
}
