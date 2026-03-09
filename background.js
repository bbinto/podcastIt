chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'convertToPodcast') {
    handleConvert(msg).then(sendResponse).catch(err => sendResponse({ success: false, error: err.message }));
    return true; // keep channel open for async response
  }
});

async function handleConvert({ content, title, url }) {
  // Sanitize title into a safe filename (no extension yet)
  const safeName = sanitizeFilename(title);
  const filename = safeName + '.md';

  // Build markdown content
  const mdContent = buildMarkdown(title, url, content);

  // Convert string to data URL for download
  const dataUrl = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(mdContent);

  // Download the .md file to default Downloads folder
  const downloadId = await new Promise((resolve, reject) => {
    chrome.downloads.download(
      {
        url: dataUrl,
        filename: filename,
        saveAs: false,
        conflictAction: 'uniquify'
      },
      (id) => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(id);
      }
    );
  });

  // Wait for download to complete and get the final path
  const finalPath = await waitForDownload(downloadId);

  // Trigger native host to run the podcast script
  const result = await sendToNativeHost({ mdPath: finalPath, mdName: safeName });

  return result;
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
      reject(new Error('Download timed out'));
    }, 30000);

    function listener(delta) {
      if (delta.id !== downloadId) return;

      if (delta.state) {
        if (delta.state.current === 'complete') {
          clearTimeout(timeout);
          chrome.downloads.onChanged.removeListener(listener);
          // Get final filename
          chrome.downloads.search({ id: downloadId }, (items) => {
            if (items && items[0]) resolve(items[0].filename);
            else reject(new Error('Cannot find download item'));
          });
        } else if (delta.state.current === 'interrupted') {
          clearTimeout(timeout);
          chrome.downloads.onChanged.removeListener(listener);
          reject(new Error('Download interrupted'));
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
          resolve({ success: true });
        } else {
          reject(new Error(response ? response.error : 'Unknown native host error'));
        }
      }
    );
  });
}
