"""Run YOLO11 webcam prediction, custom training, and held-out evaluation."""

import argparse
import json
import os
import random
from pathlib import Path
from time import perf_counter


def make_demo_dataset(root):
    """Generate a small annotated dataset with one circle and one rectangle per image."""
    from PIL import Image, ImageDraw

    root = root.resolve()
    rng = random.Random(106)
    size = 160
    for split, count in (("train", 64), ("val", 16), ("test", 16)):
        images = root / "images" / split
        labels = root / "labels" / split
        images.mkdir(parents=True, exist_ok=True)
        labels.mkdir(parents=True, exist_ok=True)
        for i in range(count):
            image = Image.new("RGB", (size, size), tuple(rng.randint(25, 65) for _ in range(3)))
            draw = ImageDraw.Draw(image)
            sides = [8, 86]
            rng.shuffle(sides)
            annotations = []
            for class_id, left in enumerate(sides):
                x = left + rng.randint(0, 16)
                y = rng.randint(10, 98)
                width, height = rng.randint(28, 49), rng.randint(28, 49)
                box = (x, y, x + width - 1, y + height - 1)
                shape = draw.ellipse if class_id == 0 else draw.rectangle
                shape(box, fill=tuple(rng.randint(150, 255) for _ in range(3)))
                annotations.append(f"{class_id} {(x + width / 2) / size:.6f} "
                                   f"{(y + height / 2) / size:.6f} {width / size:.6f} {height / size:.6f}")
            filename = f"shapes_{i:03d}"
            image.save(images / f"{filename}.png")
            (labels / f"{filename}.txt").write_text("\n".join(annotations) + "\n", encoding="utf-8")
    config = root / "data.yaml"
    config.write_text(f"path: {json.dumps(root.as_posix(), ensure_ascii=False)}\n"
                      "train: images/train\nval: images/val\ntest: images/test\n"
                      "names: [ellipse, rectangle]\n", encoding="utf-8")
    return config


def webcam(model, args):
    import cv2 as cv

    camera = cv.VideoCapture(args.camera)
    window = "Lab 06 | YOLO11 (Q/Esc to stop)"
    window_open = False
    try:
        if not camera.isOpened():
            raise SystemExit(f"Could not open webcam {args.camera}.")
        while True:
            ok, frame = camera.read()
            if not ok:
                raise SystemExit("Could not read a webcam frame.")
            started = perf_counter()
            result = model.predict(frame, conf=args.conf, imgsz=args.imgsz,
                                   device=args.device, verbose=False)[0]
            shown = result.plot()
            fps = 1 / (perf_counter() - started)
            cv.putText(shown, f"{fps:.1f} FPS (inference + drawing)", (10, 28),
                       cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
            cv.imshow(window, shown)
            window_open = True
            if (cv.waitKey(1) & 0xFF) in (ord("q"), 27):
                break
    finally:
        camera.release()
        if window_open:
            cv.destroyAllWindows()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    demo = commands.add_parser("demo-data", help="Create an annotated shape dataset")
    demo.add_argument("--out", type=Path, default=Path("lab-output/06/shapes"))
    for command in ("webcam", "predict", "train", "val"):
        mode = commands.add_parser(command)
        mode.add_argument("--weights", default="yolo11n.pt")
        mode.add_argument("--device", default="cpu")
        mode.add_argument("--imgsz", type=int, default=640)
        mode.add_argument("--out", type=Path, default=Path("lab-output/06"))
        if command in ("train", "val"):
            mode.add_argument("--data", type=Path, required=True)
            mode.add_argument("--batch", type=int, default=8)
        if command in ("predict", "webcam"):
            mode.add_argument("--conf", type=float, default=0.25)
        if command == "webcam":
            mode.add_argument("--camera", type=int, default=0)
        elif command == "predict":
            mode.add_argument("source", type=Path)
        elif command == "train":
            mode.add_argument("--epochs", type=int, default=100)
        else:
            mode.add_argument("--split", choices=["val", "test"], default="val")
    args = parser.parse_args()
    if args.command == "demo-data":
        print(make_demo_dataset(args.out))
        return

    if hasattr(args, "data") and not args.data.is_file():
        parser.error(f"Dataset YAML was not found: {args.data}")
    if args.command == "predict" and not args.source.exists():
        parser.error(f"Prediction input was not found: {args.source}")
    os.environ.setdefault("YOLO_CONFIG_DIR", str(Path(".lab-cache/ultralytics").resolve()))
    from ultralytics import YOLO

    model = YOLO(args.weights)
    if args.command == "webcam":
        webcam(model, args)
        return

    project = str(args.out.resolve())
    common = dict(device=args.device, imgsz=args.imgsz, project=project)
    if args.command == "predict":
        results = model.predict(str(args.source), conf=args.conf, save=True, save_txt=True,
                                save_conf=True, name="predict", stream=True, **common)
        for result in results:
            print(f"{result.path}: {len(result.boxes)} detections ({result.speed['inference']:.1f} ms)")
    elif args.command == "train":
        model.train(data=str(args.data.resolve()), epochs=args.epochs, batch=args.batch,
                    workers=0, seed=106, name="train", **common)
        print(f"Best weights: {model.trainer.best}")
    else:
        metrics = model.val(data=str(args.data.resolve()), split=args.split, batch=args.batch,
                            workers=0, name=f"eval_{args.split}", **common)
        summary = dict(split=args.split, precision=float(metrics.box.mp), recall=float(metrics.box.mr),
                       mAP50=float(metrics.box.map50), mAP50_95=float(metrics.box.map))
        report = Path(metrics.save_dir) / "metrics.json"
        report.write_text(json.dumps(summary, indent=2), encoding="utf-8")
        print(report.read_text(encoding="utf-8"))


if __name__ == "__main__":
    main()
