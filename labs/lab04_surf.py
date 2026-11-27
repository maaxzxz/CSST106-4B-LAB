"""Compare rotation-aware SURF, upright SURF, SIFT and ORB on two images."""

import argparse
import csv
from pathlib import Path
from time import perf_counter

import cv2 as cv


def compare(name, detector, norm, first, second, output):
    started = perf_counter()
    keypoints_a, descriptors_a = detector.detectAndCompute(first, None)
    keypoints_b, descriptors_b = detector.detectAndCompute(second, None)
    features_ms = (perf_counter() - started) * 1000
    started = perf_counter()
    good = []
    if descriptors_a is not None and descriptors_b is not None and len(descriptors_b) >= 2:
        pairs = cv.BFMatcher(norm).knnMatch(descriptors_a, descriptors_b, k=2)
        good = [pair[0] for pair in pairs if len(pair) == 2 and pair[0].distance < 0.75 * pair[1].distance]
    match_ms = (perf_counter() - started) * 1000
    keypoints = cv.drawKeypoints(first, keypoints_a, None, (255, 100, 20),
                                 cv.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
    matches = cv.drawMatches(first, keypoints_a, second, keypoints_b,
                             sorted(good, key=lambda match: match.distance)[:60], None,
                             flags=cv.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)
    cv.imwrite(str(output / f"{name}_keypoints.png"), keypoints)
    cv.imwrite(str(output / f"{name}_matches.png"), matches)
    return name, len(keypoints_a), len(keypoints_b), len(good), round(features_ms, 2), round(match_ms, 2)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("first", type=Path)
    parser.add_argument("second", type=Path)
    parser.add_argument("--thresholds", nargs="+", type=float, default=[200, 400, 800])
    parser.add_argument("--out", type=Path, default=Path("lab-output/04"))
    args = parser.parse_args()
    if any(not 0 < value < float("inf") for value in args.thresholds):
        parser.error("Hessian thresholds must be finite and positive.")

    first, second = (cv.imread(str(path), cv.IMREAD_GRAYSCALE) for path in (args.first, args.second))
    if first is None or second is None:
        parser.error("Supply two readable images of the same scene or object.")
    args.out.mkdir(parents=True, exist_ok=True)

    try:
        surf = cv.xfeatures2d.SURF_create
        surf(hessianThreshold=args.thresholds[0])
    except (AttributeError, cv.error) as exc:
        print("SURF requires an OpenCV + opencv_contrib build with OPENCV_ENABLE_NONFREE=ON.")
        print(f"OpenCV reported: {exc}")
        surf = None

    rows = []
    if surf is not None:
        for threshold in sorted(set(args.thresholds)):
            detector = surf(hessianThreshold=threshold)
            rows.append(compare(f"SURF_{threshold:g}", detector, cv.NORM_L2, first, second, args.out))
        threshold = 400 if 400 in args.thresholds else args.thresholds[0]
        upright = surf(hessianThreshold=threshold, upright=True)
        rows.append(compare(f"U-SURF_{threshold:g}", upright, cv.NORM_L2, first, second, args.out))
    rows.append(compare("SIFT", cv.SIFT_create(), cv.NORM_L2, first, second, args.out))
    rows.append(compare("ORB", cv.ORB_create(), cv.NORM_HAMMING, first, second, args.out))

    header = ("method", "keypoints_first", "keypoints_second", "ratio_matches", "features_ms", "match_ms")
    with (args.out / "comparison.csv").open("w", newline="", encoding="utf-8") as report:
        csv.writer(report).writerows([header, *rows])
    for name, first_count, second_count, matches, detect_ms, match_ms in rows:
        print(f"{name}: {first_count}/{second_count} keypoints, {matches} matches, "
              f"{detect_ms:.2f} ms features, {match_ms:.2f} ms matching")
    return 0 if surf is not None else 2


if __name__ == "__main__":
    raise SystemExit(main())
