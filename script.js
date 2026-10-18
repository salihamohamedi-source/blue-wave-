const pages = Array.from(document.querySelectorAll('.page'));
const pageButtons = Array.from(document.querySelectorAll('[data-page]'));
const navigationButtons = Array.from(document.querySelectorAll('.nav-button[data-page]'));
const downloadForm = document.getElementById('download-form');
const downloadInput = document.getElementById('download-text');
const downloadMessage = document.getElementById('download-message');
const videoDownloadForm = document.getElementById('video-download-form');
const videoUrlInput = document.getElementById('video-url');
const videoDownloadButton = document.getElementById('video-download-button');
const videoDownloadProgress = document.getElementById('video-download-progress');
const videoDownloadMessage = document.getElementById('video-download-message');
const previewButton = document.getElementById('preview-button');
const videoPreview = document.getElementById('video-preview');
const videoPreviewMessage = document.getElementById('video-preview-message');
const videoFilenameInput = document.getElementById('video-filename');
const languageToggle = document.getElementById('language-toggle');
const historyList = document.getElementById('download-history-list');
const historyStatistics = document.getElementById('download-statistics');
const clearHistoryButton = document.getElementById('clear-history-button');
const starButton = document.getElementById('star-button');
const starButtonIcon = starButton.querySelector('.star-button-icon');
const starButtonLabel = starButton.querySelector('.star-button-label');
const historyStorageKey = 'bluewave-download-history-v1';
const statisticsStorageKey = 'bluewave-download-statistics-v1';
const maxHistoryItems = 50;
const maxVideoBytes = 500 * 1024 * 1024;

