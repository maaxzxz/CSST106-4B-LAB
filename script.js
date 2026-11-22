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
const imageLightbox = document.querySelector('#image-lightbox');
const lightboxCanvas = document.querySelector('#lightbox-canvas');
const lightboxClose = document.querySelector('#lightbox-close');

let activeFilter = 'all';
let currentLab = '01';
let sourceCanvas = null;
let sourceImageData = null;
let sourceFile = null;
let activeResultCanvas = null;
let cropSelection = null;
let pcaDataset = [];
let toastTimer;
let lightboxReturnFocus = null;

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
      ['compare', 'Original + Sobel + Canny']
    ],
    procedure: [
      'Upload the provided input.jpg image and convert it to grayscale.',
      'Apply a 3×3 Gaussian blur to reduce image noise.',
      'Calculate horizontal and vertical Sobel gradients and combine their magnitudes.',
      'Apply Canny non-maximum suppression, double thresholds, and edge tracking.',
      'Display the original image, Sobel edges, and Canny edges side by side.',
      'Explain the differences between the edge maps produced by each method.'
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
  },
  '04': {
    title: 'SURF Feature Detection', topic: 'HESSIAN KEYPOINTS & DESCRIPTORS', week: 'WEEK 6',
    objective: 'Detect scale-aware interest points, study Hessian threshold sensitivity, and connect browser results to OpenCV SURF descriptors.',
    selectLabel: 'Feature experiment', options: [['surf', 'SURF-style Hessian keypoints']],
    procedure: ['Upload an object or scene image and convert it to grayscale.', 'Calculate multi-scale Hessian determinant responses and retain local maxima.', 'Change the Hessian threshold and observe how the keypoint count changes.', 'Inspect keypoint position, scale, and orientation overlays.', 'Use the Python reference to compute exact SURF descriptors and match two images.'],
    findings: [
      ['What does the Hessian threshold change?', 'A higher threshold accepts only stronger blob responses, so fewer keypoints remain. A lower value detects more points but may include unstable features.'],
      ['Why are descriptors important?', 'They encode the neighborhood around each keypoint so corresponding features can be matched across scale, rotation, viewpoint, or lighting changes.'],
      ['How do SURF, SIFT, and ORB differ?', 'SURF uses Hessian blob responses and is typically faster than SIFT; SIFT is highly distinctive; ORB is fast, binary, and license-friendly.']
    ],
    code: String.raw`import cv2

img1 = cv2.imread('image1.jpg', cv2.IMREAD_GRAYSCALE)
img2 = cv2.imread('image2.jpg', cv2.IMREAD_GRAYSCALE)
surf = cv2.xfeatures2d.SURF_create(hessianThreshold=400, upright=False)
kp1, des1 = surf.detectAndCompute(img1, None)
kp2, des2 = surf.detectAndCompute(img2, None)

matcher = cv2.BFMatcher(cv2.NORM_L2)
matches = matcher.knnMatch(des1, des2, k=2)
good = [m for m, n in matches if m.distance < 0.75 * n.distance]
result = cv2.drawMatches(img1, kp1, img2, kp2, good, None,
                         flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)
print('Keypoints:', len(kp1), len(kp2), 'Good matches:', len(good))
cv2.imshow('SURF matches', result)
cv2.waitKey(0)

# Comparison alternatives
sift = cv2.SIFT_create()
orb = cv2.ORB_create()`
  },
  '05': {
    title: 'PCA & Eigenfaces', topic: 'DIMENSIONALITY REDUCTION', week: 'WEEK 7–8',
    objective: 'Create eigenfaces from multiple aligned face images and measure the trade-off between principal components and retained variance.',
    selectLabel: 'PCA experiment', options: [['eigenfaces', 'Eigenfaces & reconstruction']],
    procedure: ['Select at least three face images at once; each image is resized to a common 48×48 grayscale grid.', 'Center every flattened image by subtracting the mean face.', 'Compute principal components in sample space and convert them to eigenfaces.', 'Reconstruct the first face using the selected number of components.', 'Inspect cumulative explained variance, then use the Python reference for LFW PCA and SVM recognition.'],
    findings: [
      ['Why reduce dimensionality?', 'PCA replaces thousands of correlated pixels with a smaller set of high-variance features, reducing storage, computation, and overfitting.'],
      ['What do early eigenfaces capture?', 'The first components usually represent broad lighting, face outline, and dominant eye or jaw placement; later components describe finer variations and noise.'],
      ['What does whitening do?', 'It scales projected components to unit variance, preventing high-variance PCA directions from dominating an SVM solely because of numerical scale.']
    ],
    code: String.raw`from sklearn.datasets import fetch_lfw_people
from sklearn.model_selection import train_test_split
from sklearn.decomposition import PCA
from sklearn.svm import SVC
from sklearn.metrics import classification_report
import matplotlib.pyplot as plt
import numpy as np

faces = fetch_lfw_people(min_faces_per_person=70, resize=0.4)
X_train, X_test, y_train, y_test = train_test_split(
    faces.data, faces.target, test_size=0.2, random_state=42, stratify=faces.target)

pca = PCA(n_components=150, svd_solver='randomized', whiten=True, random_state=42)
X_train_pca = pca.fit_transform(X_train)
X_test_pca = pca.transform(X_test)
eigenfaces = pca.components_.reshape((150, *faces.images.shape[1:]))

clf = SVC(kernel='rbf', class_weight='balanced')
clf.fit(X_train_pca, y_train)
y_pred = clf.predict(X_test_pca)
print(classification_report(y_test, y_pred, target_names=faces.target_names))

variance = pca.explained_variance_ratio_.cumsum()
print('Components for 90% variance:', np.searchsorted(variance, .90) + 1)
plt.plot(np.arange(1, len(variance) + 1), variance)
plt.axhline(.90, color='red', linestyle='--')
plt.xlabel('Principal components'); plt.ylabel('Cumulative explained variance')
plt.show()`
  },
  '06': {
    title: 'YOLOv11 Object Detection', topic: 'OBJECT DETECTION & DATASETS', week: 'WEEK 8–9',
    objective: 'Understand YOLO labels, visualize detections, and follow a complete Ultralytics YOLO11 inference, custom-training, and evaluation workflow.',
    selectLabel: 'Detection activity', options: [['labels', 'YOLO label visualizer']],
    procedure: ['Upload an image and enter class names plus YOLO-format labels.', 'Use one line per object: class_id x_center y_center width height confidence, normalized from 0 to 1.', 'Render and inspect each bounding box, class label, and confidence score.', 'Prepare images/labels train and validation folders plus data.yaml.', 'Run the supplied Python code for pretrained inference, custom training, validation, and testing.'],
    findings: [
      ['Detection vs classification?', 'Classification assigns a category to an entire image. Detection also localizes every object with a bounding box—for example, identifying three cars and their positions instead of only saying “car”.'],
      ['Why normalize YOLO coordinates?', 'Normalized center, width, and height values make annotations independent of the image resolution.'],
      ['Which metrics matter?', 'Precision measures detection correctness, recall measures coverage, and mAP summarizes precision-recall performance across classes and IoU thresholds.']
    ],
    code: String.raw`from ultralytics import YOLO

# Pretrained inference (official weight name)
model = YOLO('yolo11n.pt')
results = model.predict(source='input.jpg', conf=0.25, save=True)
for result in results:
    print(result.boxes.xyxy, result.boxes.conf, result.boxes.cls)

# Custom training: data.yaml points to images/train and images/val
model.train(data='data.yaml', epochs=100, imgsz=640)
metrics = model.val(data='data.yaml')
print('mAP50-95:', metrics.box.map)

# Use the best trained checkpoint on a new image
best = YOLO('runs/detect/train/weights/best.pt')
best.predict(source='new_image.jpg', conf=0.25, save=True)`
  },
  '07': {
    title: 'Segmentation Techniques', topic: 'PIXEL & REGION SEGMENTATION', week: 'WEEK 13',
    objective: 'Compare thresholding, region-based, edge-based, and color-cluster segmentation on the same uploaded image.',
    selectLabel: 'Segmentation method', options: [['threshold', 'Thresholding (Otsu)'], ['region', 'Region growing'], ['edge', 'Edge-based segmentation'], ['clusters', 'Color clusters (semantic preparation)']],
    procedure: ['Upload an image containing distinguishable objects or regions.', 'Apply Otsu thresholding and compare foreground/background separation.', 'Choose a seed point and tolerance for region growing.', 'Use Canny boundaries for edge-based segmentation.', 'Cluster pixels by color to illustrate the per-pixel labeling stage used before evaluating semantic models; use the Python reference for pretrained DeepLab.'],
    findings: [
      ['Thresholding', 'Advantage: simple and fast for high-contrast images. Limitation: struggles with uneven lighting and overlapping intensity distributions.'],
      ['Region-based', 'Advantage: produces connected areas based on similarity. Limitation: results depend strongly on seed selection and tolerance.'],
      ['Edge-based', 'Advantage: highlights object boundaries. Limitation: noise or broken edges can prevent closed regions.'],
      ['Semantic segmentation', 'Advantage: gives every pixel a learned class label. Limitation: needs annotated data, substantial computation, and a trained model.']
    ],
    code: String.raw`import cv2
from skimage.segmentation import flood

img = cv2.imread('input.jpg')
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
_, otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
adaptive = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                 cv2.THRESH_BINARY, 11, 2)
edges = cv2.Canny(gray, 100, 200)
region = flood(gray, seed_point=(gray.shape[0] // 2, gray.shape[1] // 2), tolerance=20)

cv2.imshow('Otsu', otsu)
cv2.imshow('Adaptive', adaptive)
cv2.imshow('Edges', edges)
cv2.imshow('Region growing', (region * 255).astype('uint8'))
cv2.waitKey(0)

# Semantic extension: run a pretrained DeepLab or U-Net model and compare
# pixel labels with ground truth using IoU = intersection / union.`
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
  fileInput.multiple = number === '05';
  document.querySelector('#drop-zone strong').textContent = number === '05' ? 'Select face images' : 'Drop image here';
  document.querySelector('#drop-zone small').textContent = number === '02' ? 'Use input.jpg · PNG, JPG, or WEBP' : number === '05' ? 'Choose 3–20 PNG, JPG, or WEBP files' : 'PNG, JPG, or WEBP';

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

technique.addEventListener('change', () => {
  if (technique.value === 'crop' && !cropSelection && sourceCanvas) cropSelection = null;
  renderDynamicControls();
  if (sourceCanvas) renderSourcePreview();
});
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
      operationControls = `<div class="control-block crop-instructions"><label>Interactive crop selection</label><p>Drag directly over the original image to mark the area you want to keep.</p><div id="crop-selection-readout"><span>No area selected</span><strong>Click and drag on the image</strong></div><button id="clear-crop-selection" type="button" disabled>Clear selection</button></div>`;
    } else if (value === 'resize') {
      operationControls = rangeControl('operation-value', 'Output scale', 25, 100, 50, 5, '%');
    } else {
      operationControls = `<div class="control-hint"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" /></svg><span>The result will be compared with the original image.</span></div>`;
    }
    dynamicControls.innerHTML = transformTools + operationControls;
    bindRangeOutputs();
    bindTransformTools();
    bindCropControls();
    updateCropRunState();
  } else if (currentLab === '02') {
    dynamicControls.innerHTML = rangeControl('low-threshold', 'Canny low threshold', 0, 200, 50, 5, '') + rangeControl('high-threshold', 'Canny high threshold', 50, 255, 150, 5, '');
    bindRangeOutputs();
  } else if (currentLab === '03') {
    dynamicControls.innerHTML = rangeControl('clip-limit', 'CLAHE clip limit', 1, 5, 2, .5, '×') + `<div class="control-block"><label for="tile-grid">Adaptive tile grid</label><select id="tile-grid"><option value="4">4 × 4</option><option value="8" selected>8 × 8</option><option value="12">12 × 12</option></select></div>`;
    bindRangeOutputs();
  } else if (currentLab === '04') {
    dynamicControls.innerHTML = rangeControl('hessian-threshold', 'Hessian threshold', 5, 95, 45, 5, '%') + rangeControl('keypoint-limit', 'Maximum keypoints', 25, 300, 120, 25, '');
    bindRangeOutputs();
  } else if (currentLab === '05') {
    const maxComponents = Math.max(1, Math.min(8, pcaDataset.length - 1));
    dynamicControls.innerHTML = rangeControl('pca-components', 'Reconstruction components', 1, maxComponents, Math.min(3, maxComponents), 1, '') + `<div class="control-hint"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg><span>${pcaDataset.length ? `${pcaDataset.length} aligned face images loaded.` : 'Select at least three face images together.'}</span></div>`;
    bindRangeOutputs();
  } else if (currentLab === '06') {
    dynamicControls.innerHTML = `<div class="control-block text-controls"><label for="yolo-classes">Class names (comma-separated)</label><input id="yolo-classes" type="text" value="person, car, bottle" spellcheck="false"><label for="yolo-labels">YOLO labels</label><textarea id="yolo-labels" rows="6" spellcheck="false" placeholder="0 0.50 0.50 0.35 0.70 0.92"></textarea><small>class_id x_center y_center width height confidence</small></div>`;
  } else if (currentLab === '07') {
    if (value === 'region') {
      const maxX = Math.max(0, (sourceCanvas?.width || 1) - 1);
      const maxY = Math.max(0, (sourceCanvas?.height || 1) - 1);
      dynamicControls.innerHTML = `<div class="control-block compact-controls"><label>Seed coordinate</label><div class="field-row"><label>X<input id="seed-x" type="number" min="0" max="${maxX}" value="${Math.floor(maxX / 2)}"></label><label>Y<input id="seed-y" type="number" min="0" max="${maxY}" value="${Math.floor(maxY / 2)}"></label></div></div>` + rangeControl('region-tolerance', 'Intensity tolerance', 2, 80, 22, 2, '');
    } else if (value === 'edge') {
      dynamicControls.innerHTML = rangeControl('segment-edge-low', 'Canny low threshold', 0, 200, 55, 5, '') + rangeControl('segment-edge-high', 'Canny high threshold', 50, 255, 150, 5, '');
    } else if (value === 'clusters') {
      dynamicControls.innerHTML = rangeControl('cluster-count', 'Color clusters', 2, 6, 4, 1, '');
    } else {
      dynamicControls.innerHTML = `<div class="control-hint"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg><span>Otsu automatically selects the threshold from the grayscale histogram.</span></div>`;
    }
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
      if (sourceCanvas) renderSourcePreview();
    });
  });
}

