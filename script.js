const pages = Array.from(document.querySelectorAll('.page'));
const pageButtons = Array.from(document.querySelectorAll('[data-page]'));
const downloadForm = document.getElementById('download-form');
const downloadInput = document.getElementById('download-text');
const downloadMessage = document.getElementById('download-message');
const navigationButtons = Array.from(document.querySelectorAll('.nav-button'));
const videoDownloadForm = document.getElementById('video-download-form');
const videoUrlInput = document.getElementById('video-url');
const videoDownloadButton = document.getElementById('video-download-button');
const videoDownloadProgress = document.getElementById('video-download-progress');
const videoDownloadMessage = document.getElementById('video-download-message');
const starButton = document.getElementById('star-button');
const starButtonIcon = starButton.querySelector('.star-button-icon');
const starButtonLabel = starButton.querySelector('.star-button-label');

function showPage(pageName) {
  const page = pages.find((item) => item.id === pageName);
  if (!page) {
    return;
  }

  pages.forEach((item) => {
    const isCurrentPage = item === page;
    item.hidden = !isCurrentPage;
    item.classList.toggle('active', isCurrentPage);
  });

  navigationButtons.forEach((button) => {
    const isCurrentPage = button.dataset.page === pageName;
    button.classList.toggle('active', isCurrentPage);

    if (isCurrentPage) {
      button.setAttribute('aria-current', 'page');
    } else {
      button.removeAttribute('aria-current');
    }
  });

  if (pageName === 'download') {
    downloadMessage.textContent = '';
    videoDownloadMessage.textContent = '';
  }
}

pageButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    showPage(button.dataset.page);
  });
});

downloadForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = downloadInput.value.trim();

  if (!text) {
    downloadInput.focus();
    downloadMessage.textContent = 'Enter some text before downloading.';
    return;
  }

  const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = 'bluewave-message.txt';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(downloadUrl);
  downloadMessage.textContent = 'Your text file is ready. Thanks for sharing!';
});

starButton.addEventListener('click', () => {
  const isStarred = starButton.getAttribute('aria-pressed') !== 'true';
  starButton.setAttribute('aria-pressed', String(isStarred));
  starButtonIcon.textContent = isStarred ? '★' : '☆';
  starButtonLabel.textContent = isStarred ? 'Starred' : 'Star Bluewave';
});

videoDownloadForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const rawUrl = videoUrlInput.value.trim();
  let videoUrl;

  videoDownloadMessage.classList.remove('is-error');
  videoDownloadMessage.textContent = '';
  videoDownloadProgress.hidden = true;

  try {
    videoUrl = new URL(rawUrl);
  } catch {
    videoDownloadMessage.classList.add('is-error');
    videoDownloadMessage.textContent = 'Enter a valid direct MP4 or WebM video URL.';
    return;
  }

  if (!['http:', 'https:'].includes(videoUrl.protocol) || !/\.(mp4|webm)$/i.test(videoUrl.pathname)) {
    videoDownloadMessage.classList.add('is-error');
    videoDownloadMessage.textContent = 'Only direct HTTP(S) links ending in .mp4 or .webm are supported.';
    return;
  }

  videoDownloadButton.disabled = true;
  videoDownloadProgress.hidden = false;
  videoDownloadProgress.removeAttribute('value');
  videoDownloadMessage.textContent = 'Connecting to video...';

  try {
    const response = await fetch(videoUrl.href);
    if (!response.ok) {
      throw new Error(`The video server responded with status ${response.status}.`);
    }

    const contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (contentType && !['video/mp4', 'video/webm', 'application/octet-stream', 'binary/octet-stream'].includes(contentType)) {
      throw new Error('The link did not return a supported MP4 or WebM video file.');
    }

    const totalBytes = Number(response.headers.get('content-length')) || 0;
    const chunks = [];
    let receivedBytes = 0;

    if (response.body && response.body.getReader) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        receivedBytes += value.length;

        if (totalBytes) {
          const percent = Math.min(100, Math.round((receivedBytes / totalBytes) * 100));
          videoDownloadProgress.value = percent;
          videoDownloadMessage.textContent = `Downloading video... ${percent}%`;
        } else {
          videoDownloadMessage.textContent = `Downloading video... ${(receivedBytes / (1024 * 1024)).toFixed(1)} MB`;
        }
      }
    } else {
      const blob = await response.blob();
      chunks.push(blob);
      receivedBytes = blob.size;
    }

    const file = new Blob(chunks, { type: contentType || 'application/octet-stream' });
    const fileUrl = URL.createObjectURL(file);
    const link = document.createElement('a');
    const pathName = videoUrl.pathname.split('/').pop() || 'bluewave-video';
    link.href = fileUrl;
    link.download = pathName.replace(/[^a-z0-9._-]/gi, '_');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(fileUrl), 60000);
    videoDownloadProgress.value = 100;
    videoDownloadMessage.textContent = `Your video is ready (${(receivedBytes / (1024 * 1024)).toFixed(1)} MB).`;
  } catch (error) {
    videoDownloadMessage.classList.add('is-error');
    if (error instanceof TypeError) {
      videoDownloadMessage.textContent = 'Could not access that video. Check the link and ensure its host allows browser downloads (CORS).';
    } else {
      videoDownloadMessage.textContent = error.message || 'The video could not be downloaded.';
    }
    videoDownloadProgress.hidden = true;
  } finally {
    videoDownloadButton.disabled = false;
  }
});