const messages = {
  en: {
    navTeam: 'My team', navSocial: 'Social media', navHome: 'Home',
    languageLabel: 'Switch language to Arabic', languageButton: 'العربية',
    downloadProgressLabel: 'Video download progress',
    statusText: 'A little space to explore', welcome: 'Welcome to Bluewave',
    heroFirst: 'Make a splash.', heroSecond: 'Find your flow.',
    teamEyebrow: 'The people behind it', teamTitle: 'Meet my team',
    teamDescription: 'A small team with big ideas and a shared love of making things.',
    teamMember: 'Team member', socialEyebrow: 'Find us out there',
    socialTitle: 'Let’s be social', socialDescription: 'Follow along for updates, ideas, and more.',
    instagram: 'Instagram', footerText: 'Made to make you smile',
    intro: 'A bright, simple place to share, discover, and connect. Dive in and see where the bubbles take you.',
    startExploring: 'Start exploring', heroNote: 'Good things are just below the surface',
    star: 'Star Bluewave', starred: 'Starred',
    presenceUnavailable: 'Live user count is unavailable until a real-time presence service is configured.',
    downloadEyebrow: 'Your own little download', downloadTitle: 'Save a message',
    textDownloadDescription: 'Type something below and download it as a text file.',
    textToDownload: 'Text to download', textPlaceholder: 'Write something lovely...',
    download: 'Download', videoEyebrow: 'Video download',
    videoDescription: 'Download a direct MP4 or WebM video link.',
    videoUrlLabel: 'Direct video URL', videoUrlPlaceholder: 'Paste a direct MP4 or WebM URL...',
    preview: 'Preview video', quality: 'Quality', originalQuality: 'Original quality',
    filename: 'Save as', filenamePlaceholder: 'Optional filename',
    historyTitle: 'Download history', clearHistory: 'Clear history',
    stats: (count, size) => `${count} downloads initiated on this browser · ${size} total`,
    historyEmpty: 'No downloads recorded on this browser yet.',
    historyLocal: 'History and statistics are stored only in this browser. Shared live users and statistics require a real-time service.',
    historyUnavailable: 'Browser storage is unavailable; download history cannot be saved.',
    historyInvalid: 'Saved download history could not be read. Clear it to start a new history.',
    confirmClear: 'Clear this browser’s download history and statistics?',
    downloadEntry: (type, date, size) => `${type} · ${date} · ${size}`,
    videoType: 'Video', textType: 'Text file',
    videoEmpty: 'Enter a direct HTTPS MP4 or WebM URL to preview it.',
    urlInvalid: 'Enter a valid direct HTTPS MP4 or WebM URL.',
    urlUnsafe: 'For safety, use HTTPS on a public domain without a custom port or embedded credentials. Local and IP-address URLs are blocked.',
    previewLoading: 'Loading video preview…',
    previewReady: 'Preview ready. This direct link provides its original quality; alternate qualities need separate source links.',
    previewFailed: 'The video preview could not be loaded. Check the link and browser video support.',
    connecting: 'Connecting to video…',
    downloadProgress: percent => `Downloading video… ${percent}%`,
    downloadSize: size => `Downloading video… ${size}`,
    videoTooLarge: 'This video exceeds the 500 MB browser download limit.',
    wrongVideoType: 'The link did not return a supported MP4 or WebM video file.',
    requestFailed: status => `The video server responded with status ${status}.`,
    downloadReady: size => `Your video download was started (${size}).`,
    corsError: 'Could not access that video. Check the link and ensure its host allows browser downloads (CORS).',
    unknownError: 'The video could not be downloaded.',
    textEmpty: 'Enter some text before downloading.',
    textReady: 'Your text file is ready. Thanks for sharing!',
    downloadFailed: 'The download history could not be saved in this browser.'
  },
  ar: {
    navTeam: 'فريقي', navSocial: 'وسائل التواصل', navHome: 'الرئيسية',
    languageLabel: 'تغيير اللغة إلى الإنجليزية', languageButton: 'English',
    downloadProgressLabel: 'تقدم تنزيل الفيديو',
    statusText: 'مساحة صغيرة للاستكشاف', welcome: 'مرحباً بك في بلوويف',
    heroFirst: 'اصنع تأثيراً.', heroSecond: 'اكتشف إيقاعك.',
    teamEyebrow: 'الأشخاص وراء المشروع', teamTitle: 'تعرّف على فريقي',
    teamDescription: 'فريق صغير بأفكار كبيرة وشغف مشترك بصناعة الأشياء.',
    teamMember: 'عضو الفريق', socialEyebrow: 'تجدنا هناك',
    socialTitle: 'لنبقَ على تواصل', socialDescription: 'تابعنا لمعرفة آخر الأخبار والأفكار والمزيد.',
    instagram: 'إنستغرام', footerText: 'صُنع ليرسم ابتسامتك',
    intro: 'مساحة مشرقة وبسيطة للمشاركة والاكتشاف والتواصل. انطلق واكتشف إلى أين تقودك الفقاعات.',
    startExploring: 'ابدأ الاستكشاف', heroNote: 'الأشياء الجميلة أقرب مما تظن',
    star: 'أضف بلوويف للمفضلة', starred: 'تمت الإضافة',
    presenceUnavailable: 'عداد المستخدمين المباشر غير متاح حتى إعداد خدمة حضور فورية.',
    downloadEyebrow: 'تنزيلك الخاص', downloadTitle: 'احفظ رسالة',
    textDownloadDescription: 'اكتب شيئاً أدناه ونزّله كملف نصي.',
    textToDownload: 'النص المراد تنزيله', textPlaceholder: 'اكتب شيئاً جميلاً...',
    download: 'تنزيل', videoEyebrow: 'تنزيل فيديو',
    videoDescription: 'نزّل رابط فيديو مباشر بصيغة MP4 أو WebM.',
    videoUrlLabel: 'رابط فيديو مباشر', videoUrlPlaceholder: 'الصق رابط MP4 أو WebM مباشر...',
    preview: 'معاينة الفيديو', quality: 'الجودة', originalQuality: 'الجودة الأصلية',
    filename: 'حفظ باسم', filenamePlaceholder: 'اسم ملف اختياري',
    historyTitle: 'سجل التنزيلات', clearHistory: 'مسح السجل',
    stats: (count, size) => `${count} تنزيلات بدأت في هذا المتصفح · الإجمالي ${size}`,
    historyEmpty: 'لا توجد تنزيلات مسجلة في هذا المتصفح حتى الآن.',
    historyLocal: 'يُحفظ السجل والإحصاءات في هذا المتصفح فقط. تتطلب أعداد المستخدمين والإحصاءات المشتركة خدمة فورية.',
    historyUnavailable: 'مساحة تخزين المتصفح غير متاحة؛ تعذر حفظ سجل التنزيلات.',
    historyInvalid: 'تعذرت قراءة سجل التنزيلات المحفوظ. امسحه لبدء سجل جديد.',
    confirmClear: 'هل تريد مسح سجل التنزيلات وإحصاءاتها من هذا المتصفح؟',
    downloadEntry: (type, date, size) => `${type} · ${date} · ${size}`,
    videoType: 'فيديو', textType: 'ملف نصي',
    videoEmpty: 'أدخل رابط HTTPS مباشر لفيديو MP4 أو WebM لمعاينته.',
    urlInvalid: 'أدخل رابط HTTPS مباشر وصحيح لفيديو MP4 أو WebM.',
    urlUnsafe: 'لأمانك، استخدم HTTPS على نطاق عام دون منفذ مخصص أو بيانات اعتماد. تُحظر روابط الشبكات المحلية وعناوين IP.',
    previewLoading: 'جارٍ تحميل معاينة الفيديو…',
    previewReady: 'المعاينة جاهزة. يوفر هذا الرابط المباشر الجودة الأصلية؛ وتتطلب الجودات الأخرى روابط مصدر منفصلة.',
    previewFailed: 'تعذر تحميل معاينة الفيديو. تحقق من الرابط ودعم المتصفح للفيديو.',
    connecting: 'جارٍ الاتصال بالفيديو…',
    downloadProgress: percent => `جارٍ تنزيل الفيديو… ${percent}٪`,
    downloadSize: size => `جارٍ تنزيل الفيديو… ${size}`,
    videoTooLarge: 'يتجاوز حجم الفيديو حد التنزيل عبر المتصفح البالغ 500 ميغابايت.',
    wrongVideoType: 'لم يُرجع الرابط ملف فيديو مدعوماً بصيغة MP4 أو WebM.',
    requestFailed: status => `استجاب خادم الفيديو بالحالة ${status}.`,
    downloadReady: size => `بدأ تنزيل الفيديو (${size}).`,
    corsError: 'تعذر الوصول إلى الفيديو. تحقق من الرابط وأن مضيفه يسمح بالتنزيل من المتصفح (CORS).',
    unknownError: 'تعذر تنزيل الفيديو.',
    textEmpty: 'أدخل نصاً قبل التنزيل.',
    textReady: 'ملفك النصي جاهز. شكراً لمشاركتك!',
    downloadFailed: 'تعذر حفظ سجل التنزيل في هذا المتصفح.'
  }
};

