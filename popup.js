const btn = document.getElementById('convertBtn');
const status = document.getElementById('status');

function setStatus(msg, type = '') {
  status.textContent = msg;
  status.className = type;
}

btn.addEventListener('click', async () => {
  btn.disabled = true;
  setStatus('Extracting content...');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Inject content script result retrieval
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const selected = window.getSelection().toString().trim();
        if (selected) return { content: selected, source: 'selection' };

        // Full page: try to grab readable text
        const article = document.querySelector('article') ||
                        document.querySelector('main') ||
                        document.body;
        return {
          content: article.innerText.trim(),
          source: 'page',
          title: document.title
        };
      }
    });

    const { content, source, title } = results[0].result;

    if (!content) {
      setStatus('No content found on page.', 'error');
      btn.disabled = false;
      return;
    }

    setStatus(`Got ${source} content. Sending to background...`);

    // Send to background for download + native host trigger
    const response = await chrome.runtime.sendMessage({
      action: 'convertToPodcast',
      content,
      title: title || tab.title || 'podcast',
      url: tab.url
    });

    if (response.success) {
      setStatus('Podcast job started! Check your downloads.', 'success');
    } else {
      setStatus('Error: ' + response.error, 'error');
    }
  } catch (err) {
    setStatus('Error: ' + err.message, 'error');
  }

  btn.disabled = false;
});
