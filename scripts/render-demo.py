"""Assemble a silent walkthrough from genuine browser captures and a manifest.

Optional authoring tool only: Pillow + imageio-ffmpeg. No app runtime dependency.
Captures are held on screen; this is not presented as an uninterrupted recording.
"""
import argparse
import json
import os
from pathlib import Path
import subprocess
import sys
import textwrap

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "artifacts" / "video-tools"))
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--frames", type=Path, default=ROOT / "artifacts/demo/frames")
parser.add_argument("--output", type=Path, default=ROOT / "artifacts/demo/skyclaim-demo.mp4")
args = parser.parse_args()
frames = args.frames.resolve()
manifest = json.loads((frames / "manifest.json").read_text(encoding="utf-8"))
output = args.output.resolve()
output.parent.mkdir(parents=True, exist_ok=True)
rendered = output.parent / "rendered"
rendered.mkdir(exist_ok=True)
font_dir = Path(os.environ.get("WINDIR", "C:/Windows")) / "Fonts"
def font(size):
    try:
        return ImageFont.truetype(str(font_dir / "arial.ttf"), size)
    except OSError:
        return ImageFont.load_default(size=size)

concat = []
seconds = 0
for index, item in enumerate(manifest):
    source = (frames / item["file"]).resolve()
    if not source.is_relative_to(frames) or source.suffix.lower() not in {".jpg", ".png"}:
        raise ValueError("Manifest contains an unexpected frame path")
    duration = float(item["seconds"])
    if not 1 <= duration <= 20:
        raise ValueError("Frame duration must be between 1 and 20 seconds")
    screen = Image.open(source).convert("RGB")
    screen.thumbnail((1280, 720), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (1280, 832), "#101d33")
    canvas.paste(screen, ((1280 - screen.width) // 2, 112 + (720 - screen.height) // 2))
    draw = ImageDraw.Draw(canvas)
    draw.text((28, 10), "SKYCLAIM / CAPTURED WALKTHROUGH / LOCAL DEMO / ILLUSTRATIVE INPUTS", font=font(12), fill="#d3b779")
    draw.text((28, 31), item["title"], font=font(25), fill="#faf7f0")
    draw.text((28, 69), "\n".join(textwrap.wrap(item["caption"], width=118)), font=font(17), fill="#ccd5e3", spacing=3)
    filename = f"frame-{index:02d}.png"
    canvas.save(rendered / filename)
    concat.extend([f"file '{filename}'", f"duration {duration}"])
    seconds += duration
concat.append(f"file 'frame-{len(manifest) - 1:02d}.png'")
(rendered / "frames.ffconcat").write_text("\n".join(concat) + "\n", encoding="utf-8")
command = [imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-hide_banner", "-loglevel", "error",
           "-f", "concat", "-safe", "1", "-i", "frames.ffconcat", "-t", str(seconds),
           "-r", "24", "-c:v", "libx264", "-preset", "medium", "-crf", "20",
           "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(output)]
subprocess.run(command, cwd=rendered, check=True)
metadata = {"file": output.name, "durationSeconds": seconds, "frames": len(manifest),
            "dimensions": "1280x832", "audio": False,
            "method": "Edited sequence of actual browser captures; not continuous screen recording.",
            "originalCaptureManifest": str(frames.relative_to(ROOT) / "manifest.json")}
(output.parent / "video-evidence.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
print(json.dumps(metadata))
