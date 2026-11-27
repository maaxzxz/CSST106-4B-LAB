# CSST 106 · 4B Vision Lab

A responsive laboratory dashboard for organizing and running all Computer Vision activities in one place.

[GitHub repository](https://github.com/maaxzxz/CSST106-4B-LAB)
· [Live dashboard](https://maaxzxz.github.io/CSST106-4B-LAB/)

## Current interface

- Responsive dark navy / coral app interface with persistent dark and light modes
- Animated, code-native computer-vision telemetry display and interface icons
- Dedicated dashboard and full laboratory experiment workspace
- Laboratory archive with ready/planned filters
- Functional browser-side image processing with drag-and-drop input and downloadable PNG results
- Accessible navigation, keyboard-friendly dialog, reduced-motion support, and mobile layouts
- Completed Lab 01 image manipulation: grayscale/channels, pixel editing, crop, resize, and rotation
- Completed Lab 02 edge detection: Gaussian blur, Sobel magnitude, and Canny edge tracking
- Completed Lab 03 contrast enhancement: histograms, global equalization, stretching, and CLAHE
- Labs 04–07 have browser demonstrations and downloadable Python workflows for the full experiments.
- Embedded procedures, observations, answers, and Python/OpenCV reference code from the laboratory specifications
- Three additional activity slots ready for future Computer Vision modules

## Run locally

This is a build-free static site. Open `index.html` directly, or serve the repository with any local static server:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Python labs 04–07

Run the commands from the repository root. On Windows PowerShell, create an environment and use its Python executable:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r labs/requirements.txt
```

Use `python` in the examples below after activating the environment, or substitute `.\.venv\Scripts\python.exe`. Lab 05 downloads LFW on first use. Labs 06 and 07 download their pretrained weights the first time they run. Generated results go in `lab-output`.

### Lab 04 · SURF, upright SURF, SIFT, and ORB

```powershell
python labs/lab04_surf.py image1.jpg image2.jpg --thresholds 200 400 800
```

Use two views of the same textured scene. The script saves keypoint and match images and a CSV of counts and timings. Compare upright and rotation-aware SURF at the same threshold on a rotated pair. The match images show up to 60 ratio-test matches.

For the SURF rows, use a build of [OpenCV](https://github.com/opencv/opencv) and [opencv_contrib](https://github.com/opencv/opencv_contrib) at matching versions. Build OpenCV against the same Python version with the Python bindings enabled, `OPENCV_EXTRA_MODULES_PATH` pointing at `opencv_contrib/modules`, and `OPENCV_ENABLE_NONFREE=ON`. See the [OpenCV configuration guide](https://docs.opencv.org/4.x/db/d05/tutorial_config_reference.html). Use that build in a separate environment or make it the first `cv2` on Python's import path. If SURF is unavailable, the script saves the SIFT and ORB results and exits with status 2.

If the OpenCV build already exists, point `PYTHONPATH` at its `python_loader` directory before running Lab 04. On PowerShell, use `$env:PYTHONPATH = "C:/path/to/opencv-build/python_loader"` in a separate terminal so the other labs can keep using their usual OpenCV installation.

### Lab 05 · LFW face recognition with Eigenfaces

```powershell
python labs/lab05_eigenfaces.py
```

Open `lab-output/05/lab05_report.pdf` for the classification report, the cumulative variance plot and its 90% cutoff, the leading and trailing eigenfaces, and actual misclassified test examples. The SVM uses 150 whitened components fitted on the stratified training split.

### Lab 06 · YOLO11 object detection

```powershell
python labs/lab06_yolo.py webcam
python labs/lab06_yolo.py predict input.jpg
python labs/lab06_yolo.py demo-data
python labs/lab06_yolo.py train --data lab-output/06/shapes/data.yaml --epochs 5 --imgsz 160
python labs/lab06_yolo.py val --weights lab-output/06/train/weights/best.pt --data lab-output/06/shapes/data.yaml --split test --imgsz 160
python labs/lab06_yolo.py predict lab-output/06/shapes/images/test/shapes_000.png --weights lab-output/06/train/weights/best.pt --imgsz 160
```

The webcam preview shows boxes, labels, confidence, and processing FPS. Press Q or Esc to close it. For your own dataset, put images under `images/train`, `images/val`, and `images/test` with matching `.txt` files under `labels/<split>`. Each label row has five fields: `class_id x_center y_center width height`. Normalize the four coordinates by image size. Copy [the YAML example](labs/data.example.yaml) into the dataset folder as `data.yaml`, set the path and classes, and pass it to `train` and `val`. Use separate images for each split.

The shapes dataset provides an annotated practice run with separate training, validation, and test images. Set `--epochs 100 --imgsz 640` for the handout's settings on your own dataset. Use the checkpoint path printed by training, especially if a previous run already exists. The evaluation folder contains `metrics.json` with precision, recall, mAP50, and mAP50–95.

### Lab 07 · Classical and semantic segmentation

```powershell
python labs/lab07_segmentation.py touching_objects.png --seed 70 80 --binary-mask foreground.png --semantic-image scene.jpg --semantic-mask voc_labels.png
```

Use `--classical-only` for a classical run. Use `--dark-foreground` for dark objects on a light background and tune `--peak-distance` to adjust watershed marker separation. The optional seed is an X/Y pixel coordinate. The optional binary mask must contain 0/1 or 0/255. For DeepLab evaluation, supply an indexed Pascal VOC mask with class IDs 0–20 and 255 for ignored pixels. Each mask must match its corresponding input image dimensions. Omit the mask arguments when ground truth is unavailable.

Outputs include side-by-side comparisons, binary masks, watershed region IDs, and a DeepLab class map with a legend. With ground truth, `analysis.json` gives IoU per binary method and per semantic class. Empty unions are skipped for mean IoU.

## Project structure

```text
index.html               Main page and laboratory module shell
styles.css               Responsive visual system
script.js                Navigation, filtering, upload, and preview interactions
labs/                    Runnable Python experiments and dependency list
```
