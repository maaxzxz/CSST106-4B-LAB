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
const resultGrid = document.querySelector('#result-grid');
const emptyOutput = document.querySelector('#empty-output');
const runButton = document.querySelector('#run-button');
const processing = document.querySelector('#processing');
const outputState = document.querySelector('#output-state');
const technique = document.querySelector('#technique');
const dynamicControls = document.querySelector('#dynamic-controls');
const downloadButton = document.querySelector('#download-result');
const toast = document.querySelector('#toast');
const themeToggle = document.querySelector('#theme-toggle');
const themeColor = document.querySelector('meta[name="theme-color"]');

let activeFilter = 'all';
let currentLab = '01';
let sourceCanvas = null;
let sourceImageData = null;
let sourceFile = null;
let activeResultCanvas = null;
let toastTimer;

const labDefinitions = {
  '01': {
    title: 'Image Fundamentals',
    topic: 'IMAGE MANIPULATION',
    week: 'WEEK 1–2',
    objective: 'Understand how digital images are represented, inspect their pixel data, and perform foundational image operations.',
    selectLabel: 'Image operation',
    options: [
      ['grayscale', 'Convert to grayscale'],
      ['red', 'Isolate red channel'],
      ['green', 'Isolate green channel'],
      ['blue', 'Isolate blue channel'],
      ['pixel', 'Modify one pixel'],
      ['crop', 'Crop a region of interest'],
      ['resize', 'Resize image'],
      ['rotate-left', 'Rotate 90° counter-clockwise'],
      ['rotate-right', 'Rotate 90° clockwise']
    ],
    procedure: [
      'Upload a color or grayscale image and record its width, height, and channels.',
      'Convert the image to grayscale and compare it with the original.',
      'Inspect individual color channels and modify a selected pixel.',
      'Crop a region of interest, resize the image, and rotate it by 90 degrees.',
      'Save screenshots of the original and manipulated outputs for the report.'
    ],
    findings: [
      ['How is an image represented?', 'As a two-dimensional grayscale array or a three-dimensional color array. Each position stores pixel intensity values.'],
      ['What are color channels?', 'Separate component planes—red, green, and blue in the browser; OpenCV loads these in BGR order by default.'],
      ['Why do resolution and pixel values matter?', 'Resolution controls spatial detail, while pixel values encode brightness and color used by later vision algorithms.']
    ],
    code: String.raw`import cv2

img = cv2.imread('input.jpg')
print('Height, width, channels:', img.shape)

gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
roi = img[50:250, 80:320]
resized = cv2.resize(img, None, fx=0.5, fy=0.5)
rotated = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)

# Inspect and change one BGR pixel
print('Pixel at (100, 100):', img[100, 100])
img[100, 100] = [0, 0, 255]

cv2.imshow('Original', img)
cv2.imshow('Grayscale', gray)
cv2.imshow('ROI', roi)
cv2.imshow('Resized', resized)
cv2.imshow('Rotated', rotated)
cv2.waitKey(0)
cv2.destroyAllWindows()`
  },
  '02': {
    title: 'Edge Detection',
    topic: 'SOBEL & CANNY METHODS',
    week: 'WEEK 3–4',
    objective: 'Apply Gaussian preprocessing, Sobel gradients, and Canny detection, then compare the resulting edge maps.',
    selectLabel: 'Output comparison',
    options: [
      ['compare', 'Compare Sobel and Canny'],
      ['sobel', 'Sobel magnitude only'],
      ['canny', 'Canny edges only']
    ],
    procedure: [
      'Upload an image and convert it to grayscale.',
      'Apply a 3×3 Gaussian blur to reduce image noise.',
      'Calculate horizontal and vertical Sobel gradients and combine their magnitudes.',
      'Apply Canny non-maximum suppression, double thresholds, and edge tracking.',
      'Display the original grayscale image, Sobel result, and Canny result side by side.'
    ],
    findings: [
      ['How does Sobel appear?', 'Sobel produces a grayscale gradient map. Strong transitions are bright, edges can be thick, and the output retains edge-strength information.'],
      ['How does Canny appear?', 'Canny produces a cleaner binary map with thin, connected edges after suppression and hysteresis thresholding.'],
      ['Why are the results different?', 'Sobel is primarily a first-derivative gradient operator. Canny is a multi-stage detector that adds noise reduction, thinning, and strong/weak edge tracking.']
    ],
    code: String.raw`import cv2
import matplotlib.pyplot as plt

img = cv2.imread('input.jpg', cv2.IMREAD_GRAYSCALE)
blur = cv2.GaussianBlur(img, (3, 3), 0)

sobel_x = cv2.Sobel(blur, cv2.CV_64F, 1, 0, ksize=3)
sobel_y = cv2.Sobel(blur, cv2.CV_64F, 0, 1, ksize=3)
sobel = cv2.magnitude(sobel_x, sobel_y)
canny = cv2.Canny(blur, 100, 200)

fig, axes = plt.subplots(1, 3, figsize=(12, 5))
for axis, image, title in zip(
    axes,
    [img, sobel, canny],
    ['Original', 'Sobel Edges', 'Canny Edges']
):
    axis.imshow(image, cmap='gray')
    axis.set_title(title)
    axis.axis('off')

plt.tight_layout()
plt.show()`
  },
  '03': {
    title: 'Histogram Equalization',
    topic: 'CONTRAST ADJUSTMENT',
    week: 'WEEK 4–5',
    objective: 'Improve image contrast using global equalization, linear stretching, and adaptive CLAHE, then analyze their histograms.',
    selectLabel: 'Enhancement method',
    options: [
      ['compare', 'Compare global and CLAHE'],
      ['global', 'Global histogram equalization'],
      ['clahe', 'Adaptive CLAHE'],
      ['stretch', 'Linear contrast stretching']
    ],
    procedure: [
      'Upload an image, convert it to grayscale, and calculate its intensity histogram.',
      'Apply global histogram equalization using the cumulative distribution function.',
      'Apply linear contrast stretching between the minimum and maximum intensities.',
      'Apply tile-based CLAHE with histogram clipping and interpolation.',
      'Compare image detail, contrast, histograms, noise, and possible artifacts.'
    ],
    findings: [
      ['What is histogram equalization?', 'A contrast-enhancement method that redistributes intensity values using the cumulative histogram.'],
      ['Why is it needed?', 'It reveals details hidden in images whose pixels occupy only a narrow brightness range.'],
      ['How does global equalization work?', 'The normalized cumulative distribution maps old intensities across a wider 0–255 output range.'],
      ['How does CLAHE work?', 'It equalizes small tiles, clips overly frequent intensities to limit noise, and interpolates neighboring tile mappings.'],
      ['Where is it used?', 'Medical imaging, surveillance, document restoration, low-light inspection, and satellite or remote-sensing imagery.']
    ],
    code: String.raw`import cv2
import matplotlib.pyplot as plt

img = cv2.imread('input.jpg', cv2.IMREAD_GRAYSCALE)
global_eq = cv2.equalizeHist(img)

clahe_tool = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
clahe = clahe_tool.apply(img)

fig, axes = plt.subplots(2, 3, figsize=(13, 7))
images = [img, global_eq, clahe]
titles = ['Original', 'Global Equalization', 'CLAHE']

for index, (image, title) in enumerate(zip(images, titles)):
    axes[0, index].imshow(image, cmap='gray')
    axes[0, index].set_title(title)
    axes[0, index].axis('off')
    axes[1, index].hist(image.ravel(), 256, [0, 256])
    axes[1, index].set_xlim([0, 256])

plt.tight_layout()
plt.show()`
  }
};

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
    sidebar.classList.remove('open');
    mobileMenu.setAttribute('aria-expanded', 'false');
    if (item.dataset.lab) openLab(item.dataset.lab);
    else showDashboard(item.dataset.view === 'all-labs');
  });
});

