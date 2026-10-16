const pages = Array.from(document.querySelectorAll('.page'));
const pageButtons = Array.from(document.querySelectorAll('[data-page]'));
const downloadForm = document.getElementById('download-form');
const downloadInput = document.getElementById('download-text');
const downloadMessage = document.getElementById('download-message');
const navigationButtons = Array.from(document.querySelectorAll('.nav-button'));

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
