# CSST 106 · 4B Vision Lab

A responsive laboratory dashboard for organizing and running all Computer Vision activities in one place.

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
- Embedded procedures, observations, answers, and Python/OpenCV reference code from the laboratory specifications
- Three additional activity slots ready for future Computer Vision modules

## Run locally

This is a build-free static site. Open `index.html` directly, or serve the repository with any local static server:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Project structure

```text
index.html               Main page and laboratory module shell
styles.css               Responsive visual system
script.js                Navigation, filtering, upload, and preview interactions
```