function bindCropControls() {
  const clearButton = document.querySelector('#clear-crop-selection');
  if (!clearButton) return;
  clearButton.addEventListener('click', () => {
    cropSelection = null;
    renderSourcePreview();
    updateCropReadout();
    updateCropRunState();
  });
  updateCropReadout();
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
  const files = [...event.dataTransfer.files];
  if (currentLab === '05') loadPcaDataset(files);
  else if (files[0]) loadImage(files[0]);
});
fileInput.addEventListener('change', () => {
  const files = [...fileInput.files];
  if (currentLab === '05') loadPcaDataset(files);
  else if (files[0]) loadImage(files[0]);
});

async function loadPcaDataset(files) {
  const images = files.filter((file) => file.type.startsWith('image/')).slice(0, 20);
  if (images.length < 3) {
    showToast('Select at least three face images for the PCA experiment.');
    return;
  }
  try {
    const loaded = await Promise.all(images.map((file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (event) => {
        const image = new Image();
        image.onerror = reject;
        image.onload = () => resolve({ file, image });
        image.src = event.target.result;
      };
      reader.readAsDataURL(file);
    })));
    pcaDataset = loaded.map(({ image, file }) => {
      const canvas = document.createElement('canvas');
      canvas.width = 48; canvas.height = 48;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(image, 0, 0, 48, 48);
      return { file, pixels: Float32Array.from(toGrayscale(context.getImageData(0, 0, 48, 48))) };
    });
    const first = loaded[0];
    const scale = Math.min(1, 1000 / Math.max(first.image.naturalWidth, first.image.naturalHeight));
    const width = Math.max(1, Math.round(first.image.naturalWidth * scale));
    const height = Math.max(1, Math.round(first.image.naturalHeight * scale));
    sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = width; sourceCanvas.height = height;
    const context = sourceCanvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(first.image, 0, 0, width, height);
    sourceImageData = context.getImageData(0, 0, width, height);
    sourceFile = first.file;
    document.querySelector('#metric-width').textContent = '48 (aligned)';
    document.querySelector('#metric-height').textContent = '48 (aligned)';
    document.querySelector('#metric-channels').textContent = `${pcaDataset.length} faces`;
    document.querySelector('#metric-status').textContent = 'Ready';
    outputState.textContent = `Dataset ready · ${pcaDataset.length} faces`;
    runButton.disabled = false;
    renderDynamicControls();
    renderSourcePreview();
    showToast(`${pcaDataset.length} face images loaded for PCA.`);
  } catch (error) {
    console.error(error);
    showToast('One or more face images could not be loaded.');
  }
}