document.querySelectorAll('.open-lab').forEach((button) => {
  button.addEventListener('click', () => openLab(button.dataset.lab));
});
document.querySelector('#continue-button').addEventListener('click', () => openLab('01'));
document.querySelector('#back-button').addEventListener('click', () => showDashboard(false));

function openLab(number) {
  const definition = labDefinitions[number];
  if (!definition) {
    showToast(`Lab Activity ${number} is planned and will be added next.`);
    return;
  }

  currentLab = number;
  history.replaceState(null, '', `${location.pathname}?lab=${number}`);
  dashboard.hidden = true;
  workspace.hidden = false;
  pageLabel.textContent = `Lab ${number}`;
  document.querySelector('#workspace-number').textContent = `LAB ACTIVITY ${number}`;
  document.querySelector('#workspace-title').textContent = definition.title;
  document.querySelector('#workspace-objective').textContent = definition.objective;
  document.querySelector('#lab-topic').textContent = definition.topic;
  document.querySelector('#lab-week').textContent = definition.week;
  document.querySelector('#control-lab-number').textContent = number;
  document.querySelector('#technique-label').textContent = definition.selectLabel;

  technique.innerHTML = definition.options.map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
  renderDynamicControls();
  renderGuide(definition);
  resetOutput();
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('is-active', item.dataset.lab === number));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showDashboard(scrollToLabs) {
  history.replaceState(null, '', location.pathname);
  workspace.hidden = true;
  dashboard.hidden = false;
  pageLabel.textContent = 'Dashboard';
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.toggle('is-active', item.dataset.view === (scrollToLabs ? 'all-labs' : 'dashboard'));
  });
  requestAnimationFrame(() => window.scrollTo({
    top: scrollToLabs ? document.querySelector('#activities').offsetTop - 90 : 0,
    behavior: 'smooth'
  }));
}

