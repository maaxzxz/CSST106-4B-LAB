const sidebar = document.querySelector('#sidebar');
const mobileMenu = document.querySelector('.mobile-menu');
const dashboard = document.querySelector('#dashboard-view');
const workspace = document.querySelector('#workspace-view');
const pageLabel = document.querySelector('#page-label');
const labCards = [...document.querySelectorAll('.lab-card')];
const filterTabs = document.querySelectorAll('.filter-tab');
const searchInput = document.querySelector('#lab-search');
const fileInput = document.querySelector('#file-input');
const dropZone = document.querySelector('#drop-zone');
const outputStage = document.querySelector('#output-stage');
const previewImage = document.querySelector('#preview-image');
const emptyOutput = document.querySelector('#empty-output');
const runButton = document.querySelector('#run-button');
const processing = document.querySelector('#processing');
const outputState = document.querySelector('#output-state');
const intensity = document.querySelector('#intensity');
const intensityOutput = document.querySelector('#intensity-output');
const toast = document.querySelector('#toast');
const themeToggle = document.querySelector('#theme-toggle');
const themeColor = document.querySelector('meta[name="theme-color"]');
let activeFilter = 'all';
let uploadedImage = null;
let toastTimer;

function applyTheme(theme, announce = false) {
  const isLight = theme === 'light';
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute('aria-pressed', String(isLight));
  themeToggle.setAttribute('aria-label', `Switch to ${isLight ? 'dark' : 'light'} mode`);
  themeColor.setAttribute('content', isLight ? '#f4f6fb' : '#080e1b');
  if (announce) showToast(`${isLight ? 'Light' : 'Dark'} mode enabled.`);
}

applyTheme(document.documentElement.dataset.theme || 'dark');

themeToggle.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  try { localStorage.setItem('cvision-theme', nextTheme); } catch { /* Storage may be unavailable. */ }
  applyTheme(nextTheme, true);
});

mobileMenu.addEventListener('click', () => {
  const open = sidebar.classList.toggle('open');
  mobileMenu.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.nav-item').forEach((item) => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach((nav) => nav.classList.remove('is-active'));
    item.classList.add('is-active');
    sidebar.classList.remove('open');
    mobileMenu.setAttribute('aria-expanded', 'false');
    if (item.dataset.lab) openLab(item.dataset.lab, item.dataset.title);
    else showDashboard(item.dataset.view === 'all-labs');
  });
});

document.querySelectorAll('.open-lab').forEach((button) => button.addEventListener('click', () => openLab(button.dataset.lab, button.dataset.title)));
document.querySelector('#continue-button').addEventListener('click', () => openLab('01', 'Image Fundamentals'));
document.querySelector('#back-button').addEventListener('click', () => showDashboard(false));

function openLab(number, title) {
  dashboard.hidden = true;
  workspace.hidden = false;
  pageLabel.textContent = `Lab ${number}`;
  document.querySelector('#workspace-number').textContent = `LAB ACTIVITY ${number}`;
  document.querySelector('#workspace-title').textContent = title;
  resetOutput();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('is-active', item.dataset.lab === number));
}

function showDashboard(scrollToLabs) {
  workspace.hidden = true;
  dashboard.hidden = false;
  pageLabel.textContent = 'Dashboard';
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('is-active', item.dataset.view === (scrollToLabs ? 'all-labs' : 'dashboard')));
  requestAnimationFrame(() => window.scrollTo({ top: scrollToLabs ? document.querySelector('#activities').offsetTop - 90 : 0, behavior: 'smooth' }));
}

filterTabs.forEach((tab) => tab.addEventListener('click', () => {
  filterTabs.forEach((item) => item.classList.remove('is-active'));
  tab.classList.add('is-active');
  activeFilter = tab.dataset.filter;
  updateCards();
}));

searchInput.addEventListener('input', updateCards);
function updateCards() {
  const query = searchInput.value.trim().toLowerCase();
  labCards.forEach((card) => {
    const matchesFilter = activeFilter === 'all' || card.dataset.status === activeFilter;
    const matchesQuery = !query || card.dataset.search.includes(query) || card.textContent.toLowerCase().includes(query);
    card.classList.toggle('hidden', !(matchesFilter && matchesQuery));
  });
}

document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    searchInput.focus();
  }
});

['dragenter', 'dragover'].forEach((name) => dropZone.addEventListener(name, (event) => {
  event.preventDefault();
  dropZone.classList.add('dragging');
}));
['dragleave', 'drop'].forEach((name) => dropZone.addEventListener(name, (event) => {
  event.preventDefault();
  dropZone.classList.remove('dragging');
}));
dropZone.addEventListener('drop', (event) => {
  const [file] = event.dataTransfer.files;
  if (file) loadImage(file);
});
fileInput.addEventListener('change', () => {
  const [file] = fileInput.files;
  if (file) loadImage(file);
});

function loadImage(file) {
  if (!file.type.startsWith('image/')) return showToast('Please select a valid image file.');
  const reader = new FileReader();
  reader.onload = (event) => {
    uploadedImage = event.target.result;
    previewImage.src = uploadedImage;
    previewImage.onload = () => {
      document.querySelector('#metric-width').textContent = `${previewImage.naturalWidth}px`;
      document.querySelector('#metric-height').textContent = `${previewImage.naturalHeight}px`;
    };
    outputStage.classList.add('has-image');
    emptyOutput.hidden = true;
    runButton.disabled = false;
    outputState.textContent = 'Input ready';
    document.querySelector('#metric-format').textContent = file.type.replace('image/', '').toUpperCase();
    document.querySelector('#metric-status').textContent = 'Ready';
    showToast(`${file.name} loaded successfully.`);
  };
  reader.readAsDataURL(file);
}

runButton.addEventListener('click', () => {
  if (!uploadedImage) return;
  runButton.disabled = true;
  processing.classList.add('active');
  outputState.textContent = 'Processing';
  document.querySelector('#metric-status').textContent = 'Running';
  setTimeout(() => {
    processing.classList.remove('active');
    outputState.textContent = 'Preview complete';
    document.querySelector('#metric-status').textContent = 'Complete';
    runButton.disabled = false;
    showToast('Front-end analysis preview complete.');
  }, 1400);
});

intensity.addEventListener('input', () => { intensityOutput.textContent = `${intensity.value}%`; });

function resetOutput() {
  uploadedImage = null;
  fileInput.value = '';
  previewImage.removeAttribute('src');
  outputStage.classList.remove('has-image');
  emptyOutput.hidden = false;
  processing.classList.remove('active');
  runButton.disabled = true;
  outputState.textContent = 'Waiting for input';
  ['width', 'height', 'format'].forEach((key) => { document.querySelector(`#metric-${key}`).textContent = '—'; });
  document.querySelector('#metric-status').textContent = 'Idle';
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}