let currentLanguage = 'en';
let historyItems = [];
let historyError = '';
let downloadTotals = { count: 0, size: 0 };

try {
  currentLanguage = localStorage.getItem('bluewave-language') === 'ar' ? 'ar' : 'en';
} catch {
  // Browser storage is optional; the page remains usable without it.
}

function localized(key, ...args) {
  const value = messages[currentLanguage][key];
  return typeof value === 'function' ? value(...args) : value;
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const message = localized(element.dataset.i18n);
    if (message) element.textContent = message;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    element.placeholder = localized(element.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
    element.setAttribute('aria-label', localized(element.dataset.i18nAriaLabel));
  });
  languageToggle.textContent = localized('languageButton');
  languageToggle.setAttribute('aria-label', localized('languageLabel'));
  starButtonLabel.textContent = starButton.getAttribute('aria-pressed') === 'true'
    ? localized('starred')
    : localized('star');
  renderHistory();
  document.dispatchEvent(new Event('bluewave:languagechange'));
}

function loadHistory() {
  let saved;
  let savedStatistics;
  try {
    saved = localStorage.getItem(historyStorageKey);
    savedStatistics = localStorage.getItem(statisticsStorageKey);
  } catch {
    historyError = localized('historyUnavailable');
    return;
  }

  try {
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.some((item) => (
        !item || typeof item.name !== 'string' || typeof item.type !== 'string'
        || !Number.isFinite(item.size) || !Number.isFinite(item.timestamp)
      ))) {
        throw new Error('Invalid history format');
      }
      historyItems = parsed.slice(0, maxHistoryItems);
    }
    if (savedStatistics) {
      const parsedStatistics = JSON.parse(savedStatistics);
      if (!Number.isSafeInteger(parsedStatistics.count) || !Number.isFinite(parsedStatistics.size)
        || parsedStatistics.count < 0 || parsedStatistics.size < 0) {
        throw new Error('Invalid statistics format');
      }
      downloadTotals = parsedStatistics;
    } else if (historyItems.length) {
      downloadTotals = {
        count: historyItems.length,
        size: historyItems.reduce((total, item) => total + item.size, 0)
      };
    }
  } catch {
    historyError = localized('historyInvalid');
  }
}

