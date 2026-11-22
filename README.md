# CSST 106 · 4B Vision Lab

A responsive laboratory dashboard for organizing and running all Computer Vision activities in one place.

## Current interface

- Responsive dark navy / coral app interface with persistent dark and light modes
- Animated, code-native computer-vision telemetry display and interface icons
- Dedicated dashboard and full laboratory experiment workspace
- Laboratory archive with ready/planned filters
- Reusable module preview with image upload, drag-and-drop, technique selection, and simulated processing state
- Accessible navigation, keyboard-friendly dialog, reduced-motion support, and mobile layouts
- Six starter activity modules ready to connect to the real Computer Vision implementations

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