function renderGuide(definition) {
  document.querySelector('#procedure-content').innerHTML = `<ol>${definition.procedure.map((item) => `<li>${item}</li>`).join('')}</ol>`;
  document.querySelector('#findings-content').innerHTML = definition.findings.map(([question, answer]) => `<div class="qa"><strong>${question}</strong><p>${answer}</p></div>`).join('');
  document.querySelector('#python-code').textContent = definition.code;
  document.querySelector('#guide-progress').textContent = 'Ready to experiment';
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

technique.addEventListener('change', renderDynamicControls);
function renderDynamicControls() {
  const value = technique.value;
  if (currentLab === '01') {
    const transformTools = labOneTransformTools(value);
    let operationControls;
    if (value === 'pixel') {
      const maxX = Math.max(0, (sourceCanvas?.width || 1) - 1);
      const maxY = Math.max(0, (sourceCanvas?.height || 1) - 1);
      operationControls = `<div class="control-block compact-controls"><label>Pixel coordinate & color</label><div class="field-row"><label>X<input id="pixel-x" type="number" min="0" max="${maxX}" value="${Math.floor(maxX / 2)}"></label><label>Y<input id="pixel-y" type="number" min="0" max="${maxY}" value="${Math.floor(maxY / 2)}"></label><label>Color<input id="pixel-color" type="color" value="#ff4f8b"></label></div></div>`;
    } else if (value === 'crop') {
      operationControls = rangeControl('crop-width', 'Crop width', 20, 100, 70, 5, '%') + rangeControl('crop-height', 'Crop height', 20, 100, 70, 5, '%') + `<div class="control-block"><label for="crop-position">Crop position</label><select id="crop-position"><option value="center">Center</option><option value="top-left">Top left</option><option value="top-right">Top right</option><option value="bottom-left">Bottom left</option><option value="bottom-right">Bottom right</option></select></div>`;
    } else if (value === 'resize') {
      operationControls = rangeControl('operation-value', 'Output scale', 25, 100, 50, 5, '%');
    } else {
      operationControls = `<div class="control-hint"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" /></svg><span>The result will be compared with the original image.</span></div>`;
    }
    dynamicControls.innerHTML = transformTools + operationControls;
    bindRangeOutputs();
    bindTransformTools();
  } else if (currentLab === '02') {
    dynamicControls.innerHTML = rangeControl('low-threshold', 'Canny low threshold', 0, 200, 50, 5, '') + rangeControl('high-threshold', 'Canny high threshold', 50, 255, 150, 5, '');
    bindRangeOutputs();
  } else if (currentLab === '03') {
    dynamicControls.innerHTML = rangeControl('clip-limit', 'CLAHE clip limit', 1, 5, 2, .5, '×') + `<div class="control-block"><label for="tile-grid">Adaptive tile grid</label><select id="tile-grid"><option value="4">4 × 4</option><option value="8" selected>8 × 8</option><option value="12">12 × 12</option></select></div>`;
    bindRangeOutputs();
  }
}

function labOneTransformTools(activeOperation) {
  const active = (operation) => activeOperation === operation ? ' is-active' : '';
  return `<div class="control-block transform-tools"><label>Quick transform tools</label><div><button class="${active('crop')}" type="button" data-transform="crop"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v14a2 2 0 0 0 2 2h12M3 7h14a2 2 0 0 1 2 2v12"/></svg><span>Crop</span></button><button class="${active('rotate-left')}" type="button" data-transform="rotate-left"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="12" height="14" rx="2" transform="rotate(-12 12 12)"/></svg><span>Left 90°</span></button><button class="${active('rotate-right')}" type="button" data-transform="rotate-right"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="12" height="14" rx="2" transform="rotate(12 12 12)"/></svg><span>Right 90°</span></button></div></div>`;
}

function bindTransformTools() {
  dynamicControls.querySelectorAll('[data-transform]').forEach((button) => {
    button.addEventListener('click', () => {
      technique.value = button.dataset.transform;
      renderDynamicControls();
    });
  });
}

function rangeControl(id, label, min, max, value, step, suffix) {
  return `<div class="control-block range-block"><div><label for="${id}">${label}</label><output id="${id}-output">${value}${suffix}</output></div><input id="${id}" data-suffix="${suffix}" type="range" min="${min}" max="${max}" value="${value}" step="${step}"></div>`;
}

function bindRangeOutputs() {
  dynamicControls.querySelectorAll('input[type="range"]').forEach((input) => {
    input.addEventListener('input', () => {
      document.querySelector(`#${input.id}-output`).textContent = `${input.value}${input.dataset.suffix || ''}`;
    });
  });
}

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
  if (!file.type.startsWith('image/')) {
    showToast('Please select a valid PNG, JPG, or WEBP image.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const image = new Image();
    image.onload = () => {
      const maxDimension = 1000;
      const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = width;
      sourceCanvas.height = height;
      const context = sourceCanvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(image, 0, 0, width, height);
      sourceImageData = context.getImageData(0, 0, width, height);
      sourceFile = file;

      document.querySelector('#metric-width').textContent = image.naturalWidth;
      document.querySelector('#metric-height').textContent = image.naturalHeight;
      document.querySelector('#metric-channels').textContent = '4 (RGBA)';
      document.querySelector('#metric-status').textContent = 'Ready';
      outputState.textContent = scale < 1 ? `Ready · analyzed at ${width} × ${height}` : 'Input ready';
      runButton.disabled = false;
      renderDynamicControls();
      renderSourcePreview();
      showToast(`${file.name} loaded. Choose an operation and run the experiment.`);
    };
    image.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

function renderSourcePreview() {
  clearResults();
  const result = createResultCard('Source image', 'Uploaded input', sourceCanvas.width, sourceCanvas.height);
  result.context.drawImage(sourceCanvas, 0, 0);
  activeResultCanvas = result.canvas;
  revealResults();
  downloadButton.disabled = false;
}

runButton.addEventListener('click', async () => {
  if (!sourceCanvas || !sourceImageData) return;
  runButton.disabled = true;
  downloadButton.disabled = true;
  processing.classList.add('active');
  outputState.textContent = 'Processing';
  document.querySelector('#metric-status').textContent = 'Running';

  await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 80)));
  try {
    if (currentLab === '01') runLabOne();
    if (currentLab === '02') runLabTwo();
    if (currentLab === '03') runLabThree();
    outputState.textContent = 'Experiment complete';
    document.querySelector('#metric-status').textContent = 'Complete';
    document.querySelector('#guide-progress').textContent = 'Experiment completed';
    showToast(`${labDefinitions[currentLab].title} processing completed.`);
  } catch (error) {
    console.error(error);
    outputState.textContent = 'Processing error';
    document.querySelector('#metric-status').textContent = 'Error';
    showToast('The image could not be processed. Try a smaller file.');
  } finally {
    processing.classList.remove('active');
    runButton.disabled = false;
    downloadButton.disabled = !activeResultCanvas;
  }
});