function saveHistory() {
  try {
    localStorage.setItem(historyStorageKey, JSON.stringify(historyItems));
    localStorage.setItem(statisticsStorageKey, JSON.stringify(downloadTotals));
    historyError = '';
    return true;
  } catch {
    historyError = localized('historyUnavailable');
    return false;
  }
}

function renderHistory() {
  historyList.replaceChildren();
  historyStatistics.textContent = historyError
    || `${localized('stats', downloadTotals.count, formatBytes(downloadTotals.size))}. ${localized('historyLocal')}`;

  if (historyItems.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'history-empty';
    emptyItem.textContent = localized('historyEmpty');
    historyList.appendChild(emptyItem);
    return;
  }

  historyItems.forEach((item) => {
    const entry = document.createElement('li');
    const name = document.createElement('strong');
    const details = document.createElement('span');
    const type = item.type === 'video' ? localized('videoType') : localized('textType');
    name.textContent = item.name;
    details.textContent = localized(
      'downloadEntry',
      type,
      new Intl.DateTimeFormat(currentLanguage, { dateStyle: 'medium', timeStyle: 'short' }).format(item.timestamp),
      formatBytes(item.size)
    );
    entry.className = 'history-item';
    entry.append(name, details);
    historyList.appendChild(entry);
  });
}

function addHistoryItem(name, type, size) {
  historyItems = [{ name, type, size, timestamp: Date.now() }, ...historyItems].slice(0, maxHistoryItems);
  downloadTotals = { count: downloadTotals.count + 1, size: downloadTotals.size + size };
  const saved = saveHistory();
  renderHistory();
  return saved;
}

function validateVideoUrl(rawUrl) {
  let videoUrl;
  try {
    videoUrl = new URL(rawUrl);
  } catch {
    return { error: localized('urlInvalid') };
  }

  const host = videoUrl.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  const hasIpAddress = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host) || host.includes(':');
  const localHostname = host === 'localhost' || host.endsWith('.localhost')
    || host.endsWith('.local') || host.endsWith('.internal') || !host.includes('.');
  const validVideoExtension = /\.(mp4|webm)$/i.test(videoUrl.pathname);
  const hasSafeOrigin = videoUrl.protocol === 'https:' && !videoUrl.username && !videoUrl.password
    && (!videoUrl.port || videoUrl.port === '443');

  if (!validVideoExtension) return { error: localized('urlInvalid') };
  if (!hasSafeOrigin || hasIpAddress || localHostname) return { error: localized('urlUnsafe') };
  return { url: videoUrl };
}

function setMessage(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle('is-error', isError);
}

function getVideoName(videoUrl) {
  const pathName = videoUrl.pathname.split('/').pop() || 'bluewave-video.mp4';
  const extension = videoUrl.pathname.toLowerCase().endsWith('.webm') ? '.webm' : '.mp4';
  const requestedName = videoFilenameInput.value.trim();
  const baseName = (requestedName || pathName)
    .replace(/\.(mp4|webm)$/i, '')
    .replace(/[^a-z0-9._-]/gi, '_')
    .replace(/^\.+|\.+$/g, '')
    .slice(0, 110);
  return `${baseName || 'bluewave-video'}${extension}`;
}

function showPage(pageName) {
  const page = pages.find((item) => item.id === pageName);
  if (!page) return;

  pages.forEach((item) => {
    const isCurrentPage = item === page;
    item.hidden = !isCurrentPage;
    item.classList.toggle('active', isCurrentPage);
  });

  navigationButtons.forEach((button) => {
    const isCurrentPage = button.dataset.page === pageName;
    button.classList.toggle('active', isCurrentPage);
    if (isCurrentPage) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });

  if (pageName === 'download') {
    setMessage(downloadMessage, '');
    setMessage(videoDownloadMessage, '');
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
  setMessage(downloadMessage, '');
  if (!text) {
    downloadInput.focus();
    setMessage(downloadMessage, localized('textEmpty'), true);
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
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 60000);
  setMessage(downloadMessage, localized('textReady'));
  if (!addHistoryItem(link.download, 'text', file.size)) {
    setMessage(downloadMessage, localized('downloadFailed'), true);
  }
});

starButton.addEventListener('click', () => {
  const isStarred = starButton.getAttribute('aria-pressed') !== 'true';
  starButton.setAttribute('aria-pressed', String(isStarred));
  starButtonIcon.textContent = isStarred ? '★' : '☆';
  starButtonLabel.textContent = localized(isStarred ? 'starred' : 'star');
});