function loadImage(file) {
  if (!file.type.startsWith('image/')) {
    showToast('Please select a valid PNG, JPG, or WEBP image.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const image = new Image();
    image.onload = () => {
      const maxDimension = currentLab === '01' ? 4096 : 1000;
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
      cropSelection = null;

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
  if (currentLab === '01' && technique.value === 'crop') attachCropSelector(result);
  activeResultCanvas = result.canvas;
  revealResults();
  downloadButton.disabled = false;
  updateCropRunState();
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
    if (currentLab === '04') runLabFour();
    if (currentLab === '05') runLabFive();
    if (currentLab === '06') runLabSix();
    if (currentLab === '07') runLabSeven();
    outputState.textContent = 'Experiment complete';
    document.querySelector('#metric-status').textContent = 'Complete';
    document.querySelector('#guide-progress').textContent = 'Experiment completed';
    showToast(`${labDefinitions[currentLab].title} processing completed.`);
  } catch (error) {
    console.error(error);
    outputState.textContent = 'Processing error';
    document.querySelector('#metric-status').textContent = 'Error';
    showToast(error.message || 'The image could not be processed. Try a smaller file.');
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
  if (operation === 'crop') attachCropSelector(original);
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
    if (!cropSelection) throw new Error('Select a crop area on the original image first.');
    const { x: sx, y: sy, width, height } = cropSelection;
    const widthAmount = width / sourceCanvas.width;
    const heightAmount = height / sourceCanvas.height;
    const result = createResultCard('Selected crop', `${Math.round(widthAmount * 100)}% × ${Math.round(heightAmount * 100)}% ROI · ${width} × ${height}`, width, height);
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
  renderGrayResult('Sobel edges', 'Combined X and Y gradient magnitude', sobelData.display, width, height);
  activeResultCanvas = renderGrayResult('Canny edges', `Thresholds ${Math.min(low, high - 1)} / ${Math.max(high, low + 1)}`, cannyData, width, height).canvas;
  renderEdgeExplanation(sobelData.display, cannyData, width, height, low, high);
  revealResults();
}

function renderEdgeExplanation(sobelDisplay, cannyData, width, height, low, high) {
  const totalPixels = width * height;
  let sobelEdgePixels = 0;
  let cannyEdgePixels = 0;
  for (let index = 0; index < totalPixels; index++) {
    if (sobelDisplay[index] >= 64) sobelEdgePixels++;
    if (cannyData[index] === 255) cannyEdgePixels++;
  }
  const sobelPercent = (sobelEdgePixels / totalPixels * 100).toFixed(1);
  const cannyPercent = (cannyEdgePixels / totalPixels * 100).toFixed(1);
  const note = document.createElement('article');
  note.className = 'edge-explanation';
  note.innerHTML = `<div class="edge-explanation-heading"><span>EDGE MAP COMPARISON</span><strong>${sourceFile?.name || 'input.jpg'}</strong></div><div class="edge-methods"><section><div class="method-icon sobel-icon"><i></i><i></i><i></i></div><h3>Sobel edge map</h3><p>Sobel calculates first-order intensity gradients in the X and Y directions. Its grayscale output preserves edge strength, so strong transitions appear brighter while weaker transitions remain visible. Edges are usually thicker and more sensitive to image noise.</p><b>${sobelEdgePixels.toLocaleString()} strong-gradient pixels · ${sobelPercent}%</b></section><section><div class="method-icon canny-icon"><i></i></div><h3>Canny edge map</h3><p>Canny combines Gaussian smoothing, gradient analysis, non-maximum suppression, and hysteresis thresholds (${Math.min(low, high - 1)} / ${Math.max(high, low + 1)}). It produces a cleaner binary map with thinner, more connected edges and suppresses many weak or noisy responses.</p><b>${cannyEdgePixels.toLocaleString()} final edge pixels · ${cannyPercent}%</b></section></div><p class="edge-conclusion"><strong>Conclusion:</strong> Sobel is useful when gradient magnitude and edge strength must be inspected. Canny is preferable when the task needs a clean, localized, binary outline for later detection, segmentation, or feature extraction.</p>`;
  resultGrid.appendChild(note);
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

function runLabFour() {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const gray = gaussianBlur(toGrayscale(sourceImageData), width, height);
  const response = new Float32Array(width * height);
  const scaleMap = new Uint8Array(width * height);
  let maximum = 1;
  [1, 2, 4].forEach((radius) => {
    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        const index = y * width + x;
        const center = gray[index];
        const dxx = gray[index - radius] - 2 * center + gray[index + radius];
        const dyy = gray[index - radius * width] - 2 * center + gray[index + radius * width];
        const dxy = (gray[(y + radius) * width + x + radius] - gray[(y + radius) * width + x - radius] - gray[(y - radius) * width + x + radius] + gray[(y - radius) * width + x - radius]) / 4;
        const determinant = Math.abs(dxx * dyy - .81 * dxy * dxy) * radius;
        if (determinant > response[index]) { response[index] = determinant; scaleMap[index] = radius; }
        maximum = Math.max(maximum, determinant);
      }
    }
  });
  const thresholdPercent = Number(document.querySelector('#hessian-threshold').value);
  const threshold = maximum * (.01 + thresholdPercent / 100 * .24);
  const candidates = [];
  for (let y = 2; y < height - 2; y += 2) {
    for (let x = 2; x < width - 2; x += 2) {
      const index = y * width + x;
      if (response[index] < threshold) continue;
      let localMaximum = true;
      for (let oy = -2; oy <= 2 && localMaximum; oy++) for (let ox = -2; ox <= 2; ox++) if (response[(y + oy) * width + x + ox] > response[index]) { localMaximum = false; break; }
      if (localMaximum) candidates.push({ x, y, response: response[index], scale: scaleMap[index] || 1 });
    }
  }
  candidates.sort((a, b) => b.response - a.response);
  const limit = Number(document.querySelector('#keypoint-limit').value);
  const points = [];
  for (const candidate of candidates) {
    const minimumDistance = 5 + candidate.scale * 2;
    if (points.every((point) => Math.hypot(point.x - candidate.x, point.y - candidate.y) > minimumDistance)) points.push(candidate);
    if (points.length >= limit) break;
  }
  const responseDisplay = new Uint8ClampedArray(response.length);
  for (let index = 0; index < response.length; index++) responseDisplay[index] = Math.round(Math.sqrt(response[index] / maximum) * 255);
  clearResults();
  renderGrayResult('Hessian response', 'Bright pixels are strong blob responses', responseDisplay, width, height);
  const overlay = createResultCard('SURF-style keypoints', `${points.length} points · threshold ${thresholdPercent}%`, width, height);
  overlay.context.drawImage(sourceCanvas, 0, 0);
  overlay.context.lineWidth = Math.max(1.5, Math.min(width, height) / 350);
  points.forEach((point) => {
    const radius = 4 + point.scale * 2;
    const gx = gray[point.y * width + point.x + 1] - gray[point.y * width + point.x - 1];
    const gy = gray[(point.y + 1) * width + point.x] - gray[(point.y - 1) * width + point.x];
    const angle = Math.atan2(gy, gx);
    overlay.context.strokeStyle = '#ff4f8b';
    overlay.context.beginPath(); overlay.context.arc(point.x, point.y, radius, 0, Math.PI * 2); overlay.context.stroke();
    overlay.context.strokeStyle = '#45e5df';
    overlay.context.beginPath(); overlay.context.moveTo(point.x, point.y); overlay.context.lineTo(point.x + Math.cos(angle) * radius, point.y + Math.sin(angle) * radius); overlay.context.stroke();
  });
  activeResultCanvas = overlay.canvas;
  appendAnalysis('SURF INTERPRETATION', `Detected ${points.length} stable local maxima. Increase the Hessian threshold to keep only stronger structures; decrease it to retain more weak or textured points.`, 'The browser overlay demonstrates Hessian keypoint selection. Exact patented SURF descriptors and image matching are provided in the Python/OpenCV reference below.');
  revealResults();
}

function runLabFive() {
  if (pcaDataset.length < 3) throw new Error('At least three aligned images are required.');
  const samples = pcaDataset.map((item) => item.pixels);
  const count = samples.length;
  const dimensions = samples[0].length;
  const mean = new Float32Array(dimensions);
  samples.forEach((sample) => { for (let d = 0; d < dimensions; d++) mean[d] += sample[d] / count; });
  const centered = samples.map((sample) => Float32Array.from(sample, (value, d) => value - mean[d]));
  const gram = Array.from({ length: count }, () => new Float64Array(count));
  for (let row = 0; row < count; row++) for (let column = row; column < count; column++) {
    let sum = 0;
    for (let d = 0; d < dimensions; d++) sum += centered[row][d] * centered[column][d];
    gram[row][column] = gram[column][row] = sum / Math.max(1, count - 1);
  }
  const requested = Math.min(Number(document.querySelector('#pca-components').value), count - 1);
  const eigenvectors = [];
  const eigenvalues = [];
  const components = [];
  for (let componentIndex = 0; componentIndex < Math.min(Math.max(requested, 4), count - 1); componentIndex++) {
    let vector = Float64Array.from({ length: count }, (_, index) => Math.sin((index + 1) * (componentIndex + 1) * 1.37));
    for (let iteration = 0; iteration < 80; iteration++) {
      const next = new Float64Array(count);
      for (let row = 0; row < count; row++) for (let column = 0; column < count; column++) next[row] += gram[row][column] * vector[column];
      eigenvectors.forEach((previous) => {
        let projection = 0; for (let index = 0; index < count; index++) projection += next[index] * previous[index];
        for (let index = 0; index < count; index++) next[index] -= projection * previous[index];
      });
      const norm = Math.hypot(...next) || 1;
      vector = Float64Array.from(next, (value) => value / norm);
    }
    let eigenvalue = 0;
    for (let row = 0; row < count; row++) for (let column = 0; column < count; column++) eigenvalue += vector[row] * gram[row][column] * vector[column];
    if (eigenvalue < 1e-7) break;
    const face = new Float32Array(dimensions);
    for (let d = 0; d < dimensions; d++) for (let sample = 0; sample < count; sample++) face[d] += vector[sample] * centered[sample][d];
    const faceNorm = Math.hypot(...face) || 1;
    for (let d = 0; d < dimensions; d++) face[d] /= faceNorm;
    eigenvectors.push(vector); eigenvalues.push(eigenvalue); components.push(face);
  }
  const used = Math.min(requested, components.length);
  const reconstruction = Float32Array.from(mean);
  for (let component = 0; component < used; component++) {
    let weight = 0;
    for (let d = 0; d < dimensions; d++) weight += centered[0][d] * components[component][d];
    for (let d = 0; d < dimensions; d++) reconstruction[d] += weight * components[component][d];
  }
  const trace = gram.reduce((sum, row, index) => sum + row[index], 0) || 1;
  const retained = eigenvalues.slice(0, used).reduce((sum, value) => sum + value, 0) / trace * 100;
  clearResults();
  renderGrayResult('Mean face', `${count} aligned samples`, Uint8ClampedArray.from(mean, (value) => clamp(value, 0, 255)), 48, 48);
  components.slice(0, 3).forEach((face, index) => renderGrayResult(`Eigenface ${index + 1}`, `PC${index + 1} · ${(eigenvalues[index] / trace * 100).toFixed(1)}% variance`, normalizeSigned(face), 48, 48));
  activeResultCanvas = renderGrayResult('Reconstructed face', `${used} components · ${retained.toFixed(1)}% retained variance`, Uint8ClampedArray.from(reconstruction, (value) => clamp(value, 0, 255)), 48, 48).canvas;
  appendAnalysis('PCA ANALYSIS', `${used} principal component${used === 1 ? '' : 's'} retain ${retained.toFixed(1)}% of this uploaded dataset's variance.`, 'More components improve reconstruction but reduce compression. The full LFW + whitening + SVM recognition workflow is available in the Python reference.');
  revealResults();
}

function runLabSix() {
  const names = document.querySelector('#yolo-classes').value.split(',').map((name) => name.trim()).filter(Boolean);
  const lines = document.querySelector('#yolo-labels').value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) throw new Error('Enter at least one YOLO label line.');
  const detections = lines.map((line, lineIndex) => {
    const values = line.split(/\s+/).map(Number);
    if (values.length < 5 || values.some((value) => !Number.isFinite(value))) throw new Error(`Invalid YOLO label on line ${lineIndex + 1}.`);
    const [classId, centerX, centerY, boxWidth, boxHeight, confidence = 1] = values;
    if ([centerX, centerY, boxWidth, boxHeight].some((value) => value < 0 || value > 1)) throw new Error(`Coordinates on line ${lineIndex + 1} must be normalized 0–1.`);
    return { classId: Math.round(classId), centerX, centerY, boxWidth, boxHeight, confidence };
  });
  clearResults();
  const original = createResultCard('Original image', 'Input for YOLO annotation review', sourceCanvas.width, sourceCanvas.height);
  original.context.drawImage(sourceCanvas, 0, 0);
  const result = createResultCard('YOLO detections', `${detections.length} object${detections.length === 1 ? '' : 's'}`, sourceCanvas.width, sourceCanvas.height);
  result.context.drawImage(sourceCanvas, 0, 0);
  const lineWidth = Math.max(2, Math.min(sourceCanvas.width, sourceCanvas.height) / 250);
  result.context.lineWidth = lineWidth;
  result.context.font = `700 ${Math.max(12, Math.round(Math.min(sourceCanvas.width, sourceCanvas.height) / 35))}px monospace`;
  detections.forEach((box, index) => {
    const width = box.boxWidth * sourceCanvas.width;
    const height = box.boxHeight * sourceCanvas.height;
    const x = box.centerX * sourceCanvas.width - width / 2;
    const y = box.centerY * sourceCanvas.height - height / 2;
    const color = ['#ff4f8b', '#45e5df', '#ffd166', '#9d7cff'][index % 4];
    const label = `${names[box.classId] || `class ${box.classId}`} ${(box.confidence * 100).toFixed(0)}%`;
    result.context.strokeStyle = color; result.context.fillStyle = color;
    result.context.strokeRect(x, y, width, height);
    const textWidth = result.context.measureText(label).width + 12;
    const textHeight = Math.max(20, Math.round(Math.min(sourceCanvas.width, sourceCanvas.height) / 24));
    result.context.fillRect(x, Math.max(0, y - textHeight), textWidth, textHeight);
    result.context.fillStyle = '#07101d'; result.context.fillText(label, x + 6, Math.max(15, y - 5));
  });
  activeResultCanvas = result.canvas;
  appendAnalysis('YOLO WORKFLOW', `${detections.length} normalized annotation${detections.length === 1 ? '' : 's'} converted to pixel-space bounding boxes.`, 'This visualizer validates YOLO-format labels. Actual pretrained inference and custom-model training run through Ultralytics using the Python reference; the interface does not claim to fabricate model predictions.');
  revealResults();
}

function runLabSeven() {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const gray = toGrayscale(sourceImageData);
  const method = technique.value;
  clearResults();
  const original = createResultCard('Original image', 'Shared segmentation input', width, height);
  original.context.drawImage(sourceCanvas, 0, 0);
  if (method === 'threshold') {
    const threshold = otsuThreshold(gray);
    const mask = Uint8ClampedArray.from(gray, (value) => value >= threshold ? 255 : 0);
    activeResultCanvas = renderGrayResult('Otsu threshold', `Automatic threshold: ${threshold}`, mask, width, height).canvas;
    appendAnalysis('THRESHOLDING', `Otsu selected intensity ${threshold}; ${(mask.reduce((sum, value) => sum + (value === 255), 0) / mask.length * 100).toFixed(1)}% of pixels are foreground.`, 'Fast and effective for bimodal, high-contrast scenes; uneven lighting can merge foreground and background distributions.');
  } else if (method === 'region') {
    const seedX = clamp(Number(document.querySelector('#seed-x').value), 0, width - 1);
    const seedY = clamp(Number(document.querySelector('#seed-y').value), 0, height - 1);
    const tolerance = Number(document.querySelector('#region-tolerance').value);
    const mask = regionGrow(gray, width, height, seedX, seedY, tolerance);
    activeResultCanvas = renderGrayResult('Region growing', `Seed (${seedX}, ${seedY}) · tolerance ${tolerance}`, mask, width, height).canvas;
    appendAnalysis('REGION-BASED', 'Connected neighboring pixels are accepted when their intensity remains close to the selected seed.', 'Seed placement and tolerance control the result; a poor seed can select the wrong region or leak into nearby objects.');
  } else if (method === 'edge') {
    const low = Number(document.querySelector('#segment-edge-low').value);
    const high = Number(document.querySelector('#segment-edge-high').value);
    const edges = cannyFromSobel(sobel(gaussianBlur(gray, width, height), width, height), width, height, Math.min(low, high - 1), Math.max(high, low + 1));
    activeResultCanvas = renderGrayResult('Edge boundaries', `Canny thresholds ${low} / ${high}`, edges, width, height).canvas;
    appendAnalysis('EDGE-BASED', 'Canny marks likely boundaries after smoothing, gradient analysis, thinning, and hysteresis tracking.', 'Clean closed edges can outline objects; noise, weak contrast, or gaps make complete region formation difficult.');
  } else {
    const clusters = Number(document.querySelector('#cluster-count').value);
    const clustered = colorKMeans(sourceImageData.data, width, height, clusters);
    activeResultCanvas = renderImageDataResult('Color clusters', `${clusters} pixel groups`, clustered, width, height).canvas;
    appendAnalysis('SEMANTIC PREPARATION', `Pixels were assigned to ${clusters} visual color groups. Each color represents a cluster, not a learned object class.`, 'True semantic segmentation uses a trained DeepLab or U-Net to label pixels with meanings such as person, road, or sky. This local clustering demonstrates the per-pixel label map without misrepresenting it as a neural model.');
  }
  revealResults();
}

function appendAnalysis(title, primary, secondary) {
  const note = document.createElement('article');
  note.className = 'analysis-note';
  note.innerHTML = `<span>${title}</span><p><strong>${primary}</strong></p><p>${secondary}</p>`;
  resultGrid.appendChild(note);
}

function normalizeSigned(values) {
  let minimum = Infinity; let maximum = -Infinity;
  values.forEach((value) => { minimum = Math.min(minimum, value); maximum = Math.max(maximum, value); });
  const range = maximum - minimum || 1;
  return Uint8ClampedArray.from(values, (value) => (value - minimum) / range * 255);
}

function otsuThreshold(input) {
  const histogram = calculateHistogram(input);
  let totalSum = 0; for (let value = 0; value < 256; value++) totalSum += value * histogram[value];
  let backgroundWeight = 0; let backgroundSum = 0; let bestVariance = -1; let bestThreshold = 0;
  for (let value = 0; value < 256; value++) {
    backgroundWeight += histogram[value];
    if (!backgroundWeight) continue;
    const foregroundWeight = input.length - backgroundWeight;
    if (!foregroundWeight) break;
    backgroundSum += value * histogram[value];
    const meanBackground = backgroundSum / backgroundWeight;
    const meanForeground = (totalSum - backgroundSum) / foregroundWeight;
    const variance = backgroundWeight * foregroundWeight * (meanBackground - meanForeground) ** 2;
    if (variance > bestVariance) { bestVariance = variance; bestThreshold = value; }
  }
  return bestThreshold;
}

function regionGrow(gray, width, height, seedX, seedY, tolerance) {
  const output = new Uint8ClampedArray(gray.length);
  const visited = new Uint8Array(gray.length);
  const queue = new Int32Array(gray.length);
  const seedValue = gray[seedY * width + seedX];
  let head = 0; let tail = 0;
  queue[tail++] = seedY * width + seedX;
  visited[seedY * width + seedX] = 1;
  while (head < tail) {
    const index = queue[head++]; output[index] = 255;
    const x = index % width; const y = Math.floor(index / width);
    const neighbors = [index - 1, index + 1, index - width, index + width];
    for (let n = 0; n < 4; n++) {
      const neighbor = neighbors[n];
      if (neighbor < 0 || neighbor >= gray.length || visited[neighbor]) continue;
      const nx = neighbor % width; const ny = Math.floor(neighbor / width);
      if (Math.abs(nx - x) + Math.abs(ny - y) !== 1) continue;
      visited[neighbor] = 1;
      if (Math.abs(gray[neighbor] - seedValue) <= tolerance) queue[tail++] = neighbor;
    }
  }
  return output;
}

function colorKMeans(rgba, width, height, clusterCount) {
  const pixels = width * height;
  const centroids = Array.from({ length: clusterCount }, (_, index) => {
    const source = Math.floor((index + .5) / clusterCount * (pixels - 1)) * 4;
    return [rgba[source], rgba[source + 1], rgba[source + 2]];
  });
  const labels = new Uint8Array(pixels);
  for (let iteration = 0; iteration < 6; iteration++) {
    const sums = Array.from({ length: clusterCount }, () => [0, 0, 0, 0]);
    for (let pixel = 0; pixel < pixels; pixel++) {
      const source = pixel * 4; let best = 0; let bestDistance = Infinity;
      for (let cluster = 0; cluster < clusterCount; cluster++) {
        const dr = rgba[source] - centroids[cluster][0]; const dg = rgba[source + 1] - centroids[cluster][1]; const db = rgba[source + 2] - centroids[cluster][2];
        const distance = dr * dr + dg * dg + db * db;
        if (distance < bestDistance) { bestDistance = distance; best = cluster; }
      }
      labels[pixel] = best; sums[best][0] += rgba[source]; sums[best][1] += rgba[source + 1]; sums[best][2] += rgba[source + 2]; sums[best][3]++;
    }
    sums.forEach((sum, cluster) => { if (sum[3]) centroids[cluster] = [sum[0] / sum[3], sum[1] / sum[3], sum[2] / sum[3]]; });
  }
  const output = new Uint8ClampedArray(rgba.length);
  for (let pixel = 0; pixel < pixels; pixel++) {
    const target = pixel * 4; const color = centroids[labels[pixel]];
    output[target] = color[0]; output[target + 1] = color[1]; output[target + 2] = color[2]; output[target + 3] = 255;
  }
  return output;
}

function clearResults() {
  resultGrid.innerHTML = '';
  resultGrid.hidden = false;
  emptyOutput.hidden = true;
  activeResultCanvas = null;
}

function attachCropSelector(result) {
  const { canvas, card } = result;
  const wrap = canvas.parentElement;
  card.classList.add('crop-source-card');
  wrap.classList.add('crop-selector-active');
  wrap.dataset.disableLightbox = 'true';
  wrap.removeAttribute('role');
  wrap.removeAttribute('tabindex');
  wrap.removeAttribute('title');
  wrap.removeAttribute('aria-label');
  card.querySelector('.result-expand')?.setAttribute('hidden', '');
  canvas.setAttribute('aria-label', 'Drag over the source image to select a crop area');
  canvas.setAttribute('title', 'Drag to select crop area');
  canvas.style.cursor = 'crosshair';
  canvas.style.touchAction = 'none';

  const overlay = document.createElement('div');
  overlay.className = 'crop-selection-box';
  overlay.innerHTML = '<i></i><i></i><i></i><i></i><span></span>';
  wrap.appendChild(overlay);

  const prompt = document.createElement('div');
  prompt.className = 'crop-canvas-prompt';
  prompt.textContent = 'Drag to select crop area';
  wrap.appendChild(prompt);

  let dragging = false;
  let start = null;

  const canvasPoint = (event) => {
    const bounds = canvas.getBoundingClientRect();
    return {
      x: clamp(Math.round((event.clientX - bounds.left) / bounds.width * canvas.width), 0, canvas.width),
      y: clamp(Math.round((event.clientY - bounds.top) / bounds.height * canvas.height), 0, canvas.height)
    };
  };

  const drawOverlay = () => {
    if (!cropSelection) {
      overlay.classList.remove('visible');
      prompt.hidden = false;
      return;
    }
    const canvasBounds = canvas.getBoundingClientRect();
    const wrapBounds = wrap.getBoundingClientRect();
    overlay.style.left = `${canvasBounds.left - wrapBounds.left + cropSelection.x / canvas.width * canvasBounds.width}px`;
    overlay.style.top = `${canvasBounds.top - wrapBounds.top + cropSelection.y / canvas.height * canvasBounds.height}px`;
    overlay.style.width = `${cropSelection.width / canvas.width * canvasBounds.width}px`;
    overlay.style.height = `${cropSelection.height / canvas.height * canvasBounds.height}px`;
    overlay.querySelector('span').textContent = `${cropSelection.width} × ${cropSelection.height}`;
    overlay.classList.add('visible');
    prompt.hidden = true;
  };

  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    dragging = true;
    start = canvasPoint(event);
    cropSelection = { x: start.x, y: start.y, width: 1, height: 1 };
    canvas.setPointerCapture?.(event.pointerId);
    drawOverlay();
  });

  canvas.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const point = canvasPoint(event);
    cropSelection = {
      x: Math.min(start.x, point.x),
      y: Math.min(start.y, point.y),
      width: Math.max(1, Math.abs(point.x - start.x)),
      height: Math.max(1, Math.abs(point.y - start.y))
    };
    drawOverlay();
    updateCropReadout();
    updateCropRunState();
  });

  const finishSelection = (event) => {
    if (!dragging) return;
    dragging = false;
    canvas.releasePointerCapture?.(event.pointerId);
    if (cropSelection.width < 4 || cropSelection.height < 4) cropSelection = null;
    drawOverlay();
    updateCropReadout();
    updateCropRunState();
  };
  canvas.addEventListener('pointerup', finishSelection);
  canvas.addEventListener('pointercancel', finishSelection);
  window.addEventListener('resize', drawOverlay, { passive: true });
  requestAnimationFrame(drawOverlay);
}