function runLabOne() {
  const operation = technique.value;
  clearResults();
  const original = createResultCard('Original', `${sourceCanvas.width} × ${sourceCanvas.height} · RGBA`, sourceCanvas.width, sourceCanvas.height);
  original.context.drawImage(sourceCanvas, 0, 0);
  activeResultCanvas = original.canvas;

  if (operation === 'grayscale') {
    activeResultCanvas = renderGrayResult('Grayscale', 'Luminance intensity', toGrayscale(sourceImageData), sourceCanvas.width, sourceCanvas.height).canvas;
  } else if (['red', 'green', 'blue'].includes(operation)) {
    const channelIndex = { red: 0, green: 1, blue: 2 }[operation];
    const output = new Uint8ClampedArray(sourceImageData.data.length);
    for (let index = 0; index < output.length; index += 4) {
      output[index + channelIndex] = sourceImageData.data[index + channelIndex];
      output[index + 3] = 255;
    }
    activeResultCanvas = renderImageDataResult(`${capitalize(operation)} channel`, 'Isolated color plane', output, sourceCanvas.width, sourceCanvas.height).canvas;
  } else if (operation === 'pixel') {
    const x = clamp(Number(document.querySelector('#pixel-x').value), 0, sourceCanvas.width - 1);
    const y = clamp(Number(document.querySelector('#pixel-y').value), 0, sourceCanvas.height - 1);
    const [red, green, blue] = hexToRgb(document.querySelector('#pixel-color').value);
    const output = new Uint8ClampedArray(sourceImageData.data);
    const radius = Math.max(2, Math.round(Math.min(sourceCanvas.width, sourceCanvas.height) * .008));
    for (let py = Math.max(0, y - radius); py <= Math.min(sourceCanvas.height - 1, y + radius); py++) {
      for (let px = Math.max(0, x - radius); px <= Math.min(sourceCanvas.width - 1, x + radius); px++) {
        const index = (py * sourceCanvas.width + px) * 4;
        output[index] = red; output[index + 1] = green; output[index + 2] = blue; output[index + 3] = 255;
      }
    }
    activeResultCanvas = renderImageDataResult('Modified pixel region', `Coordinate (${x}, ${y}) · RGB(${red}, ${green}, ${blue})`, output, sourceCanvas.width, sourceCanvas.height).canvas;
  } else if (operation === 'crop') {
    const widthAmount = Number(document.querySelector('#crop-width').value) / 100;
    const heightAmount = Number(document.querySelector('#crop-height').value) / 100;
    const position = document.querySelector('#crop-position').value;
    const width = Math.max(1, Math.round(sourceCanvas.width * widthAmount));
    const height = Math.max(1, Math.round(sourceCanvas.height * heightAmount));
    let sx = Math.round((sourceCanvas.width - width) / 2);
    let sy = Math.round((sourceCanvas.height - height) / 2);
    if (position.includes('left')) sx = 0;
    if (position.includes('right')) sx = sourceCanvas.width - width;
    if (position.includes('top')) sy = 0;
    if (position.includes('bottom')) sy = sourceCanvas.height - height;
    const positionLabel = position.split('-').map(capitalize).join(' ');
    const result = createResultCard(`${positionLabel} crop`, `${Math.round(widthAmount * 100)}% × ${Math.round(heightAmount * 100)}% ROI · ${width} × ${height}`, width, height);
    result.context.drawImage(sourceCanvas, sx, sy, width, height, 0, 0, width, height);
    activeResultCanvas = result.canvas;
  } else if (operation === 'resize') {
    const amount = Number(document.querySelector('#operation-value').value) / 100;
    const width = Math.max(1, Math.round(sourceCanvas.width * amount));
    const height = Math.max(1, Math.round(sourceCanvas.height * amount));
    const result = createResultCard('Resized image', `${Math.round(amount * 100)}% scale · ${width} × ${height}`, width, height);
    result.context.imageSmoothingQuality = 'high';
    result.context.drawImage(sourceCanvas, 0, 0, width, height);
    activeResultCanvas = result.canvas;
  } else if (operation === 'rotate-left' || operation === 'rotate-right') {
    const clockwise = operation === 'rotate-right';
    const result = createResultCard('Rotated image', clockwise ? '90° clockwise' : '90° counter-clockwise', sourceCanvas.height, sourceCanvas.width);
    if (clockwise) result.context.translate(sourceCanvas.height, 0);
    else result.context.translate(0, sourceCanvas.width);
    result.context.rotate(clockwise ? Math.PI / 2 : -Math.PI / 2);
    result.context.drawImage(sourceCanvas, 0, 0);
    activeResultCanvas = result.canvas;
  }
  revealResults();
}

