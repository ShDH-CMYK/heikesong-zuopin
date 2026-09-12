"""Create reproducible browser textures from the supplied Blue PBR maps.

Usage:
    python tools/prepare-blue-textures.py --source /path/to/Blue

The original images remain untouched. The web material uses a 2K JPEG base
color, a renormalized tangent-space normal map, and glTF's ORM channel order.
"""

from __future__ import annotations

import argparse
import hashlib
from io import BytesIO
import json
import math
from pathlib import Path

from PIL import Image


MAP_NAMES = {
    "basecolor": "texture_pbr_20250901.png",
    "normal": "texture_pbr_20250901_normal.png",
    "roughness": "texture_pbr_20250901_roughness.png",
    "metallic": "texture_pbr_20250901_metallic.png",
}


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def resize_map(path: Path, mode: str, size: int) -> Image.Image:
    with Image.open(path) as original:
        return original.convert(mode).resize((size, size), Image.Resampling.LANCZOS)


def normalized_normal_map(source: Path, size: int) -> Image.Image:
    """Resize encoded linear XYZ, then restore each vector to unit length."""
    small = resize_map(source, "RGB", size)
    encoded = small.tobytes()
    result = bytearray(len(encoded))
    for offset in range(0, len(encoded), 3):
        x = encoded[offset] / 127.5 - 1.0
        y = encoded[offset + 1] / 127.5 - 1.0
        z = encoded[offset + 2] / 127.5 - 1.0
        length = math.sqrt(x * x + y * y + z * z)
        if length < 1e-8:
            x, y, z, length = 0.0, 0.0, 1.0, 1.0
        for channel, component in enumerate((x, y, z)):
            result[offset + channel] = max(
                0, min(255, round((component / length + 1.0) * 127.5))
            )
    return Image.frombytes("RGB", (size, size), bytes(result))


def save_basecolor(image: Image.Image, target: Path, max_bytes: int) -> int:
    """Start at quality 94 and reduce only if required by the download budget."""
    for quality in range(94, 29, -1):
        buffer = BytesIO()
        image.save(
            buffer, "JPEG", quality=quality, optimize=True, progressive=True,
            subsampling=0,
        )
        if buffer.tell() <= max_bytes:
            target.write_bytes(buffer.getvalue())
            return quality
    raise ValueError(f"Cannot fit base color in {max_bytes} bytes at 2K")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument(
        "--output", type=Path,
        default=Path(__file__).resolve().parents[1] / "pets" / "blue-textures",
    )
    parser.add_argument("--size", type=int, default=2048)
    parser.add_argument("--max-base-bytes", type=int, default=1_000_000)
    args = parser.parse_args()
    if args.size <= 0 or args.max_base_bytes <= 0:
        parser.error("Texture size and JPEG byte limit must be positive")
    source = args.source.resolve(strict=True)
    originals = {key: source / filename for key, filename in MAP_NAMES.items()}
    for path in originals.values():
        if not path.is_file():
            parser.error(f"Missing input image: {path}")
    original_hashes = {key: digest(path) for key, path in originals.items()}
    args.output.mkdir(parents=True, exist_ok=True)

    basecolor = resize_map(originals["basecolor"], "RGB", args.size)
    jpeg_quality = save_basecolor(
        basecolor, args.output / "basecolor.jpg", args.max_base_bytes,
    )
    normalized_normal_map(originals["normal"], args.size).save(
        args.output / "normal.png", "PNG", optimize=True,
    )
    roughness = resize_map(originals["roughness"], "L", args.size)
    metallic = resize_map(originals["metallic"], "L", args.size)
    orm = Image.merge(
        "RGB", (Image.new("L", (args.size, args.size), 255), roughness, metallic),
    )
    orm.save(args.output / "orm.png", "PNG", optimize=True)

    outputs = []
    for filename in ("basecolor.jpg", "normal.png", "orm.png"):
        path = args.output / filename
        with Image.open(path) as image:
            outputs.append({
                "file": filename, "width": image.width, "height": image.height,
                "mode": image.mode, "bytes": path.stat().st_size,
                "sha256": digest(path),
            })
    for key, path in originals.items():
        if digest(path) != original_hashes[key]:
            raise RuntimeError(f"Source texture changed during conversion: {path}")
    print(json.dumps({
        "source_hashes": original_hashes,
        "size": args.size,
        "basecolor_jpeg_quality": jpeg_quality,
        "basecolor_color_space": "sRGB",
        "normal_color_space": "Non-Color; tangent-space XYZ renormalized",
        "orm_color_space": "Non-Color",
        "orm_channels": {"R": "255 (no baked AO)", "G": "roughness", "B": "metallic"},
        "source_files_unchanged": True,
        "outputs": outputs,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