function updateCropReadout() {
  const readout = document.querySelector('#crop-selection-readout');
  const clearButton = document.querySelector('#clear-crop-selection');
  if (!readout) return;
  if (!cropSelection || !sourceCanvas) {
    readout.innerHTML = '<span>No area selected</span><strong>Click and drag on the image</strong>';
    if (clearButton) clearButton.disabled = true;
    return;
  }
  const widthPercent = Math.round(cropSelection.width / sourceCanvas.width * 100);
  const heightPercent = Math.round(cropSelection.height / sourceCanvas.height * 100);
  readout.innerHTML = `<span>X ${cropSelection.x} · Y ${cropSelection.y}</span><strong>${cropSelection.width} × ${cropSelection.height}px · ${widthPercent}% × ${heightPercent}%</strong>`;
  if (clearButton) clearButton.disabled = false;
}

function updateCropRunState() {
  if (currentLab === '01' && technique.value === 'crop') runButton.disabled = !sourceCanvas || !cropSelection;
  else runButton.disabled = !sourceCanvas;
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
  header.innerHTML = `<div><strong>${title}</strong><span>${subtitle}</span></div><button class="result-expand" type="button" aria-label="Enlarge ${title}" title="Enlarge image"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4H4v5M15 4h5v5M20 15v5h-5M4 15v5h5"/></svg></button>`;
  const canvasWrap = document.createElement('div');
  canvasWrap.className = 'result-canvas-wrap';
  canvasWrap.tabIndex = 0;
  canvasWrap.setAttribute('role', 'button');
  canvasWrap.setAttribute('aria-label', `Enlarge ${title}`);
  canvasWrap.setAttribute('title', 'Click anywhere on this image to enlarge it');
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const openCanvas = () => {
    if (canvasWrap.dataset.disableLightbox === 'true') return;
    openImageLightbox(canvas, title, subtitle);
  };
  canvasWrap.addEventListener('click', openCanvas);
  canvasWrap.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    openCanvas();
  });
  header.querySelector('.result-expand').addEventListener('click', openCanvas);
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