function runLabTwo() {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const grayscale = toGrayscale(sourceImageData);
  const blurred = gaussianBlur(grayscale, width, height);
  const sobelData = sobel(blurred, width, height);
  const low = Number(document.querySelector('#low-threshold').value);
  const high = Number(document.querySelector('#high-threshold').value);
  const cannyData = cannyFromSobel(sobelData, width, height, Math.min(low, high - 1), Math.max(high, low + 1));

  clearResults();
  renderGrayResult('Original grayscale', 'Input after luminance conversion', grayscale, width, height);
  if (technique.value !== 'canny') {
    activeResultCanvas = renderGrayResult('Sobel edges', 'Combined X and Y gradient magnitude', sobelData.display, width, height).canvas;
  }
  if (technique.value !== 'sobel') {
    activeResultCanvas = renderGrayResult('Canny edges', `Thresholds ${Math.min(low, high - 1)} / ${Math.max(high, low + 1)}`, cannyData, width, height).canvas;
  }
  revealResults();
}

function runLabThree() {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const grayscale = toGrayscale(sourceImageData);
  const globalEqualized = equalizeHistogram(grayscale);
  const clipLimit = Number(document.querySelector('#clip-limit').value);
  const tileCount = Number(document.querySelector('#tile-grid').value);
  const adaptive = clahe(grayscale, width, height, tileCount, tileCount, clipLimit);
  const stretched = contrastStretch(grayscale);

  clearResults();
  renderHistogramResult('Original grayscale', 'Original intensity distribution', grayscale, width, height);
  if (technique.value === 'compare' || technique.value === 'global') {
    activeResultCanvas = renderHistogramResult('Global equalization', 'CDF redistributed over 0–255', globalEqualized, width, height).canvas;
  }
  if (technique.value === 'compare' || technique.value === 'clahe') {
    activeResultCanvas = renderHistogramResult('Adaptive CLAHE', `${tileCount} × ${tileCount} tiles · clip ${clipLimit}×`, adaptive, width, height).canvas;
  }
  if (technique.value === 'stretch') {
    activeResultCanvas = renderHistogramResult('Contrast stretching', 'Linear minimum–maximum scaling', stretched, width, height).canvas;
  }
  revealResults();
}

