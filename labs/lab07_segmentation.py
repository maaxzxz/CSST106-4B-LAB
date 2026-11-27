"""Compare classical segmentation and pretrained DeepLabV3 and score supplied masks."""

import argparse
import json
import os
from pathlib import Path

import cv2 as cv
import matplotlib
matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
from PIL import Image
from scipy import ndimage
from skimage.feature import peak_local_max
from skimage.segmentation import flood, watershed


def classical(gray, seed, tolerance, dark, peak_distance):
    smoothed = cv.GaussianBlur(gray, (5, 5), 0)
    polarity = cv.THRESH_BINARY_INV if dark else cv.THRESH_BINARY
    _, otsu = cv.threshold(smoothed, 0, 255, polarity | cv.THRESH_OTSU)
    adaptive = cv.adaptiveThreshold(smoothed, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C,
                                    polarity, 11, 2 if dark else -2)
    region = flood(gray, seed, tolerance=tolerance, connectivity=1)

    # Distance peaks provide object markers, including multiple markers for touching objects.
    foreground = cv.morphologyEx(otsu, cv.MORPH_OPEN, np.ones((3, 3), np.uint8)) > 0
    distance = ndimage.distance_transform_edt(foreground)
    peaks = peak_local_max(distance, labels=foreground, min_distance=peak_distance, exclude_border=False)
    markers = np.zeros(gray.shape, dtype=np.int32)
    for index, (y, x) in enumerate(peaks, start=1):
        markers[y, x] = index
    components, count = ndimage.label(foreground)
    next_marker = len(peaks)
    # Give small connected components a marker even when peak filtering removes theirs.
    for index, area in enumerate(ndimage.find_objects(components, max_label=count), start=1):
        connected = components[area] == index
        local_markers = markers[area]
        if not local_markers[connected].any():
            seed_index = np.argmax(np.where(connected, distance[area], -1))
            next_marker += 1
            local_markers.flat[seed_index] = next_marker
    regions = watershed(-distance, markers, mask=foreground, watershed_line=True)

    edges = cv.Canny(smoothed, 50, 150)
    closed = cv.morphologyEx(edges, cv.MORPH_CLOSE, np.ones((3, 3), np.uint8))
    # Flood the exterior; only enclosed pixels are accepted as filled regions.
    exterior = cv.copyMakeBorder(closed, 1, 1, 1, 1, cv.BORDER_CONSTANT, value=0)
    cv.floodFill(exterior, None, (0, 0), 255)
    enclosed = exterior[1:-1, 1:-1] == 0
    return {"otsu": otsu > 0, "adaptive": adaptive > 0, "region_growing": region,
            "watershed": regions > 0, "edge_regions": enclosed}, regions, edges


def semantic(image, device):
    os.environ.setdefault("TORCH_HOME", str(Path(".lab-cache/torch").resolve()))
    import torch
    from torchvision.models.segmentation import DeepLabV3_ResNet50_Weights, deeplabv3_resnet50

    weights = DeepLabV3_ResNet50_Weights.DEFAULT
    model = deeplabv3_resnet50(weights=weights).to(device).eval()
    batch = weights.transforms()(image).unsqueeze(0).to(device)
    with torch.inference_mode():
        logits = model(batch)["out"]
        logits = torch.nn.functional.interpolate(logits, size=(image.height, image.width),
                                                 mode="bilinear", align_corners=False)
        labels = logits.argmax(dim=1)[0].cpu().numpy().astype(np.uint8)
    return labels, weights.meta["categories"]


def mask_at(path, shape):
    with Image.open(path) as image:
        mask = np.array(image)
    if mask.ndim != 2 or mask.shape != shape or mask.dtype.kind not in "biu":
        raise ValueError(f"{path} must be a grayscale or indexed integer mask of size {shape[1]}×{shape[0]}.")
    return mask