function openImageLightbox(source, title, subtitle) {
  lightboxReturnFocus = document.activeElement;
  lightboxCanvas.width = source.width;
  lightboxCanvas.height = source.height;
  const context = lightboxCanvas.getContext('2d');
  context.clearRect(0, 0, source.width, source.height);
  context.drawImage(source, 0, 0);
  document.querySelector('#lightbox-title').textContent = title;
  document.querySelector('#lightbox-subtitle').textContent = `${subtitle} · ${source.width} × ${source.height}px`;
  imageLightbox.hidden = false;
  document.body.classList.add('lightbox-open');
  requestAnimationFrame(() => {
    imageLightbox.classList.add('is-open');
    lightboxClose.focus();
  });
}

function closeImageLightbox() {
  if (imageLightbox.hidden) return;
  imageLightbox.classList.remove('is-open');
  document.body.classList.remove('lightbox-open');
  window.setTimeout(() => {
    imageLightbox.hidden = true;
    if (lightboxReturnFocus instanceof HTMLElement) lightboxReturnFocus.focus();
  }, 180);
}

lightboxClose.addEventListener('click', closeImageLightbox);
imageLightbox.addEventListener('click', (event) => {
  if (event.target === imageLightbox) closeImageLightbox();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !imageLightbox.hidden) closeImageLightbox();
});

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
  pcaDataset = [];
  activeResultCanvas = null;
  cropSelection = null;
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