function clearResults() {
  resultGrid.innerHTML = '';
  resultGrid.hidden = false;
  emptyOutput.hidden = true;
  activeResultCanvas = null;
}

function revealResults() {
  resultGrid.hidden = false;
  emptyOutput.hidden = true;
  outputStage.classList.add('has-results');
}

function createResultCard(title, subtitle, width, height) {
  const card = document.createElement('article');
  card.className = 'result-card';
  const header = document.createElement('div');
  header.className = 'result-card-header';
  header.innerHTML = `<div><strong>${title}</strong><span>${subtitle}</span></div><b>${resultGrid.children.length + 1}</b>`;
  const canvasWrap = document.createElement('div');
  canvasWrap.className = 'result-canvas-wrap';
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.setAttribute('aria-label', title);
  canvasWrap.appendChild(canvas);
  card.append(header, canvasWrap);
  resultGrid.appendChild(card);
  return { card, canvas, context: canvas.getContext('2d') };
}

function renderImageDataResult(title, subtitle, rgba, width, height) {
  const result = createResultCard(title, subtitle, width, height);
  result.context.putImageData(new ImageData(rgba, width, height), 0, 0);
  return result;
}

function renderGrayResult(title, subtitle, grayscale, width, height) {
  return renderImageDataResult(title, subtitle, grayToRgba(grayscale), width, height);
}

function renderHistogramResult(title, subtitle, grayscale, width, height) {
  const result = renderGrayResult(title, subtitle, grayscale, width, height);
  const histogramWrap = document.createElement('div');
  histogramWrap.className = 'histogram-canvas-wrap';
  const histogramCanvas = document.createElement('canvas');
  histogramCanvas.width = 320;
  histogramCanvas.height = 90;
  histogramCanvas.setAttribute('aria-label', `${title} histogram`);
  histogramWrap.appendChild(histogramCanvas);
  result.card.appendChild(histogramWrap);
  drawHistogram(histogramCanvas, grayscale);
  return result;
}

function toGrayscale(imageData) {
  const output = new Uint8ClampedArray(imageData.width * imageData.height);
  for (let source = 0, target = 0; source < imageData.data.length; source += 4, target++) {
    output[target] = Math.round(.299 * imageData.data[source] + .587 * imageData.data[source + 1] + .114 * imageData.data[source + 2]);
  }
  return output;
}

function grayToRgba(grayscale) {
  const output = new Uint8ClampedArray(grayscale.length * 4);
  for (let index = 0; index < grayscale.length; index++) {
    const value = Math.round(grayscale[index]);
    const target = index * 4;
    output[target] = value; output[target + 1] = value; output[target + 2] = value; output[target + 3] = 255;
  }
  return output;
}

function gaussianBlur(input, width, height) {
  const output = new Float32Array(input.length);
  const kernel = [1, 2, 1, 2, 4, 2, 1, 2, 1];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
        output[y * width + x] = input[y * width + x];
        continue;
      }
      let sum = 0;
      let kernelIndex = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          sum += input[(y + ky) * width + x + kx] * kernel[kernelIndex++];
        }
      }
      output[y * width + x] = sum / 16;
    }
  }
  return output;
}

