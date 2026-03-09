importScripts('logger.js');

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
    return true; // keep channel open for async response
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

async function handleConvert({ content, title, url }) {
  await Logger.info(`=== New conversion started ===`);
  await Logger.info(`Source URL: ${url}`);
  await Logger.info(`Page title: ${title}`);
  await Logger.info(`Content length: ${content.length} chars`);

  const safeName = sanitizeFilename(title);
  const filename = safeName + '.md';
  await Logger.info(`Sanitized filename: ${filename}`);

  const mdContent = buildMarkdown(title, url, content);
  const dataUrl = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(mdContent);

  await Logger.info('Starting MD file download...');
  let downloadId;
  try {
    downloadId = await new Promise((resolve, reject) => {
      chrome.downloads.download(
        { url: dataUrl, filename, saveAs: false, conflictAction: 'uniquify' },
        (id) => {
          if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
          else resolve(id);
        }
      );
    });
    await Logger.info(`Download initiated, id=${downloadId}`);
  } catch (err) {
    await Logger.error('Download failed to start: ' + err.message);
    throw err;
  }

  let finalPath;
  try {
    finalPath = await waitForDownload(downloadId);
    await Logger.info(`Download complete: ${finalPath}`);
  } catch (err) {
    await Logger.error('Download did not complete: ' + err.message);
    throw err;
  }

  await Logger.info('Sending to native host...');
  try {
    const result = await sendToNativeHost({ mdPath: finalPath, mdName: safeName });
    await Logger.info('Native host returned success.');
    if (result.output) await Logger.info('Host output: ' + result.output.trim());
    return { success: true, mp3Name: safeName + '.mp3', mdFile: filename, output: result.output };
  } catch (err) {
    await Logger.error('Native host error: ' + err.message);
    throw err;
  }
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

function waitForDownload(downloadId) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      chrome.downloads.onChanged.removeListener(listener);
      reject(new Error('Download timed out after 30s'));
    }, 30000);

    function listener(delta) {
      if (delta.id !== downloadId) return;
      if (delta.state) {
        if (delta.state.current === 'complete') {
          clearTimeout(timeout);
          chrome.downloads.onChanged.removeListener(listener);
          chrome.downloads.search({ id: downloadId }, (items) => {
            if (items && items[0]) resolve(items[0].filename);
            else reject(new Error('Cannot find completed download item'));
          });
        } else if (delta.state.current === 'interrupted') {
          clearTimeout(timeout);
          chrome.downloads.onChanged.removeListener(listener);
          reject(new Error('Download was interrupted by browser'));
        }
      }
    }

    chrome.downloads.onChanged.addListener(listener);
  });
}

function sendToNativeHost(payload) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendNativeMessage(
      'com.podcastit.host',
      payload,
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response && response.success) {
          resolve({ success: true, output: response.output || '' });
        } else {
          reject(new Error(response ? response.error : 'Unknown native host error'));
        }
      }
    );
  });
}