def iou(prediction, truth):
    union = np.count_nonzero(prediction | truth)
    return float(np.count_nonzero(prediction & truth) / union) if union else None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("image", type=Path, help="Image for classical segmentation")
    parser.add_argument("--semantic-image", type=Path, help="Optional separate natural image for DeepLab")
    parser.add_argument("--classical-only", action="store_true")
    parser.add_argument("--seed", nargs=2, type=int, metavar=("X", "Y"))
    parser.add_argument("--tolerance", type=int, default=20)
    parser.add_argument("--peak-distance", type=int, default=12)
    parser.add_argument("--dark-foreground", action="store_true")
    parser.add_argument("--binary-mask", type=Path, help="Ground truth with values 0/1 or 0/255")
    parser.add_argument("--semantic-mask", type=Path, help="VOC class IDs 0–20, with 255 ignored")
    parser.add_argument("--device", default="cpu")
    parser.add_argument("--out", type=Path, default=Path("lab-output/07"))
    args = parser.parse_args()
    if args.classical_only and (args.semantic_image or args.semantic_mask):
        parser.error("Remove --classical-only to run DeepLab with a semantic image or mask.")
    if not 0 <= args.tolerance <= 255 or args.peak_distance < 1:
        parser.error("Use a tolerance from 0 to 255 and a positive peak distance.")

    with Image.open(args.image) as source:
        image = source.convert("RGB")
    gray = cv.cvtColor(np.asarray(image), cv.COLOR_RGB2GRAY)
    x, y = args.seed or (image.width // 2, image.height // 2)
    if not 0 <= x < image.width or not 0 <= y < image.height:
        parser.error("Seed coordinates must be inside the image.")
    masks, regions, edges = classical(gray, (y, x), args.tolerance,
                                      args.dark_foreground, args.peak_distance)
    args.out.mkdir(parents=True, exist_ok=True)
    scores = {"watershed_regions": int(len(np.unique(regions[regions > 0])))}
    if args.binary_mask:
        truth = mask_at(args.binary_mask, gray.shape)
        if not np.all(np.isin(truth, [0, 1, 255])):
            parser.error("Binary mask must contain only 0/1 or 0/255.")
        scores["binary_iou"] = {name: iou(mask, truth > 0) for name, mask in masks.items()}

    panels = [("Input", image, None), ("Canny boundaries", edges > 0, "gray")]
    for name, mask in masks.items():
        Image.fromarray(mask.astype(np.uint8) * 255).save(args.out / f"{name}.png")
        if name != "watershed":
            panels.append((name.replace("_", " ").title(), mask, "gray"))
    Image.fromarray(edges).save(args.out / "canny.png")
    np.save(args.out / "watershed_labels.npy", regions)
    panels.append(("Watershed regions", np.ma.masked_equal(regions, 0), "turbo"))
    fig, axes = plt.subplots(2, 4, figsize=(12, 6), layout="constrained")
    for ax in axes.flat:
        ax.axis("off")
    for ax, (title, data, cmap) in zip(axes.flat, panels):
        if cmap == "gray":
            ax.imshow(data, cmap=cmap, vmin=0, vmax=1)
        else:
            ax.imshow(data, cmap=cmap)
        ax.set_title(title)
    fig.savefig(args.out / "comparison.png", dpi=160)
    plt.close(fig)

    if not args.classical_only:
        if args.semantic_image:
            with Image.open(args.semantic_image) as source:
                image = source.convert("RGB")
        labels, names = semantic(image, args.device)
        Image.fromarray(labels).save(args.out / "semantic_class_ids.png")
        present = np.unique(labels)
        scores["predicted_classes"] = [names[index] for index in present]
        fig, axes = plt.subplots(1, 2, figsize=(12, 6), layout="constrained")
        axes[0].imshow(image)
        axes[0].set_title("DeepLab input")
        palette = plt.colormaps["tab20"].resampled(20)
        colors = np.vstack(([0, 0, 0, 1], palette(np.arange(20))))
        axes[1].imshow(colors[labels])
        axes[1].set_title("DeepLabV3 predicted classes")
        from matplotlib.patches import Patch
        axes[1].legend(handles=[Patch(facecolor=colors[index], label=names[index]) for index in present],
                       loc="upper center", bbox_to_anchor=(0.5, -0.02), ncols=3)
        for ax in axes:
            ax.axis("off")
        fig.savefig(args.out / "semantic_overlay.png", dpi=160)
        plt.close(fig)

        if args.semantic_mask:
            truth = mask_at(args.semantic_mask, labels.shape)
            if not np.all(np.isin(truth, [*range(len(names)), 255])):
                parser.error("Semantic mask must use VOC class IDs 0–20 or ignore label 255.")
            valid = truth != 255
            per_class = {name: iou((labels == i) & valid, (truth == i) & valid)
                         for i, name in enumerate(names)}
            scored = [score for score in per_class.values() if score is not None]
            scores["semantic_iou"] = per_class
            scores["semantic_mean_iou"] = float(np.mean(scored)) if scored else None

    report = json.dumps(scores, indent=2)
    (args.out / "analysis.json").write_text(report, encoding="utf-8")
    print(report)


if __name__ == "__main__":
    main()