function sobel(input, width, height) {
  const magnitude = new Float32Array(input.length);
  const direction = new Float32Array(input.length);
  let maximum = 1;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const top = (y - 1) * width + x;
      const middle = y * width + x;
      const bottom = (y + 1) * width + x;
      const gx = -input[top - 1] + input[top + 1] - 2 * input[middle - 1] + 2 * input[middle + 1] - input[bottom - 1] + input[bottom + 1];
      const gy = -input[top - 1] - 2 * input[top] - input[top + 1] + input[bottom - 1] + 2 * input[bottom] + input[bottom + 1];
      const index = middle;
      magnitude[index] = Math.hypot(gx, gy);
      direction[index] = Math.atan2(gy, gx) * 180 / Math.PI;
      maximum = Math.max(maximum, magnitude[index]);
    }
  }
  const display = new Uint8ClampedArray(input.length);
  for (let index = 0; index < magnitude.length; index++) display[index] = Math.round(magnitude[index] / maximum * 255);
  return { magnitude, direction, display, maximum };
}

function cannyFromSobel(sobelData, width, height, lowThreshold, highThreshold) {
  const suppressed = new Float32Array(sobelData.magnitude.length);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const index = y * width + x;
      let angle = sobelData.direction[index];
      if (angle < 0) angle += 180;
      let first;
      let second;
      if (angle < 22.5 || angle >= 157.5) {
        first = sobelData.magnitude[index - 1]; second = sobelData.magnitude[index + 1];
      } else if (angle < 67.5) {
        first = sobelData.magnitude[index - width - 1]; second = sobelData.magnitude[index + width + 1];
      } else if (angle < 112.5) {
        first = sobelData.magnitude[index - width]; second = sobelData.magnitude[index + width];
      } else {
        first = sobelData.magnitude[index - width + 1]; second = sobelData.magnitude[index + width - 1];
      }
      const normalized = sobelData.magnitude[index] / sobelData.maximum * 255;
      suppressed[index] = sobelData.magnitude[index] >= first && sobelData.magnitude[index] >= second ? normalized : 0;
    }
  }

  const output = new Uint8ClampedArray(suppressed.length);
  const stack = [];
  for (let index = 0; index < suppressed.length; index++) {
    if (suppressed[index] >= highThreshold) { output[index] = 255; stack.push(index); }
    else if (suppressed[index] >= lowThreshold) output[index] = 75;
  }

  while (stack.length) {
    const index = stack.pop();
    const x = index % width;
    const y = Math.floor(index / width);
    for (let offsetY = -1; offsetY <= 1; offsetY++) {
      for (let offsetX = -1; offsetX <= 1; offsetX++) {
        const nx = x + offsetX;
        const ny = y + offsetY;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const neighbor = ny * width + nx;
        if (output[neighbor] === 75) { output[neighbor] = 255; stack.push(neighbor); }
      }
    }
  }
  for (let index = 0; index < output.length; index++) if (output[index] !== 255) output[index] = 0;
  return output;
}

function equalizeHistogram(input) {
  const histogram = calculateHistogram(input);
  const cdf = new Uint32Array(256);
  cdf[0] = histogram[0];
  for (let index = 1; index < 256; index++) cdf[index] = cdf[index - 1] + histogram[index];
  let cdfMinimum = 0;
  for (let index = 0; index < 256; index++) if (cdf[index] > 0) { cdfMinimum = cdf[index]; break; }
  const denominator = Math.max(1, input.length - cdfMinimum);
  const output = new Uint8ClampedArray(input.length);
  for (let index = 0; index < input.length; index++) output[index] = clamp(Math.round((cdf[input[index]] - cdfMinimum) / denominator * 255), 0, 255);
  return output;
}

function contrastStretch(input) {
  let minimum = 255;
  let maximum = 0;
  for (const value of input) { minimum = Math.min(minimum, value); maximum = Math.max(maximum, value); }
  const range = Math.max(1, maximum - minimum);
  const output = new Uint8ClampedArray(input.length);
  for (let index = 0; index < input.length; index++) output[index] = Math.round((input[index] - minimum) / range * 255);
  return output;
}