previewButton.addEventListener('click', () => {
  const result = validateVideoUrl(videoUrlInput.value.trim());
  if (!result.url) {
    videoPreview.pause();
    videoPreview.removeAttribute('src');
    videoPreview.hidden = true;
    videoPreview.load();
    setMessage(videoPreviewMessage, result.error, true);
    return;
  }

  videoPreview.hidden = false;
  videoPreview.src = result.url.href;
  videoPreview.load();
  setMessage(videoPreviewMessage, localized('previewLoading'));
});

videoPreview.addEventListener('loadedmetadata', () => {
  setMessage(videoPreviewMessage, localized('previewReady'));
});

videoPreview.addEventListener('error', () => {
  if (!videoPreview.hidden) setMessage(videoPreviewMessage, localized('previewFailed'), true);
});

videoDownloadForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const result = validateVideoUrl(videoUrlInput.value.trim());
  if (!result.url) {
    setMessage(videoDownloadMessage, result.error, true);
    return;
  }

  videoDownloadButton.disabled = true;
  videoDownloadProgress.hidden = false;
  videoDownloadProgress.removeAttribute('value');
  setMessage(videoDownloadMessage, localized('connecting'));

  try {
    const response = await fetch(result.url.href, {
      redirect: 'error',
      credentials: 'omit',
      mode: 'cors'
    });
    if (!response.ok) throw new Error(localized('requestFailed', response.status));

    const contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (contentType && !['video/mp4', 'video/webm', 'application/octet-stream', 'binary/octet-stream'].includes(contentType)) {
      throw new Error(localized('wrongVideoType'));
    }

    const totalBytes = Number(response.headers.get('content-length')) || 0;
    if (totalBytes > maxVideoBytes) throw new Error(localized('videoTooLarge'));
    const chunks = [];
    let receivedBytes = 0;

    if (response.body && response.body.getReader) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        receivedBytes += value.byteLength;
        if (receivedBytes > maxVideoBytes) {
          await reader.cancel();
          throw new Error(localized('videoTooLarge'));
        }
        chunks.push(value);
        if (totalBytes) {
          const percent = Math.min(100, Math.round((receivedBytes / totalBytes) * 100));
          videoDownloadProgress.value = percent;
          setMessage(videoDownloadMessage, localized('downloadProgress', percent));
        } else {
          setMessage(videoDownloadMessage, localized('downloadSize', formatBytes(receivedBytes)));
        }
      }
    } else {
      const blob = await response.blob();
      if (blob.size > maxVideoBytes) throw new Error(localized('videoTooLarge'));
      chunks.push(blob);
      receivedBytes = blob.size;
    }

    const file = new Blob(chunks, { type: contentType || 'application/octet-stream' });
    const fileUrl = URL.createObjectURL(file);
    const fileName = getVideoName(result.url);
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(fileUrl), 60000);
    videoDownloadProgress.value = 100;
    setMessage(videoDownloadMessage, localized('downloadReady', formatBytes(receivedBytes)));
    if (!addHistoryItem(fileName, 'video', receivedBytes)) {
      setMessage(videoDownloadMessage, localized('downloadFailed'), true);
    }
  } catch (error) {
    const isNetworkError = error instanceof TypeError;
    setMessage(
      videoDownloadMessage,
      isNetworkError ? localized('corsError') : error.message || localized('unknownError'),
      true
    );
    videoDownloadProgress.hidden = true;
  } finally {
    videoDownloadButton.disabled = false;
  }
});

languageToggle.addEventListener('click', () => {
  currentLanguage = currentLanguage === 'en' ? 'ar' : 'en';
  try {
    localStorage.setItem('bluewave-language', currentLanguage);
  } catch {
    historyError = localized('historyUnavailable');
  }
  applyLanguage();
});

clearHistoryButton.addEventListener('click', () => {
  if (!window.confirm(localized('confirmClear'))) return;
  historyItems = [];
  downloadTotals = { count: 0, size: 0 };
  try {
    localStorage.removeItem(historyStorageKey);
    localStorage.removeItem(statisticsStorageKey);
    historyError = '';
  } catch {
    historyError = localized('historyUnavailable');
  }
  renderHistory();
});

loadHistory();
applyLanguage();
