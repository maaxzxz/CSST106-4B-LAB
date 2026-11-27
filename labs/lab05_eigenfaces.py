"""Fit Eigenfaces and an RBF SVM on LFW and generate an illustrated PDF report."""

import argparse
from pathlib import Path
from textwrap import wrap

import matplotlib
matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.backends.backend_pdf import PdfPages
from sklearn.datasets import fetch_lfw_people
from sklearn.decomposition import PCA
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC


def gallery(images, titles, heading, symmetric=False):
    rows = max(1, (len(images) + 3) // 4)
    fig, axes = plt.subplots(rows, 4, figsize=(10, 2.25 * rows + 0.6), squeeze=False,
                             layout="constrained")
    fig.suptitle(heading)
    limit = float(np.max(np.abs(images))) if symmetric else None
    for index, ax in enumerate(axes.flat):
        ax.axis("off")
        if index < len(images):
            ax.imshow(images[index], cmap="gray", vmin=-limit if symmetric else 0,
                      vmax=limit if symmetric else 1)
            ax.set_title(titles[index], fontsize=8, wrap=True)
    return fig


def write_report(faces, output, components):
    indices = np.arange(len(faces.target))
    train, test = train_test_split(indices, test_size=0.2, random_state=42, stratify=faces.target)
    train_pixels, test_pixels = faces.data[train], faces.data[test]
    pca = PCA(n_components=components, whiten=True, svd_solver="randomized", random_state=42)
    train_features = pca.fit_transform(train_pixels)
    test_features = pca.transform(test_pixels)
    svm = SVC(kernel="rbf", class_weight="balanced")
    svm.fit(train_features, faces.target[train])
    expected = faces.target[test]
    predicted = svm.predict(test_features)
    names = faces.target_names
    report = classification_report(expected, predicted, labels=np.arange(len(names)),
                                   target_names=names, zero_division=0)
    variance = pca.explained_variance_ratio_.cumsum()
    # Fit the complete spectrum on training data so the 90% cutoff can exceed 150.
    full_pca = PCA(svd_solver="full").fit(train_pixels)
    full_variance = full_pca.explained_variance_ratio_.cumsum()
    at_90 = int(np.searchsorted(full_variance, 0.90)) + 1
    missed = np.flatnonzero(expected != predicted)
    correct = np.flatnonzero(expected == predicted)
    eigenfaces = pca.components_.reshape(components, *faces.images.shape[1:])

    def visual_stats(group):
        images = test_pixels[group]
        return f"mean brightness {images.mean():.3f}, mean per-image contrast {images.std(axis=1).mean():.3f}"

    comparison = "There were no misclassified images to compare."
    if missed.size and correct.size:
        comparison = (f"Misclassified faces had {visual_stats(missed)}. Correct predictions had "
                      f"{visual_stats(correct)}. These measurements do not establish a cause.")
    elif missed.size:
        comparison = f"All held-out faces were misclassified. They had {visual_stats(missed)}."
    paragraphs = [
        f"The dataset contains {len(indices)} faces across {len(names)} identities. "
        f"Each face has {faces.data.shape[1]} pixels. The stratified split held out {len(test)} faces.",
        f"The first {components} randomized components retained {variance[-1]:.1%} of training variance. "
        f"The full training spectrum reached 90% at {at_90} components.",
        "In the LFW gallery, PC 1 shows broad face brightness, PC 2 shows a side-to-side lighting "
        "gradient, and PC 3 separates the face from the surrounding area. The last three of the "
        "150 components show finer patterns around the eyes, nose, and mouth. An eigenface's sign "
        "can flip without changing its meaning.",
        "Whitening divides each centered projection by the square root of its training eigenvalue. "
        "This puts the retained components on comparable variance scales before the RBF distance calculation.",
        f"The SVM missed {len(missed)} of {len(test)} test faces. {comparison} "
        "In the error gallery, turned faces, highlights on glasses, and a hand covering part of "
        "a face suggest that pose, reflections, and occlusion can shift the pixel projections.",
    ]

    output.mkdir(parents=True, exist_ok=True)
    (output / "classification.txt").write_text(report, encoding="utf-8")
    with PdfPages(output / "lab05_report.pdf") as pdf:
        fig = plt.figure(figsize=(8.3, 11.7))
        fig.text(0.08, 0.94, "Lab 05 | Eigenfaces and face recognition", fontsize=18)
        narrative = "\n\n".join("\n".join(wrap(paragraph, 86)) for paragraph in paragraphs)
        fig.text(0.08, 0.89, narrative, va="top", fontsize=10, linespacing=1.4)
        fig.text(0.08, 0.51, report, va="top", family="monospace", fontsize=9)
        pdf.savefig(fig)
        plt.close(fig)

        fig, ax = plt.subplots(figsize=(9, 4), layout="constrained")
        ax.plot(np.arange(1, len(full_variance) + 1), full_variance, label="Full training spectrum")
        ax.plot(np.arange(1, components + 1), variance, "--", label="Randomized PCA used by SVM")
        ax.axhline(0.90, color="gray", linestyle=":")
        ax.axvline(at_90, color="gray", linestyle=":", label=f"90% at {at_90} components")
        ax.set(xlabel="Number of principal components", ylabel="Cumulative explained variance",
               ylim=(0, 1.02), title="Variance retained by PCA")
        ax.legend()
        fig.savefig(output / "explained_variance.png", dpi=160)
        pdf.savefig(fig)
        plt.close(fig)

        first = np.arange(min(12, components))
        ends = np.unique(np.r_[first[:3], np.arange(max(0, components - 3), components)])
        for selected, title, filename in [
            (first, "Leading eigenfaces", "leading_eigenfaces.png"),
            (ends, "First and last eigenfaces", "early_and_late.png"),
        ]:
            fig = gallery(eigenfaces[selected], [f"PC {i + 1}" for i in selected], title, symmetric=True)
            fig.savefig(output / filename, dpi=140)
            pdf.savefig(fig)
            plt.close(fig)

        if missed.size:
            examples = missed[:12]
            captions = [f"Actual: {names[expected[i]]}\nPredicted: {names[predicted[i]]}" for i in examples]
            fig = gallery(faces.images[test[examples]], captions, "Misclassified held-out faces")
            fig.savefig(output / "misclassified.png", dpi=140)
            pdf.savefig(fig)
            plt.close(fig)
    print(report)
    print(f"90% variance: {at_90} components. PDF: {output / 'lab05_report.pdf'}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, default=Path("lab-output/05"))
    parser.add_argument("--data-home", type=Path, default=Path(".lab-cache/scikit-learn"))
    args = parser.parse_args()
    faces = fetch_lfw_people(data_home=str(args.data_home), min_faces_per_person=70, resize=0.4)
    write_report(faces, args.out, components=150)


if __name__ == "__main__":
    main()