function clahe(input, width, height, tilesX, tilesY, clipLimit) {
  const maps = [];
  for (let tileY = 0; tileY < tilesY; tileY++) {
    for (let tileX = 0; tileX < tilesX; tileX++) {
      const startX = Math.floor(tileX * width / tilesX);
      const endX = Math.floor((tileX + 1) * width / tilesX);
      const startY = Math.floor(tileY * height / tilesY);
      const endY = Math.floor((tileY + 1) * height / tilesY);
      const pixelCount = Math.max(1, (endX - startX) * (endY - startY));
      const histogram = new Uint32Array(256);
      for (let y = startY; y < endY; y++) for (let x = startX; x < endX; x++) histogram[input[y * width + x]]++;
      const limit = Math.max(1, Math.floor(pixelCount / 256 * clipLimit));
      let excess = 0;
      for (let index = 0; index < 256; index++) {
        if (histogram[index] > limit) { excess += histogram[index] - limit; histogram[index] = limit; }
      }
      const increment = Math.floor(excess / 256);
      const remainder = excess % 256;
      for (let index = 0; index < 256; index++) histogram[index] += increment + (index < remainder ? 1 : 0);
      const map = new Uint8ClampedArray(256);
      let cumulative = 0;
      for (let index = 0; index < 256; index++) { cumulative += histogram[index]; map[index] = Math.round(cumulative / pixelCount * 255); }
      maps.push(map);
    }
  }

  const output = new Uint8ClampedArray(input.length);
  const tileWidth = width / tilesX;
  const tileHeight = height / tilesY;
  for (let y = 0; y < height; y++) {
    let gridY = (y + .5) / tileHeight - .5;
    let y0 = Math.floor(gridY);
    let fy = gridY - y0;
    if (y0 < 0) { y0 = 0; fy = 0; }
    const y1 = Math.min(tilesY - 1, y0 + 1);
    y0 = Math.min(tilesY - 1, y0);
    for (let x = 0; x < width; x++) {
      let gridX = (x + .5) / tileWidth - .5;
      let x0 = Math.floor(gridX);
      let fx = gridX - x0;
      if (x0 < 0) { x0 = 0; fx = 0; }
      const x1 = Math.min(tilesX - 1, x0 + 1);
      x0 = Math.min(tilesX - 1, x0);
      const value = input[y * width + x];
      const top = lerp(maps[y0 * tilesX + x0][value], maps[y0 * tilesX + x1][value], fx);
      const bottom = lerp(maps[y1 * tilesX + x0][value], maps[y1 * tilesX + x1][value], fx);
      output[y * width + x] = Math.round(lerp(top, bottom, fy));
    }
  }
  return output;
}

function calculateHistogram(input) {
  const histogram = new Uint32Array(256);
  for (const value of input) histogram[value]++;
  return histogram;
}

function drawHistogram(canvas, grayscale) {
  const context = canvas.getContext('2d');
  const histogram = calculateHistogram(grayscale);
  const maximum = Math.max(...histogram);
  const styles = getComputedStyle(document.documentElement);
  const pink = styles.getPropertyValue('--pink').trim() || '#ff4f8b';
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = 'rgba(130,144,167,.3)';
  context.beginPath(); context.moveTo(0, canvas.height - .5); context.lineTo(canvas.width, canvas.height - .5); context.stroke();
  context.fillStyle = pink;
  const barWidth = canvas.width / 256;
  for (let index = 0; index < 256; index++) {
    const height = histogram[index] / maximum * (canvas.height - 8);
    context.fillRect(index * barWidth, canvas.height - height, Math.max(1, barWidth), height);
  }
}

downloadButton.addEventListener('click', () => {
  if (!activeResultCanvas) return;
  activeResultCanvas.toBlob((blob) => {
    if (!blob) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `csst106-lab-${currentLab}-result.png`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, 'image/png');
});

function resetOutput() {
  sourceCanvas = null;
  sourceImageData = null;
  sourceFile = null;
  activeResultCanvas = null;
  fileInput.value = '';
  resultGrid.innerHTML = '';
  resultGrid.hidden = true;
  emptyOutput.hidden = false;
  outputStage.classList.remove('has-results');
  processing.classList.remove('active');
  runButton.disabled = true;
  downloadButton.disabled = true;
  outputState.textContent = 'Waiting for input';
  ['width', 'height', 'channels'].forEach((key) => { document.querySelector(`#metric-${key}`).textContent = '—'; });
  document.querySelector('#metric-status').textContent = 'Idle';
  document.querySelector('#guide-progress').textContent = 'Ready to experiment';
}

function hexToRgb(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}
function capitalize(value) { return value.charAt(0).toUpperCase() + value.slice(1); }
function clamp(value, minimum, maximum) { return Math.min(maximum, Math.max(minimum, value)); }
function lerp(start, end, amount) { return start + (end - start) * amount; }

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

const requestedLab = new URLSearchParams(location.search).get('lab');
if (requestedLab && labDefinitions[requestedLab]) openLab(requestedLab);
